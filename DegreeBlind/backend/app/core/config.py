"""
Core configuration module for Degree Blind.
Loads environment variables, fails fast if missing, and validates data.
"""

from typing import List, Optional
from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application configuration via environment variables.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    ENVIRONMENT: str = Field(default="development")
    DEBUG: bool = Field(default=False)
    LOG_LEVEL: str = Field(default="INFO")
    PORT: int = Field(default=8000)

    DATABASE_URL: str = Field(...)

    JWT_SECRET: SecretStr = Field(...)
    JWT_ALGORITHM: str = Field(...)
    JWT_EXPIRE_MINUTES: int = Field(...)

    NVIDIA_API_KEY: SecretStr = Field(...)
    AI_PROVIDER: str = Field(...)
    AI_MODEL: str = Field(...)

    GITHUB_TOKEN: Optional[str] = None
    GITHUB_CLIENT_ID: Optional[str] = None
    GITHUB_CLIENT_SECRET: Optional[SecretStr] = None

    GOOGLE_CLIENT_ID: str = Field(...)
    GOOGLE_CLIENT_SECRET: SecretStr = Field(...)

    FRONTEND_URL: List[str] = Field(...)

    CACHE_TTL: int = Field(default=3600)
    RATE_LIMIT_GUEST: int = Field(default=5)
    RATE_LIMIT_AUTHENTICATED: int = Field(default=10)

    @field_validator("FRONTEND_URL", mode="before")
    @classmethod
    def parse_frontend_urls(cls, v: str | List[str]) -> List[str]:
        """Parses a comma-separated string of URLs into a list."""
        if isinstance(v, str):
            # Handle if the string is formatted as a JSON array literal like '["http://localhost:5173"]'
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    pass
            return [url.strip() for url in v.split(",") if url.strip()]
        return v


settings = Settings()
