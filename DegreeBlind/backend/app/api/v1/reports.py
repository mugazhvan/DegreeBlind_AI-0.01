from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.api.deps import get_current_user
from app.db.models import User, Analysis, Repository, Report

router = APIRouter()

@router.get("/history")
async def get_report_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch past reports for the authenticated user."""
    stmt = (
        select(Analysis)
        .options(selectinload(Analysis.repository), selectinload(Analysis.report))
        .where(Analysis.user_id == current_user.id)
        .where(Analysis.is_deleted == False)
        .order_by(Analysis.created_at.desc())
    )
    result = await db.execute(stmt)
    analyses = result.scalars().all()

    history = []
    for a in analyses:
        history.append({
            "id": a.id,
            "status": a.status,
            "created_at": a.created_at,
            "repository": {
                "name": a.repository.repository_name,
                "owner": a.repository.owner,
                "full_name": a.repository.full_name,
                "language": a.repository.language,
                "stars": a.repository.stars,
                "description": a.repository.description,
                "forks": a.repository.forks,
                "default_branch": a.repository.default_branch,
                "url": a.repository.repository_url,
            },
            "summary": a.report.summary if a.report else None,
            "report_data": a.report.report_json if a.report else None
        })
    return history

@router.delete("/{analysis_id}")
async def delete_report(
    analysis_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Soft delete a report from history."""
    stmt = select(Analysis).where(Analysis.id == analysis_id, Analysis.user_id == current_user.id)
    result = await db.execute(stmt)
    analysis = result.scalar_one_or_none()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Report not found")
        
    analysis.is_deleted = True
    db.add(analysis)
    await db.commit()
    
    return {"message": "Report deleted successfully"}
