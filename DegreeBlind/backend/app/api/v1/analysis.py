"""
Analysis API routes.
Handles starting GitHub repository analysis and polling status.
"""
import json
import logging
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel

from app.api.deps import get_db, get_current_user_optional, rate_limiter
from app.services.analysis_service import analysis_service
from app.services.github_service import github_service
from app.schemas.core import AnalysisStartResponse, AnalysisStatusResponse, FullReport, RepositoryData
from app.schemas.engineering import EngineeringIntelligenceResponse
from app.db.models import User, Analysis, Report, Repository

logger = logging.getLogger(__name__)

router = APIRouter()


class AnalyzeRequest(BaseModel):
    repo_url: str


@router.post("/analyze", response_model=AnalysisStartResponse, dependencies=[Depends(rate_limiter)])
async def analyze_repository(
    request: AnalyzeRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional)
):
    """
    Starts a GitHub repository analysis in the background.
    Returns the analysis ID for status polling.
    """
    user_id = current_user.id if current_user else None
    analysis_id = await analysis_service.start_analysis(db, request.repo_url, user_id=user_id)

    background_tasks.add_task(analysis_service.run_analysis_background, analysis_id)

    return {"analysis_id": analysis_id, "status": "processing"}


@router.get("/{analysis_id}/status", response_model=AnalysisStatusResponse)
async def get_analysis_status(
    analysis_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional)
):
    """
    Polls the status of an ongoing analysis.
    When completed, returns the full report including EngineeringIntelligenceResponse.
    """
    stmt = select(Analysis).where(Analysis.id == analysis_id)
    result = await db.execute(stmt)
    analysis = result.scalar_one_or_none()

    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")

    if analysis.status != "completed":
        return {"status": analysis.status}

    # Fetch report and repository
    stmt = select(Report).where(Report.analysis_id == analysis_id).order_by(Report.id.desc())
    result = await db.execute(stmt)
    report = result.scalars().first()

    stmt = select(Repository).where(Repository.id == analysis.repository_id)
    result = await db.execute(stmt)
    repository = result.scalar_one_or_none()

    if not report or not repository:
        return {"status": "failed", "error": "Report data missing"}

    try:
        # Fetch live language data
        if repository.repository_name in ("Portfolio Research", "Portfolio_Research", "portfolio-research"):
            languages = await github_service.get_owner_languages(repository.owner)
        else:
            languages = await github_service.get_languages(repository.owner, repository.repository_name)

        # Build repository data
        repo_data = RepositoryData(
            name=repository.repository_name,
            owner=repository.owner,
            description=repository.description,
            primaryLanguage=repository.language,
            stars=repository.stars,
            forks=repository.forks,
            openIssues=0,
            defaultBranch=repository.default_branch,
            url=repository.repository_url,
        )

        # Parse report JSON — it's already an EngineeringIntelligenceResponse dict
        report_data = report.report_json
        if isinstance(report_data, str):
            report_data = json.loads(report_data)

        # Validate through Pydantic to ensure schema conformity
        analysis_report = EngineeringIntelligenceResponse(**report_data)

        full_report = FullReport(
            repository=repo_data,
            languages=languages,
            analysis=analysis_report,
        )

        return {"status": "completed", "report": full_report}

    except Exception as e:
        logger.exception(f"Failed to build report for analysis {analysis_id}")
        return {"status": "failed", "error": f"Failed to parse report: {str(e)}"}
