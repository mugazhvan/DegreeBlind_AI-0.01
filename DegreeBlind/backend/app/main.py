"""
FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import setup_logging
from app.api.router import api_router
from app.core.middleware import setup_middlewares


# Initialize logging
setup_logging()

# Create FastAPI app
app = FastAPI(
    title="Degree Blind API",
    description="Hire Skills. Not Degrees. Backend for AI-powered GitHub analysis.",
    version="0.02",
)

# Combine configured production frontend URLs with standard local host development origins
allowed_origins = list(set(settings.FRONTEND_URL + [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "http://localhost:3000",
]))

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

setup_middlewares(app)

from fastapi import Request
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
    )

@app.on_event("startup")
async def startup_event():
    try:
        from app.db.base import Base
        from app.db.session import engine
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables verified/created successfully.")
    except Exception as e:
        logger.error(f"Error initializing database tables on startup: {e}")

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

from fastapi.staticfiles import StaticFiles
import os

# Mount static directory for generated resume assets (images, pdfs)
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")
