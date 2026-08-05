import httpx
import asyncio
from typing import Dict, Any, List, Optional
import logging
from fastapi import HTTPException
from app.services.cache_service import cache_github_response

logger = logging.getLogger(__name__)

class GitHubService:
    def __init__(self):
        self.base_url = "https://api.github.com"
        self.headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Degree-Blind-App"
        }
        
        from app.core.config import settings
        if settings.GITHUB_TOKEN:
            self.headers["Authorization"] = f"Bearer {settings.GITHUB_TOKEN}"

    async def _make_request(self, client: httpx.AsyncClient, url: str) -> httpx.Response:
        try:
            response = await client.get(url, headers=self.headers, timeout=30.0, follow_redirects=True)
            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="Repository or resource not found on GitHub.")
            if response.status_code == 403 and "rate limit" in response.text.lower():
                raise HTTPException(status_code=429, detail="GitHub API rate limit exceeded.")
            response.raise_for_status()
            return response
        except httpx.HTTPStatusError as e:
            logger.error(f"GitHub API Error: {e.response.text}")
            raise HTTPException(status_code=e.response.status_code, detail="Error fetching data from GitHub.")
        except httpx.RequestError as e:
            logger.error(f"GitHub Request Error: {str(e)}")
            raise HTTPException(status_code=502, detail="Failed to communicate with GitHub.")

    @cache_github_response
    async def get_repository_data(self, owner: str, repo: str) -> Dict[str, Any]:
        """Fetches core repository metadata."""
        url = f"{self.base_url}/repos/{owner}/{repo}"
        async with httpx.AsyncClient() as client:
            response = await self._make_request(client, url)
            return response.json()

    @cache_github_response
    async def get_languages(self, owner: str, repo: str) -> Dict[str, int]:
        """Fetches language distribution, routing to owner portfolio languages if repo is Portfolio Research."""
        if repo in ("Portfolio Research", "Portfolio_Research", "portfolio-research"):
            return await self.get_owner_languages(owner)
        url = f"{self.base_url}/repos/{owner}/{repo}/languages"
        async with httpx.AsyncClient() as client:
            response = await self._make_request(client, url)
            return response.json()

    @cache_github_response
    async def get_readme(self, owner: str, repo: str, default_branch: str) -> str:
        """Fetches the README file content."""
        url = f"https://raw.githubusercontent.com/{owner}/{repo}/{default_branch}/README.md"
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, timeout=10.0, follow_redirects=True)
                if response.status_code == 200:
                    return response.text
                return "No README found."
            except Exception:
                return "Failed to fetch README."

    @cache_github_response
    async def get_recent_commits(self, owner: str, repo: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Fetches recent commits for analysis."""
        url = f"{self.base_url}/repos/{owner}/{repo}/commits?per_page={limit}"
        async with httpx.AsyncClient() as client:
            try:
                response = await self._make_request(client, url)
                commits = response.json()
                return [
                    {
                        "message": c["commit"]["message"],
                        "author": c["commit"]["author"]["name"],
                        "date": c["commit"]["author"]["date"]
                    }
                    for c in commits
                ]
            except HTTPException:
                return []

    @cache_github_response
    async def get_contributors(self, owner: str, repo: str) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/repos/{owner}/{repo}/contributors?per_page=10"
        async with httpx.AsyncClient() as client:
            try:
                response = await self._make_request(client, url)
                return [{"login": c["login"], "contributions": c["contributions"]} for c in response.json()]
            except HTTPException:
                return []

    @cache_github_response
    async def get_tree(self, owner: str, repo: str, default_branch: str) -> List[str]:
        """Fetches a high-level view of the project structure."""
        url = f"{self.base_url}/repos/{owner}/{repo}/git/trees/{default_branch}?recursive=1"
        async with httpx.AsyncClient() as client:
            try:
                response = await self._make_request(client, url)
                tree = response.json().get("tree", [])
                return [item["path"] for item in tree if item["type"] == "blob"][:200]
            except HTTPException:
                return []

    @cache_github_response
    async def get_owner_profile(self, owner: str) -> Dict[str, Any]:
        """Fetches developer profile metadata from GitHub."""
        url = f"{self.base_url}/users/{owner}"
        async with httpx.AsyncClient() as client:
            try:
                response = await self._make_request(client, url)
                return response.json()
            except HTTPException:
                try:
                    org_url = f"{self.base_url}/orgs/{owner}"
                    response = await self._make_request(client, org_url)
                    return response.json()
                except Exception:
                    return {"login": owner, "name": owner, "bio": "GitHub developer profile", "public_repos": 0, "followers": 0}

    @cache_github_response
    async def get_owner_repos_list(self, owner: str, limit: int = 15) -> List[Dict[str, Any]]:
        """Fetches the owner's public repositories sorted by recently updated."""
        url = f"{self.base_url}/users/{owner}/repos?sort=updated&per_page={limit}"
        async with httpx.AsyncClient() as client:
            try:
                response = await self._make_request(client, url)
                repos = response.json()
                return sorted(repos, key=lambda x: (x.get("stargazers_count", 0), x.get("updated_at", "")), reverse=True)
            except HTTPException:
                return []

    @cache_github_response
    async def get_owner_languages(self, owner: str) -> Dict[str, int]:
        """Aggregates language byte counts across the developer's top public repositories."""
        repos = await self.get_owner_repos_list(owner, limit=5)
        if not repos:
            return {}
        tasks = [self.get_languages(owner, r["name"]) for r in repos if r.get("name") not in ("Portfolio Research", "Portfolio_Research")]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        aggregated = {}
        for res in results:
            if isinstance(res, dict):
                for lang, count in res.items():
                    aggregated[lang] = aggregated.get(lang, 0) + count
        return aggregated

    @cache_github_response
    async def get_owner_portfolio_context(self, owner: str) -> Dict[str, Any]:
        """Gathers thorough architectural & code context across a developer's repository portfolio in fully parallel waves."""
        profile, repos = await asyncio.gather(
            self.get_owner_profile(owner),
            self.get_owner_repos_list(owner, limit=10),
        )
        
        total_stars = sum(r.get("stargazers_count", 0) for r in repos)
        total_forks = sum(r.get("forks_count", 0) for r in repos)
        
        top_repos = repos[:5]
        
        # Completely parallelize fetching readmes, recent commits, and language distributions in a single concurrent wave
        all_tasks = []
        for r in top_repos:
            branch = r.get("default_branch", "main")
            all_tasks.append(self.get_readme(owner, r["name"], branch))
            all_tasks.append(self.get_recent_commits(owner, r["name"], limit=5))
            all_tasks.append(self.get_languages(owner, r["name"]))
            
        results = await asyncio.gather(*all_tasks, return_exceptions=True)
        
        readmes = results[0::3]
        commits = results[1::3]
        langs = results[2::3]
        
        aggregated_languages = {}
        for l in langs:
            if isinstance(l, dict):
                for lang, count in l.items():
                    aggregated_languages[lang] = aggregated_languages.get(lang, 0) + count
                    
        primary_language = max(aggregated_languages.items(), key=lambda x: x[1])[0] if aggregated_languages else (top_repos[0].get("language") if top_repos else "Multiple")
        
        top_projects = []
        for i, r in enumerate(top_repos):
            r_readme = readmes[i] if isinstance(readmes[i], str) else "No README available."
            r_commits = commits[i] if isinstance(commits[i], list) else []
            top_projects.append({
                "name": r["name"],
                "description": r.get("description") or "No description provided",
                "language": r.get("language"),
                "stars": r.get("stargazers_count", 0),
                "forks": r.get("forks_count", 0),
                "readme_excerpt": r_readme[:1500],
                "recent_commits": r_commits
            })
            
        return {
            "analysis_type": "Developer Portfolio Research (Owner Profile)",
            "developer_handle": owner,
            "developer_name": profile.get("name") or owner,
            "bio": profile.get("bio") or "No bio provided",
            "public_repositories_count": profile.get("public_repos", len(repos)),
            "followers": profile.get("followers", 0),
            "total_stars_accrued": total_stars,
            "total_forks": total_forks,
            "primary_language": primary_language,
            "aggregated_language_distribution": aggregated_languages,
            "top_flagship_projects": top_projects
        }

github_service = GitHubService()

