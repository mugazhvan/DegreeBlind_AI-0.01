from fastapi import APIRouter, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, HttpUrl

from app.api.deps import get_db, get_current_user_optional
from app.services.analysis_service import analysis_service
from app.schemas.core import FullReport
from app.db.models import User

router = APIRouter()

class AnalyzeRequest(BaseModel):
    repo_url: str

@router.post("/analyze", response_model=FullReport)
async def analyze_repository(
    request: AnalyzeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional)
):
    """
    Triggers the end-to-end analysis of a GitHub repository and returns the FullReport.
    """
    user_id = current_user.id if current_user else None
    report = await analysis_service.analyze_repository(db, request.repo_url, user_id=user_id)
    return report
