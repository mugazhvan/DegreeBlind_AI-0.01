import os
import json
import httpx
import logging
from typing import Dict, Any, Type, TypeVar, Optional
from pathlib import Path
from pydantic import ValidationError, BaseModel
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.core.config import settings
from app.services.cache_service import cache_llm_response

T = TypeVar('T', bound=BaseModel)
logger = logging.getLogger(__name__)

class LLMProvider:
    async def analyze(self, repo_context: Dict[str, Any]) -> dict:
        raise NotImplementedError


class NemotronProvider(LLMProvider):
    def __init__(self):
        self.api_key = settings.NVIDIA_API_KEY.get_secret_value()
        self.base_url = "https://integrate.api.nvidia.com/v1"
        self.model = settings.AI_MODEL
        self.prompt_template = self._load_prompt("degree_blind.txt")

    def _load_prompt(self, filename: str) -> str:
        prompt_path = Path(__file__).parent.parent / "prompts" / filename
        try:
            with open(prompt_path, "r", encoding="utf-8") as f:
                return f.read()
        except FileNotFoundError:
            logger.error(f"Prompt file not found: {prompt_path}")
            raise RuntimeError(f"Required prompt file {filename} is missing.")

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.HTTPError, ValueError))
    )
    async def _call_api(self, prompt: str) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2,
            "max_tokens": 4096,
        }

        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
            response.raise_for_status()
            
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            return content

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type((httpx.HTTPError, ValueError))
    )
    async def _call_vision_api(self, prompt: str, image_b64: str, mime_type: str = "image/jpeg") -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        payload = {
            "model": "meta/llama-3.2-11b-vision-instruct",
            "messages": [{
                "role": "user", 
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{image_b64}"}}
                ]
            }],
            "temperature": 0.2,
            "max_tokens": 4096,
        }

        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
            response.raise_for_status()
            
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            return content

    @retry(
        stop=stop_after_attempt(2),
        wait=wait_exponential(multiplier=1, min=2, max=5),
        retry=retry_if_exception_type((httpx.HTTPError, ValueError))
    )
    async def generate_image(self, prompt: str) -> str:
        """Calls NVIDIA NIM Image Generation API (Flux.1-schnell) and returns Base64 string."""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        # NIM expects typical OpenAI image generation schema payload
        payload = {
            "model": "black-forest-labs/flux.1-schnell",
            "prompt": prompt,
            "response_format": "b64_json"
        }

        # Flux requires high timeout sometimes on cold boot
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(f"{self.base_url}/images/generations", headers=headers, json=payload)
            response.raise_for_status()
            
            data = response.json()
            b64_data = data["data"][0].get("b64_json")
            if not b64_data:
                raise ValueError("No b64_json returned in image generation response.")
            return b64_data

    def _clean_json(self, content: str) -> str:
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        elif content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        return content.strip()

    @cache_llm_response
    async def analyze(self, repo_context: dict) -> dict:
        """
        Analyzes a GitHub repository context using Nemotron LLM and returns the structured JSON.
        """
        prompt_template = self._load_prompt("engineering_intelligence.txt")
        prompt = prompt_template.format(repo_context=str(repo_context)[:30000]) # truncated to fit tokens
        raw_response = await self._call_api(prompt)
        
        cleaned_json = self._clean_json(raw_response)
        
        try:
            parsed_json = json.loads(cleaned_json)
            from app.schemas.engineering import EngineeringIntelligenceResponse
            validated_response = EngineeringIntelligenceResponse(**parsed_json)
            return validated_response.model_dump()
        except Exception as e:
            logger.error(f"Failed to parse LLM output: {e}\nRaw Response: {raw_response}")
            raise ValueError(f"LLM Parsing failed: {e}")

    @cache_llm_response
    async def parse_resume(self, raw_text: str) -> dict:
        """Parses raw resume text into structured JSON matching ParsedResumeResponse"""
        prompt_template = self._load_prompt("resume_parser.txt")
        prompt = prompt_template.format(resume_text=raw_text[:8000]) # truncated to fit tokens
        raw_response = await self._call_api(prompt)
        
        cleaned_json = self._clean_json(raw_response)
        try:
            parsed_json = json.loads(cleaned_json)
            from app.schemas.resume import ParsedResumeResponse
            validated = ParsedResumeResponse(**parsed_json)
            return validated.model_dump()
        except Exception as e:
            logger.error(f"Failed to parse resume output: {e}\nRaw Response: {raw_response}")
            raise ValueError(f"Resume parsing failed: {e}")

    @cache_llm_response
    async def extract_text_from_image(self, image_b64: str, mime_type: str = "image/jpeg") -> str:
        """Uses a blazing fast Vision model (Llama 3.2 11B Vision) to extract raw text from an image."""
        prompt = "Extract all the text visible in this image accurately. Return only the raw text, with no conversational filler, reasoning, or markdown blocks."
        raw_response = await self._call_vision_api(prompt, image_b64, mime_type)
        return raw_response.strip()

    @cache_llm_response
    async def score_resume_ats(self, raw_text: str, job_description: str = "") -> dict:
        """Scores a resume against a job description returning ATSScoreResponse schema."""
        prompt_template = self._load_prompt("ats_scorer.txt")
        prompt = prompt_template.format(
            job_description=job_description[:4000] if job_description else "None provided.",
            resume_text=raw_text[:8000]
        )
        raw_response = await self._call_api(prompt)
        
        cleaned_json = self._clean_json(raw_response)
        try:
            parsed_json = json.loads(cleaned_json)
            from app.schemas.ats import ATSScoreResponse
            validated = ATSScoreResponse(**parsed_json)
            return validated.model_dump()
        except Exception as e:
            logger.error(f"Failed to score resume: {e}\nRaw Response: {raw_response}")
            raise ValueError(f"ATS Scoring failed: {e}")

    @cache_llm_response
    async def cross_reference(self, resume_context: dict, github_context: list[dict]) -> dict:
        """Cross-references a candidate's resume against their GitHub repos returning CrossReferenceResponse schema."""
        prompt_template = self._load_prompt("cross_reference.txt")
        prompt = prompt_template.format(
            resume_context=json.dumps(resume_context)[:8000],
            github_context=json.dumps(github_context)[:30000]
        )
        raw_response = await self._call_api(prompt)
        
        cleaned_json = self._clean_json(raw_response)
        try:
            parsed_json = json.loads(cleaned_json)
            from app.schemas.crossref import CrossReferenceResponse
            validated = CrossReferenceResponse(**parsed_json)
            return validated.model_dump()
        except Exception as e:
            logger.error(f"Failed to cross-reference: {e}\nRaw Response: {raw_response}")
            raise ValueError(f"Cross-Reference failed: {e}")

    async def call_llm(self, prompt_path: str, schema: Type[T], **kwargs) -> dict:
        """
        Generic LLM call used by various services. Loads a prompt template from 
        the given path, formats it with kwargs, calls the API, and validates the 
        JSON output against the provided Pydantic schema.
        """
        # Support services passing "app/prompts/filename.txt" by extracting just the filename
        filename = prompt_path.split("/")[-1]
        prompt_template = self._load_prompt(filename)
            
        prompt = prompt_template.format(**kwargs)
        raw_response = await self._call_api(prompt)
        
        cleaned_json = self._clean_json(raw_response)
        try:
            parsed_json = json.loads(cleaned_json)
            validated = schema(**parsed_json)
            return validated.model_dump()
        except Exception as e:
            logger.error(f"Failed to parse generic LLM output: {e}\nRaw Response: {raw_response}")
            raise ValueError(f"LLM Parsing failed: {e}")


# Provider factory
def get_llm_provider() -> LLMProvider:
    if settings.AI_PROVIDER.lower() == "nemotron":
        return NemotronProvider()
    raise ValueError(f"Unsupported AI provider: {settings.AI_PROVIDER}")

llm_service = get_llm_provider()
