from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.api.deps import get_db, get_current_user
from app.db.models import User
from app.schemas.career import CareerIntelligenceResponse
from app.services.career_service import career_service

router = APIRouter()


@router.post("/generate", response_model=CareerIntelligenceResponse)
async def generate_career_intelligence(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generates a unified Career Intelligence Report for the authenticated user.
    Aggregates Resume, ATS, GitHub, and CrossRef data.
    """
    try:
        report = await career_service.generate_career_intelligence(db, current_user.id)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate career intelligence: {str(e)}")


@router.get("/latest", response_model=Optional[CareerIntelligenceResponse])
async def get_latest_career_intelligence(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves the most recent Career Intelligence Report for the authenticated user.
    """
    report = await career_service.get_career_intelligence(db, current_user.id)
    if not report:
        return None
    return report
