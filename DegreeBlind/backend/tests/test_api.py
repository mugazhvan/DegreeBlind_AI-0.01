import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_root(async_client: AsyncClient):
    response = await async_client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "online"}

@pytest.mark.asyncio
async def test_health(async_client: AsyncClient):
    response = await async_client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

@pytest.mark.asyncio
async def test_google_login_redirect(async_client: AsyncClient):
    response = await async_client.get("/api/v1/auth/google/login", follow_redirects=False)
    assert response.status_code == 307
    assert "accounts.google.com" in response.headers["location"]
