from fastapi import APIRouter
from app.api.v1 import analysis, auth, stats, reports

api_router = APIRouter()
api_router.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(stats.router, prefix="/stats", tags=["Stats"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
