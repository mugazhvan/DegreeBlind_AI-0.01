import json
import logging
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.models import JobMatch, Resume, ParsedResume, Report, Analysis, ATSScore
from app.schemas.job_match import JobMatchResponse
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)


class JobMatchService:
    async def analyze_match(
        self, db: AsyncSession, user_id: int, job_title: str, job_description: str,
        resume_id: Optional[int] = None, github_report_id: Optional[int] = None
    ) -> JobMatchResponse:
        """
        Analyzes candidate profile against a job description.
        """
        # Fetch the candidate profile
        # 1. Parsed Resume
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

        # 2. GitHub Engineering Analysis
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
        prompt_path = "app/prompts/job_match.txt"
        response_json = await llm_service.call_llm(
            prompt_path=prompt_path,
            schema=JobMatchResponse,
            candidate_profile=json.dumps(candidate_profile, indent=2),
            job_description=f"Title: {job_title}\n\nDescription: {job_description}"
        )

        # Save to DB
        job_match = JobMatch(
            user_id=user_id,
            job_title=job_title,
            job_description=job_description,
            match_score=response_json.get("match_percentage", 0),
            report_data=response_json
        )
        db.add(job_match)
        await db.commit()
        await db.refresh(job_match)

        return JobMatchResponse(**response_json)


job_match_service = JobMatchService()
