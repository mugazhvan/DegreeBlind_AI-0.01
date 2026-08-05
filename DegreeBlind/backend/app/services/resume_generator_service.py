import json
import logging
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.models import Resume, ParsedResume, Report, CareerIntelligence, Analysis
from app.schemas.resume_gen import GeneratedResumeResponse
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)


class ResumeGeneratorService:
    async def generate_resume(
        self, db: AsyncSession, user_id: int, target_role: str, theme: str = "modern"
    ) -> GeneratedResumeResponse:
        """
        Generates a tailored resume for the user.
        """
        # Fetch the candidate profile
        # 1. Parsed Resume
        stmt = select(Resume).where(Resume.user_id == user_id, Resume.status == "completed").order_by(Resume.id.desc()).limit(1)
        result = await db.execute(stmt)
        resume = result.scalar_one_or_none()
        
        parsed_data = {}
        if resume:
            stmt = select(ParsedResume).where(ParsedResume.resume_id == resume.id)
            parsed_resume = (await db.execute(stmt)).scalar_one_or_none()
            if parsed_resume:
                parsed_data = parsed_resume.parsed_json

        # 2. GitHub Engineering Analysis
        stmt = (
            select(Report.report_json)
            .join(Report.analysis)
            .where(Analysis.user_id == user_id, Analysis.status == "completed")
            .order_by(Report.id.desc())
            .limit(1)
        )
        engineering_data = (await db.execute(stmt)).scalar_one_or_none() or {}
        
        # 3. Career Intelligence
        stmt = select(CareerIntelligence.report_data).where(CareerIntelligence.user_id == user_id).order_by(CareerIntelligence.id.desc()).limit(1)
        career_data = (await db.execute(stmt)).scalar_one_or_none() or {}

        candidate_profile = {
            "resume_data": parsed_data,
            "engineering_analysis": engineering_data,
            "career_intelligence": career_data
        }

        # Call LLM
        prompt_path = "app/prompts/resume_generator.txt"
        response_json = await llm_service.call_llm(
            prompt_path=prompt_path,
            schema=GeneratedResumeResponse,
            candidate_profile=json.dumps(candidate_profile, indent=2),
            target_role=target_role,
            theme=theme
        )
        
        return GeneratedResumeResponse(**response_json)

resume_generator_service = ResumeGeneratorService()
