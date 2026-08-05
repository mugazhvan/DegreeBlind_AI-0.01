from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException

from app.db.models import User, Resume, ParsedResume, Analysis, Report, CrossReference
from app.services.llm_service import llm_service

class CrossRefService:
    async def analyze_user(self, db: AsyncSession, user_id: int, resume_id: int = None) -> dict:
        """
        Cross-references a specific parsed resume (or the user's latest) with all their GitHub reports.
        """
        # 1. Fetch Resume & ParsedResume
        if resume_id:
            stmt = select(Resume).where(Resume.id == resume_id, Resume.status == "completed")
        else:
            stmt = select(Resume).where(Resume.user_id == user_id, Resume.status == "completed").order_by(Resume.created_at.desc()).limit(1)
            
        resume_result = await db.execute(stmt)
        resume = resume_result.scalar_one_or_none()
        
        if not resume:
            raise HTTPException(status_code=400, detail="User has no completed resumes uploaded.")
            
        stmt = select(ParsedResume).where(ParsedResume.resume_id == resume.id)
        parsed_result = await db.execute(stmt)
        parsed_resume = parsed_result.scalar_one_or_none()
        
        if not parsed_resume:
            raise HTTPException(status_code=400, detail="User's resume has not been successfully parsed yet.")
            
        resume_context = parsed_resume.parsed_json
        
        # 2. Fetch all GitHub Analysis Reports for the User
        stmt = select(Report).join(Analysis).where(Analysis.user_id == user_id, Analysis.status == "completed", Analysis.is_deleted == False)
        report_results = await db.execute(stmt)
        reports = report_results.scalars().all()
        
        if not reports:
            raise HTTPException(status_code=400, detail="User has no completed GitHub repository analyses.")
            
        github_context = [report.report_json for report in reports]
        
        # 3. Call LLM
        cross_ref_json = await llm_service.cross_reference(resume_context, github_context)
        
        # 4. Save to DB
        cross_ref = CrossReference(
            user_id=user_id,
            consistency_score=cross_ref_json.get("consistency_score", 0),
            credibility_score=cross_ref_json.get("credibility_score", 0),
            trust_score=cross_ref_json.get("trust_score", 0),
            report_data=cross_ref_json
        )
        
        db.add(cross_ref)
        await db.commit()
        await db.refresh(cross_ref)
        
        return cross_ref.report_data

crossref_service = CrossRefService()
