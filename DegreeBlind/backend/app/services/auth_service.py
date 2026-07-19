import httpx
from datetime import datetime, timedelta
from typing import Any, Dict, Optional
from jose import jwt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.config import settings
from app.db.models import User

class AuthService:
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode, 
            settings.JWT_SECRET.get_secret_value(), 
            algorithm=settings.JWT_ALGORITHM
        )
        return encoded_jwt

    async def get_or_create_user(
        self, 
        db: AsyncSession, 
        provider: str, 
        provider_id: str, 
        email: str, 
        name: str, 
        avatar_url: str
    ) -> User:
        stmt = select(User).where(
            User.provider == provider, 
            User.provider_id == str(provider_id)
        )
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        if user:
            user.name = name
            user.email = email
            user.avatar_url = avatar_url
            await db.commit()
            await db.refresh(user)
            return user
        
        new_user = User(
            provider=provider,
            provider_id=str(provider_id),
            email=email,
            name=name,
            avatar_url=avatar_url
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return new_user

    async def get_github_user(self, code: str) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            # 1. Exchange code for access token
            token_res = await client.post(
                "https://github.com/login/oauth/access_token",
                headers={"Accept": "application/json"},
                data={
                    "client_id": settings.GITHUB_CLIENT_ID,
                    "client_secret": settings.GITHUB_CLIENT_SECRET.get_secret_value() if settings.GITHUB_CLIENT_SECRET else "",
                    "code": code,
                }
            )
            token_res.raise_for_status()
            token_data = token_res.json()
            access_token = token_data.get("access_token")
            if not access_token:
                raise ValueError("Failed to retrieve access token from GitHub")

            # 2. Get user profile
            user_res = await client.get(
                "https://api.github.com/user",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github.v3+json"
                }
            )
            user_res.raise_for_status()
            user_data = user_res.json()

            # 3. Get user emails (if email is private)
            email = user_data.get("email")
            if not email:
                email_res = await client.get(
                    "https://api.github.com/user/emails",
                    headers={
                        "Authorization": f"Bearer {access_token}",
                        "Accept": "application/vnd.github.v3+json"
                    }
                )
                if email_res.status_code == 200:
                    emails = email_res.json()
                    primary_email = next((e["email"] for e in emails if e.get("primary")), None)
                    email = primary_email or emails[0]["email"]

            return {
                "provider_id": str(user_data["id"]),
                "email": email,
                "name": user_data.get("name") or user_data.get("login"),
                "avatar_url": user_data.get("avatar_url")
            }

auth_service = AuthService()
