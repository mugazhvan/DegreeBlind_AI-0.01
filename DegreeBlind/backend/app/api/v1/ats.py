from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import Optional

from app.db.session import get_db
from app.db.models import Resume, ATSScore, User
from app.api.deps import get_current_user_optional
from app.services.ats_scorer import ats_scorer_service

router = APIRouter()

class ScoreRequest(BaseModel):
    resume_id: int
    job_description: Optional[str] = ""

@router.post("/score")
async def trigger_ats_score(
    request: ScoreRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user_optional)
):
    """
    Trigger the ATS Scoring Engine for a specific resume.
    Optionally pass a job_description to score against.
    Returns the scored result synchronously (in a real prod app, you might want this to be a background task if it takes >10s).
    """
    result = await db.execute(select(Resume).where(Resume.id == request.resume_id))
    resume = result.scalar_one_or_none()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    try:
        score = await ats_scorer_service.score_resume(request.resume_id, request.job_description)
        return {
            "message": "Scoring complete",
            "overall_score": score.overall_score,
            "data": score.score_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{resume_id}")
async def get_ats_score(resume_id: int, db: AsyncSession = Depends(get_db)):
    """Retrieve an existing ATS score for a resume."""
    result = await db.execute(select(ATSScore).where(ATSScore.resume_id == resume_id))
    score = result.scalar_one_or_none()
    
    if not score:
        raise HTTPException(status_code=404, detail="Score not found. Please trigger a score first.")
        
    return {
        "overall_score": score.overall_score,
        "data": score.score_data
    }
