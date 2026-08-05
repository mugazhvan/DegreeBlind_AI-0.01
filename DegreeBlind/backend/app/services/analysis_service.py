import time
import asyncio
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.models import Repository, Analysis, Report
from app.services.github_service import github_service
from app.services.llm_service import llm_service
from app.core.config import settings
from fastapi import HTTPException

logger = logging.getLogger(__name__)


class AnalysisService:
    async def start_analysis(self, db: AsyncSession, repo_url: str, user_id: int | None = None) -> int:
        """Initializes the analysis record and returns the analysis ID."""
        try:
            cleaned = repo_url.strip().rstrip("/")
            if "github.com" in cleaned.lower():
                parts = [p for p in cleaned.lower().split("github.com/")[-1].split("/") if p]
            else:
                parts = [p for p in cleaned.split("/") if p]
            
            if not parts:
                raise ValueError("No username or repository found in input.")
                
            owner = parts[0]
            repo = "Portfolio Research"
            full_name = f"{owner}/Portfolio Research"
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid GitHub profile URL or username.")

        stmt = select(Repository).where(Repository.full_name == full_name)
        result = await db.execute(stmt)
        repository = result.scalar_one_or_none()
        
        if repository:
            # Prevent duplicate analysis if one already exists for this user
            stmt = select(Analysis).where(
                Analysis.repository_id == repository.id,
                Analysis.user_id == user_id,
                Analysis.is_deleted == False,
                Analysis.status.in_(["processing", "completed"])
            ).order_by(Analysis.created_at.desc())
            result = await db.execute(stmt)
            existing_analysis = result.scalars().first()
            if existing_analysis:
                return existing_analysis.id
        
        if not repository:
            profile, repos_list = await asyncio.gather(
                github_service.get_owner_profile(owner),
                github_service.get_owner_repos_list(owner, limit=10)
            )
            total_stars = sum(r.get("stargazers_count", 0) for r in repos_list)
            total_forks = sum(r.get("forks_count", 0) for r in repos_list)
            best_lang = repos_list[0].get("language") if repos_list and repos_list[0].get("language") else "Multiple"

            repository = Repository(
                github_id=profile.get("id"),
                owner=owner,
                repository_name=repo,
                full_name=full_name,
                repository_url=f"https://github.com/{owner}",
                default_branch="main",
                description=profile.get("bio") or f"Developer Portfolio Research for {profile.get('name') or owner}",
                stars=total_stars,
                forks=total_forks,
                language=best_lang
            )
            db.add(repository)
            await db.commit()
            await db.refresh(repository)
            
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
        
        return analysis.id

    async def run_analysis_background(self, analysis_id: int):
        """Runs the long AI analysis in the background."""
        from app.db.session import AsyncSessionLocal
        
        async with AsyncSessionLocal() as db:
            try:
                # 1. Fetch the analysis and repository
                stmt = select(Analysis).where(Analysis.id == analysis_id)
                result = await db.execute(stmt)
                analysis = result.scalar_one_or_none()
                if not analysis or analysis.status == "completed":
                    return
                
                stmt = select(Repository).where(Repository.id == analysis.repository_id)
                result = await db.execute(stmt)
                repository = result.scalar_one_or_none()
                
                start_time = time.time()
                
                owner = repository.owner
                if repository.repository_name in ("Portfolio Research", "Portfolio_Research", "portfolio-research"):
                    repo_context = await github_service.get_owner_portfolio_context(owner)
                else:
                    repo = repository.repository_name
                    repo_meta = await github_service.get_repository_data(owner, repo)
                    open_issues = repo_meta.get("open_issues_count", 0)
                    languages, commits, tree, readme = await asyncio.gather(
                        github_service.get_languages(owner, repo),
                        github_service.get_recent_commits(owner, repo),
                        github_service.get_tree(owner, repo, repository.default_branch or "main"),
                        github_service.get_readme(owner, repo, repository.default_branch or "main"),
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

                # 3. Call AI Service
                ai_response: dict = await llm_service.analyze(repo_context)
                
                # 4. Create Report Record
                # ai_response is already a validated dictionary dump of EngineeringIntelligenceResponse
                report = Report(
                    analysis_id=analysis.id,
                    report_json=ai_response,
                    summary=ai_response.get("recruiter_summary", "")
                )
                db.add(report)
                
                analysis.status = "completed"
                analysis.execution_time = time.time() - start_time
                await db.commit()

            except Exception as e:
                import traceback
                tb = traceback.format_exc()
                logger.exception("AI Analysis failed in background")
                await db.rollback()
                
                # Mark as failed safely
                stmt = select(Analysis).where(Analysis.id == analysis_id)
                result = await db.execute(stmt)
                analysis = result.scalar_one_or_none()
                if analysis:
                    analysis.status = "failed"
                    # We can store the error in the execution_time or a new column, but let's just mark it failed
                    db.add(analysis)
                    try:
                        await db.commit()
                    except Exception:
                        pass

analysis_service = AnalysisService()
