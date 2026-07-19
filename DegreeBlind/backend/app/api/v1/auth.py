from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
import urllib.parse

from app.db.session import get_db
from app.core.config import settings
from app.services.auth_service import auth_service
from app.api.deps import get_current_user
from app.db.models import User

router = APIRouter()

@router.get("/github/login")
async def github_login():
    """Redirects user to GitHub OAuth login."""
    params = {
        "client_id": settings.GITHUB_CLIENT_ID,
        "scope": "read:user user:email",
    }
    url = f"https://github.com/login/oauth/authorize?{urllib.parse.urlencode(params)}"
    return RedirectResponse(url)

@router.get("/github/callback")
async def github_callback(code: str, db: AsyncSession = Depends(get_db)):
    """Handles GitHub OAuth callback."""
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code is missing")
    
    try:
        user_info = await auth_service.get_github_user(code)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    user = await auth_service.get_or_create_user(
        db=db,
        provider="github",
        provider_id=user_info["provider_id"],
        email=user_info.get("email") or "",
        name=user_info.get("name") or "",
        avatar_url=user_info.get("avatar_url") or ""
    )

    access_token = auth_service.create_access_token(
        data={"sub": str(user.id)}
    )

    # Redirect back to frontend with the token
    frontend_url = settings.FRONTEND_URL[0] if settings.FRONTEND_URL else "http://localhost:5173"
    redirect_url = f"{frontend_url}/auth/success?token={access_token}"
    return RedirectResponse(url=redirect_url)

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Get the currently logged-in user."""
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "avatar_url": current_user.avatar_url,
        "provider": current_user.provider
    }
