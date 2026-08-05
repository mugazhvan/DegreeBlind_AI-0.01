from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional

from app.db.session import get_db
from app.db.models import User, CrossReference
from app.api.deps import get_current_user_optional
from app.services.crossref_service import crossref_service

router = APIRouter()

class CrossRefRequest(BaseModel):
    resume_id: Optional[int] = None

@router.post("/analyze")
async def trigger_cross_reference(
    request: CrossRefRequest = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user_optional)
):
    """
    Triggers the Cross-Reference Engine for the authenticated user.
    """
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required.")
        
    try:
        resume_id = request.resume_id if request else None
        result = await crossref_service.analyze_user(db, user.id, resume_id)
        return {
            "message": "Cross-reference complete",
            "data": result
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/latest")
async def get_latest_crossref(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user_optional)
):
    """
    Retrieves the most recent cross-reference report for the authenticated user.
    """
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required.")
        
    stmt = select(CrossReference).where(CrossReference.user_id == user.id).order_by(CrossReference.created_at.desc()).limit(1)
    result = await db.execute(stmt)
    cross_ref = result.scalar_one_or_none()
    
    if not cross_ref:
        raise HTTPException(status_code=404, detail="No cross-reference report found.")
        
    return {
        "data": cross_ref.report_data
    }
