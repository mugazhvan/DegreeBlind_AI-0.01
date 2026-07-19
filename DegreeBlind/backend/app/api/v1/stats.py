from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.db.session import get_db
from app.db.models import Analysis, Repository

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

    # Average Skill Score (Mocking this for MVP, or calculate if skill score logic exists)
    average_skill_score = "8.4 / 10" if repositories_analysed > 0 else "N/A"

    return {
        "repositories_analysed": repositories_analysed,
        "candidates_evaluated": candidates_evaluated,
        "average_skill_score": average_skill_score
    }
