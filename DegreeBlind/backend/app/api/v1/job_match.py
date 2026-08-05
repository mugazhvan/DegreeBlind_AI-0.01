from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel

from app.api.deps import get_db, get_current_user
from app.db.models import User, JobMatch
from app.schemas.job_match import JobMatchResponse
from app.services.job_match_service import job_match_service

router = APIRouter()


class JobMatchRequest(BaseModel):
    job_title: str
    job_description: str
    resume_id: Optional[int] = None
    github_report_id: Optional[int] = None


@router.post("/analyze", response_model=JobMatchResponse)
async def analyze_job_match(
    request: JobMatchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Analyzes the user's profile against a given job description.
    """
    try:
        report = await job_match_service.analyze_match(
            db, current_user.id, request.job_title, request.job_description, request.resume_id, request.github_report_id
        )
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze job match: {str(e)}")


@router.get("/history", response_model=List[JobMatchResponse])
async def get_job_match_history(
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves past job match analyses for the authenticated user.
    """
    from sqlalchemy.future import select
    
    stmt = select(JobMatch).where(JobMatch.user_id == current_user.id).order_by(JobMatch.id.desc()).limit(limit)
    result = await db.execute(stmt)
    matches = result.scalars().all()
    
    return [JobMatchResponse(**m.report_data) for m in matches]
