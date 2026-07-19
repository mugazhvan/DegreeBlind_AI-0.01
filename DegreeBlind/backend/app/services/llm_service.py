import os
import json
import httpx
import logging
from typing import Dict, Any
from pathlib import Path
from pydantic import ValidationError
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.core.config import settings
from app.schemas.core import NemotronResponseSchema

logger = logging.getLogger(__name__)

class LLMProvider:
    async def analyze(self, repo_context: Dict[str, Any]) -> NemotronResponseSchema:
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

    def _build_context(self, context: Dict[str, Any]) -> str:
        return self.prompt_template.format(
            repo_name=context.get("name", "Unknown"),
            owner=context.get("owner", "Unknown"),
            description=context.get("description", "No description"),
            primary_language=context.get("language", "Unknown"),
            stars=context.get("stars", 0),
            forks=context.get("forks", 0),
            open_issues=context.get("open_issues", 0),
            languages=json.dumps(context.get("languages", {}), indent=2),
            tree=json.dumps(context.get("tree", []), indent=2),
            commits=json.dumps(context.get("commits", []), indent=2),
            readme=context.get("readme", "")[:3000]  # truncate readme to avoid token limits
        )

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
            # "response_format": {"type": "json_object"} # some nvidia models support this
        }

        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(f"{self.base_url}/chat/completions", headers=headers, json=payload)
            response.raise_for_status()
            
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            return content

    def _clean_json(self, content: str) -> str:
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        elif content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        return content.strip()

    async def analyze(self, repo_context: Dict[str, Any]) -> NemotronResponseSchema:
        prompt = self._build_context(repo_context)
        raw_response = await self._call_api(prompt)
        
        print("=== RAW NVIDIA API RESPONSE ===")
        print(raw_response)
        print("===============================")
        
        cleaned_json = self._clean_json(raw_response)
        
        try:
            parsed_json = json.loads(cleaned_json)
            print("=== PARSED JSON ===")
            print(json.dumps(parsed_json, indent=2))
            print("===================")
            
            validated_response = NemotronResponseSchema(**parsed_json)
            return validated_response
        except json.JSONDecodeError as e:
            logger.error(f"Failed to decode JSON. Error: {str(e)}\nRaw Response: {raw_response}")
            raise ValueError(f"JSONDecodeError: {str(e)} | Raw: {raw_response}")
        except ValidationError as e:
            logger.error(f"Validation Error: {e.errors()}\nRaw Response: {raw_response}")
            print("=== VALIDATION ERRORS ===")
            print(e.json())
            print("=========================")
            raise ValueError(f"ValidationError: {e.errors()} | Raw: {raw_response}")


# Provider factory
def get_llm_provider() -> LLMProvider:
    if settings.AI_PROVIDER.lower() == "nemotron":
        return NemotronProvider()
    raise ValueError(f"Unsupported AI provider: {settings.AI_PROVIDER}")

llm_service = get_llm_provider()
