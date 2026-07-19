"""
Structured production logging configuration.
"""
import logging
from app.core.config import settings

def setup_logging() -> None:
    """Configures the root logger with the appropriate level and format."""
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    
    # Simple readable format for development, can be replaced with JSON formatter in prod
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    logging.basicConfig(
        level=log_level,
        format=log_format,
        handlers=[logging.StreamHandler()]
    )
    
    # Silence third-party noise
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("passlib").setLevel(logging.WARNING)
