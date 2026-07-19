"""
FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import setup_logging
from app.api.router import api_router

# Initialize logging
setup_logging()

# Create FastAPI app
app = FastAPI(
    title="Degree Blind API",
    description="Hire Skills. Not Degrees. Backend for AI-powered GitHub analysis.",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_URL,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["Health"])
async def root():
    """Root health check endpoint."""
    return {"status": "online"}

@app.get("/health", tags=["Health"])
async def health():
    """Detailed health check endpoint."""
    return {"status": "healthy"}

# Register API routers
app.include_router(api_router, prefix="/api/v1")
