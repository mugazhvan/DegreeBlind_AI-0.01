import json
import logging
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.models import CareerIntelligence, Resume, ParsedResume, ATSScore, CrossReference, Report, Analysis
from app.schemas.career import CareerIntelligenceResponse
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)

class CareerService:
    async def generate_career_intelligence(
        self, db: AsyncSession, user_id: int
    ) -> CareerIntelligenceResponse:
        """
        Aggregates data from Resume, ATS, GitHub Analysis, and CrossRef
        to generate a unified Career Intelligence Report.
        """
        # Fetch the most recent completed data for the user
        
        # 1. Parsed Resume & ATS Score
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
            
            stmt = select(ATSScore).where(ATSScore.resume_id == resume.id)
            ats_score = (await db.execute(stmt)).scalar_one_or_none()
            if ats_score:
                ats_data = ats_score.score_data
                
        # 2. GitHub Engineering Analysis
        stmt = (
            select(Report.report_json)
            .join(Report.analysis)
            .where(Analysis.user_id == user_id, Analysis.status == "completed")
            .order_by(Report.id.desc())
            .limit(1)
        )
        engineering_data = (await db.execute(stmt)).scalar_one_or_none() or {}
        
        # 3. Cross-Reference Report
        stmt = select(CrossReference.report_data).where(CrossReference.user_id == user_id).order_by(CrossReference.id.desc()).limit(1)
        crossref_data = (await db.execute(stmt)).scalar_one_or_none() or {}
        
        # Aggregate the profile
        candidate_profile = {
            "resume_data": parsed_data,
            "ats_analysis": ats_data,
            "engineering_analysis": engineering_data,
            "cross_reference_analysis": crossref_data
        }
        
        # Call LLM
        prompt_path = "app/prompts/career_intelligence.txt"
        response_json = await llm_service.call_llm(
            prompt_path=prompt_path,
            schema=CareerIntelligenceResponse,
            candidate_profile=json.dumps(candidate_profile, indent=2)
        )
        
        # Save to DB
        career_report = CareerIntelligence(
            user_id=user_id,
            career_score=response_json.get("career_score", 0),
            report_data=response_json
        )
        db.add(career_report)
        await db.commit()
        await db.refresh(career_report)
        
        return CareerIntelligenceResponse(**response_json)

    async def get_career_intelligence(
        self, db: AsyncSession, user_id: int
    ) -> Optional[CareerIntelligenceResponse]:
        stmt = select(CareerIntelligence).where(CareerIntelligence.user_id == user_id).order_by(CareerIntelligence.id.desc()).limit(1)
        result = await db.execute(stmt)
        record = result.scalar_one_or_none()
        
        if record:
            return CareerIntelligenceResponse(**record.report_data)
        return None

career_service = CareerService()
