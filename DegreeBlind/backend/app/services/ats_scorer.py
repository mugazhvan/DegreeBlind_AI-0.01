import hashlib
import logging
import re
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import json
import os

from app.db.models import Resume, ATSScore, ParsedResume
from app.services.llm_service import llm_service
from app.services.document_parser import document_parser
from app.db.session import AsyncSessionLocal

logger = logging.getLogger(__name__)

class ATSScorerService:
    async def get_raw_text(self, resume: Resume) -> str:
        """Helper to get text, using ParsedResume from DB."""
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(ParsedResume).where(ParsedResume.resume_id == resume.id))
            parsed = result.scalar_one_or_none()
            if parsed and parsed.parsed_json:
                return json.dumps(parsed.parsed_json)
        
        raise ValueError(f"No parsed data found for resume {resume.id}. Please ensure the document is parsed first.")

    def _heuristic_checks(self, raw_text: str) -> dict:
        """
        Runs fast deterministic checks.
        Returns deductions to be subtracted.
        """
        deductions = []
        improvements = []
        words = raw_text.split()
        word_count = len(words)
        
        # 1. Length Check
        if word_count < 200:
            deductions.append({
                "metric": "Length",
                "deduction_amount": 10,
                "reason": f"Resume is too short ({word_count} words). ATS prefers 300-800 words."
            })
            improvements.append({
                "category": "Length",
                "suggestion": "Expand on your experience and add more measurable achievements."
            })
        elif word_count > 1000:
            deductions.append({
                "metric": "Length",
                "deduction_amount": 5,
                "reason": f"Resume is very long ({word_count} words) and might be truncated by some systems."
            })
            improvements.append({
                "category": "Length",
                "suggestion": "Trim older experience and focus on the most relevant recent roles."
            })

        # 2. Contact Validation
        has_email = re.search(r'[\w\.-]+@[\w\.-]+', raw_text)
        has_phone = re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', raw_text)
        if not has_email:
            deductions.append({
                "metric": "Contact Information",
                "deduction_amount": 15,
                "reason": "No email address found."
            })
            improvements.append({"category": "Contact Validation", "suggestion": "Add a standard professional email address."})
        if not has_phone:
            deductions.append({
                "metric": "Contact Information",
                "deduction_amount": 10,
                "reason": "No phone number found."
            })
            improvements.append({"category": "Contact Validation", "suggestion": "Add a phone number so recruiters can reach you."})

        return {"deductions": deductions, "improvements": improvements}

    async def score_resume(self, resume_id: int, job_description: str = "") -> ATSScore:
        """Main entry point to score a resume."""
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Resume).where(Resume.id == resume_id))
            resume = result.scalar_one_or_none()
            if not resume:
                raise ValueError("Resume not found")

            jd_hash = hashlib.sha256(job_description.encode('utf-8')).hexdigest() if job_description else None

            # Check if we already scored it against the exact same JD
            existing_result = await db.execute(
                select(ATSScore).where(ATSScore.resume_id == resume_id, ATSScore.job_description_hash == jd_hash)
            )
            existing_score = existing_result.scalar_one_or_none()
            if existing_score:
                return existing_score

            try:
                raw_text = await self.get_raw_text(resume)
                
                # Run Heuristics
                heuristics = self._heuristic_checks(raw_text)
                
                # Run LLM Scoring
                llm_score_data = await llm_service.score_resume_ats(raw_text, job_description)
                
                # Combine deductions and improvements
                llm_score_data['deductions'].extend(heuristics['deductions'])
                llm_score_data['improvements'].extend(heuristics['improvements'])
                
                # Adjust final overall score based on heuristic deductions
                for d in heuristics['deductions']:
                    llm_score_data['overall_score'] -= d['deduction_amount']
                    
                # Floor at 0
                if llm_score_data['overall_score'] < 0:
                    llm_score_data['overall_score'] = 0
                
                # Save to DB
                new_score = ATSScore(
                    resume_id=resume.id,
                    job_description_hash=jd_hash,
                    overall_score=llm_score_data['overall_score'],
                    score_data=llm_score_data
                )
                
                # If there is an old score for this resume, we can either overwrite or delete it.
                # Since unique=True is on resume_id, we MUST delete or overwrite.
                delete_stmt = await db.execute(select(ATSScore).where(ATSScore.resume_id == resume.id))
                old_score = delete_stmt.scalar_one_or_none()
                if old_score:
                    await db.delete(old_score)
                
                db.add(new_score)
                await db.commit()
                await db.refresh(new_score)
                return new_score

            except Exception as e:
                logger.error(f"Error scoring resume {resume_id}: {e}")
                raise

ats_scorer_service = ATSScorerService()
