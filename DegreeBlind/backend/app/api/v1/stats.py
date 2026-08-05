from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
import json

from app.db.session import get_db
from app.db.models import Analysis, Repository, Report

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    # Total repositories analyzed
    stmt = select(func.count(Analysis.id)).where(Analysis.status == "completed")
    result = await db.execute(stmt)
    repositories_analysed = result.scalar() or 0

    # Candidates evaluated (approximate by unique owners or repos)
    stmt2 = select(func.count(Repository.id))
    result2 = await db.execute(stmt2)
    candidates_evaluated = result2.scalar() or 0

    # Calculate average skill score from reports
    stmt3 = select(Report.report_json).join(Analysis).where(Analysis.status == "completed")
    result3 = await db.execute(stmt3)
    reports = result3.scalars().all()
    
    total_score = 0
    valid_reports = 0
    for report_data in reports:
        if isinstance(report_data, str):
            try:
                report_data = json.loads(report_data)
            except json.JSONDecodeError:
                continue
                
        if isinstance(report_data, dict) and "engineering_score" in report_data:
            total_score += report_data["engineering_score"]
            valid_reports += 1

    if valid_reports > 0:
        avg_score = total_score / valid_reports
        # Format out of 10 for display (assuming engineering_score is 0-100)
        average_skill_score = f"{avg_score / 10:.1f} / 10"
    else:
        average_skill_score = "N/A"

    return {
        "repositories_analysed": repositories_analysed,
        "candidates_evaluated": candidates_evaluated,
        "average_skill_score": average_skill_score
    }
