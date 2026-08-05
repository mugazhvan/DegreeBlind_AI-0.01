import json
import logging
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.models import LearningRoadmap, Resume, ParsedResume, Report, Analysis, ATSScore
from app.schemas.learning import LearningRoadmapResponse
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)


class LearningService:
    async def generate_roadmap(
        self, db: AsyncSession, user_id: int, target_role: str,
        resume_id: Optional[int] = None, github_report_id: Optional[int] = None
    ) -> LearningRoadmapResponse:
        """
        Generates a 30/60/90-day learning roadmap based on candidate profile.
        """
        # Fetch the candidate profile
        if resume_id:
            stmt = select(Resume).where(Resume.id == resume_id, Resume.user_id == user_id)
        else:
            stmt = select(Resume).where(Resume.user_id == user_id, Resume.status == "completed").order_by(Resume.id.desc()).limit(1)
        result = await db.execute(stmt)
        resume = result.scalar_one_or_none()
        
        parsed_data = {}
        ats_data = {}
        if resume:
            stmt = select(ParsedResume).where(ParsedResume.resume_id == resume.id)
            parsed_resume = (await db.execute(stmt)).scalar_one_or_none()
            if parsed_resume:
                parsed_data = parsed_resume.parsed_json

            stmt_ats = select(ATSScore).where(ATSScore.resume_id == resume.id).order_by(ATSScore.id.desc()).limit(1)
            ats_res = (await db.execute(stmt_ats)).scalar_one_or_none()
            if ats_res:
                ats_data = {
                    "overall_ats_score": ats_res.overall_score,
                    "ats_analysis_and_deductions": ats_res.score_data
                }

        if github_report_id:
            stmt = select(Report.report_json).join(Report.analysis).where(Report.id == github_report_id, Analysis.user_id == user_id)
        else:
            stmt = (
                select(Report.report_json)
                .join(Report.analysis)
                .where(Analysis.user_id == user_id, Analysis.status == "completed")
                .order_by(Report.id.desc())
                .limit(1)
            )
        engineering_data = (await db.execute(stmt)).scalar_one_or_none() or {}

        candidate_profile = {
            "resume_data": parsed_data,
            "ats_compatibility_evaluation": ats_data,
            "github_developer_portfolio_report": engineering_data
        }

        # Call LLM
        prompt_path = "app/prompts/learning_roadmap.txt"
        response_json = await llm_service.call_llm(
            prompt_path=prompt_path,
            schema=LearningRoadmapResponse,
            candidate_profile=json.dumps(candidate_profile, indent=2),
            target_role=target_role
        )

        # Save to DB
        roadmap = LearningRoadmap(
            user_id=user_id,
            target_role=target_role,
            report_data=response_json
        )
        db.add(roadmap)
        await db.commit()
        await db.refresh(roadmap)

        return LearningRoadmapResponse(**response_json)


learning_service = LearningService()
