import httpx
from typing import Dict, Any, List, Optional
import logging
from fastapi import HTTPException

logger = logging.getLogger(__name__)

class GitHubService:
    def __init__(self):
        self.base_url = "https://api.github.com"
        # We could use a PAT here to increase rate limits, but for public repos, we can try without first.
        # Or if GITHUB_CLIENT_ID is set, we can use it, but server-to-server it's better to use a PAT.
        # For this MVP, we'll use unauthenticated requests for public data unless token is provided.
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

    async def get_repository_data(self, owner: str, repo: str) -> Dict[str, Any]:
        """Fetches core repository metadata."""
        url = f"{self.base_url}/repos/{owner}/{repo}"
        async with httpx.AsyncClient() as client:
            response = await self._make_request(client, url)
            return response.json()

    async def get_languages(self, owner: str, repo: str) -> Dict[str, int]:
        """Fetches language distribution."""
        url = f"{self.base_url}/repos/{owner}/{repo}/languages"
        async with httpx.AsyncClient() as client:
            response = await self._make_request(client, url)
            return response.json()

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

    async def get_contributors(self, owner: str, repo: str) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/repos/{owner}/{repo}/contributors?per_page=10"
        async with httpx.AsyncClient() as client:
            try:
                response = await self._make_request(client, url)
                return [{"login": c["login"], "contributions": c["contributions"]} for c in response.json()]
            except HTTPException:
                return []

    async def get_tree(self, owner: str, repo: str, default_branch: str) -> List[str]:
        """Fetches a high-level view of the project structure."""
        url = f"{self.base_url}/repos/{owner}/{repo}/git/trees/{default_branch}?recursive=1"
        async with httpx.AsyncClient() as client:
            try:
                response = await self._make_request(client, url)
                tree = response.json().get("tree", [])
                # Return just paths to give the AI context about architecture without overwhelming it
                return [item["path"] for item in tree if item["type"] == "blob"][:200]  # Limit to 200 files
            except HTTPException:
                return []

github_service = GitHubService()
