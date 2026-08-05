from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel

from app.api.deps import get_db, get_current_user
from app.db.models import User, LearningRoadmap
from app.schemas.learning import LearningRoadmapResponse
from app.services.learning_service import learning_service

router = APIRouter()


class LearningRoadmapRequest(BaseModel):
    target_role: str
    resume_id: Optional[int] = None
    github_report_id: Optional[int] = None


@router.post("/generate", response_model=LearningRoadmapResponse)
async def generate_learning_roadmap(
    request: LearningRoadmapRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generates a personalized learning roadmap for the specified target role.
    """
    try:
        report = await learning_service.generate_roadmap(
            db, current_user.id, request.target_role, request.resume_id, request.github_report_id
        )
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate learning roadmap: {str(e)}")


@router.get("/history", response_model=List[LearningRoadmapResponse])
async def get_learning_roadmaps_history(
    limit: int = 5,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves past learning roadmaps for the authenticated user.
    """
    from sqlalchemy.future import select
    
    stmt = select(LearningRoadmap).where(LearningRoadmap.user_id == current_user.id).order_by(LearningRoadmap.id.desc()).limit(limit)
    result = await db.execute(stmt)
    roadmaps = result.scalars().all()
    
    return [LearningRoadmapResponse(**r.report_data) for r in roadmaps]
