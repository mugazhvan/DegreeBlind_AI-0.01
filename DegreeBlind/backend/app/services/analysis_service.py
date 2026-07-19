import time
import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.models import Repository, Analysis, Report
from app.services.github_service import github_service
from app.services.llm_service import llm_service
from app.schemas.core import (
    FullReport, 
    RepositoryData, 
    AIAnalysisReport, 
    RecommendedRole,
    NemotronResponseSchema
)
from app.core.config import settings
from fastapi import HTTPException

logger = logging.getLogger(__name__)


class AnalysisService:
    async def analyze_repository(self, db: AsyncSession, repo_url: str, user_id: int | None = None) -> FullReport:
        # Parse owner and repo
        try:
            # Example: https://github.com/owner/repo
            parts = repo_url.rstrip("/").split("/")
            owner = parts[-2]
            repo = parts[-1]
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid GitHub URL.")

        # 1. Check if we already have it cached in DB
        stmt = select(Repository).where(Repository.full_name == f"{owner}/{repo}")
        result = await db.execute(stmt)
        repository = result.scalar_one_or_none()
        
        # If not, create it — also fetch open_issues_count from the same call
        open_issues = 0
        if not repository:
            repo_meta = await github_service.get_repository_data(owner, repo)
            open_issues = repo_meta.get("open_issues_count", 0)
            repository = Repository(
                github_id=repo_meta.get("id"),
                owner=owner,
                repository_name=repo,
                full_name=f"{owner}/{repo}",
                repository_url=repo_url,
                default_branch=repo_meta.get("default_branch", "main"),
                description=repo_meta.get("description"),
                stars=repo_meta.get("stargazers_count", 0),
                forks=repo_meta.get("forks_count", 0),
                language=repo_meta.get("language")
            )
            db.add(repository)
            await db.commit()
            await db.refresh(repository)
        
        # 2. Gather ALL context from GitHub in parallel — saves several seconds
        languages, commits, tree, readme = await asyncio.gather(
            github_service.get_languages(owner, repo),
            github_service.get_recent_commits(owner, repo),
            github_service.get_tree(owner, repo, repository.default_branch),
            github_service.get_readme(owner, repo, repository.default_branch),
        )

        repo_context = {
            "name": repo,
            "owner": owner,
            "description": repository.description,
            "language": repository.language,
            "stars": repository.stars,
            "forks": repository.forks,
            "open_issues": open_issues,
            "languages": languages,
            "commits": commits,
            "tree": tree,
            "readme": readme
        }

        # 3. Create Analysis Record
        start_time = time.time()
        analysis = Analysis(
            repository_id=repository.id,
            status="processing",
            ai_model=settings.AI_MODEL,
            prompt_version="v1",
            user_id=user_id
        )
        db.add(analysis)
        await db.commit()
        await db.refresh(analysis)

        # 4. Call AI Service
        try:
            ai_response: NemotronResponseSchema = await llm_service.analyze(repo_context)
            
            # Map NemotronResponse to Frontend AIAnalysisReport
            ai_analysis_report = AIAnalysisReport(
                problemSolving=ai_response.technical_strengths[0] if ai_response.technical_strengths else "Insufficient evidence",
                architecture=ai_response.architecture_assessment,
                codeQuality=ai_response.engineering_practices,
                documentation=ai_response.documentation_review,
                security=ai_response.security_observations,
                testing=ai_response.testing_review,
                maintainability=ai_response.maintainability_assessment,
                scalability=ai_response.scalability_assessment,
                overallSummary=ai_response.final_summary
            )

            roles = [RecommendedRole(roleName=r, confidence=None) for r in ai_response.potential_roles]

            # 5. Create Report Record
            report_json = ai_response.model_dump()
            report = Report(
                analysis_id=analysis.id,
                report_json=report_json,
                summary=ai_response.final_summary
            )
            db.add(report)
            
            analysis.status = "completed"
            analysis.execution_time = time.time() - start_time
            await db.commit()

            # 6. Build the final response matching frontend contract FullReport
            repo_data = RepositoryData(
                name=repository.repository_name,
                owner=repository.owner,
                description=repository.description,
                primaryLanguage=repository.language,
                stars=repository.stars,
                forks=repository.forks,
                openIssues=repo_context["open_issues"],
                defaultBranch=repository.default_branch,
                createdDate=None,
                lastUpdated=None,
                url=repository.repository_url,
                license=None,
                topics=[],
                sizeKb=None,
                contributorsCount=None
            )

            return FullReport(
                repository=repo_data,
                languages=languages,
                analysis=ai_analysis_report,
                roles=roles,
                recommendations=ai_response.areas_for_improvement
            )

        except Exception as e:
            import traceback
            tb = traceback.format_exc()
            logger.exception("AI Analysis failed")
            print("=== AI ANALYSIS EXCEPTION ===")
            print(tb)
            print("=============================")
            analysis.status = "failed"
            analysis.execution_time = time.time() - start_time
            await db.commit()
            raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}\n\nTraceback:\n{tb}")




analysis_service = AnalysisService()
