from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from jose import jwt, JWTError

from app.db.session import get_db
from app.core.config import settings

from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.future import select
from app.db.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    try:
        payload = jwt.decode(token, settings.JWT_SECRET.get_secret_value(), algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user

async def get_current_user_optional(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User | None:
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.JWT_SECRET.get_secret_value(), algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
    except JWTError:
        return None
    
    result = await db.execute(select(User).where(User.id == int(user_id)))
    return result.scalar_one_or_none()

import time
from fastapi import Request

# Simple in-memory rate limiter (in production use Redis!)
RATE_LIMIT_STORE = {}

async def rate_limiter(request: Request):
    client_ip = request.client.host
    current_time = time.time()
    
    # 5 requests per 60 seconds
    limit = 5
    window = 60
    
    if client_ip not in RATE_LIMIT_STORE:
        RATE_LIMIT_STORE[client_ip] = []
        
    # Clean old requests
    RATE_LIMIT_STORE[client_ip] = [
        timestamp for timestamp in RATE_LIMIT_STORE[client_ip] 
        if current_time - timestamp < window
    ]
    
    if len(RATE_LIMIT_STORE[client_ip]) >= limit:
        raise HTTPException(status_code=429, detail="Too many requests. Please wait a moment.")
        
    RATE_LIMIT_STORE[client_ip].append(current_time)
    return True
