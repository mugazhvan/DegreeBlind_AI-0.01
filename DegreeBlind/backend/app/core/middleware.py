from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.core.config import settings
import logging
import time

logger = logging.getLogger(__name__)

# Basic slowapi limiter based on IP
limiter = Limiter(key_func=get_remote_address, default_limits=[f"{settings.RATE_LIMIT_GUEST}/minute"])

class ObservabilityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        response = await call_next(request)
        
        process_time = time.time() - start_time
        logger.info(
            f"{request.method} {request.url.path} - "
            f"Status: {response.status_code} - "
            f"Duration: {process_time:.3f}s"
        )
        return response

def setup_middlewares(app: FastAPI):
    # Setup rate limiting
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    
    # Setup observability
    app.add_middleware(ObservabilityMiddleware)
