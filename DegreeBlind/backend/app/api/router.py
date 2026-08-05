from fastapi import APIRouter
from app.api.v1 import analysis, auth, resume, ats, crossref, reports, stats, career, job_match, learning, interview

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["GitHub Analysis"])
api_router.include_router(resume.router, prefix="/resumes", tags=["Resume Intelligence"]) # Resume designer removed
api_router.include_router(ats.router, prefix="/ats", tags=["ATS Engine"])
api_router.include_router(crossref.router, prefix="/crossref", tags=["Cross-Reference Engine"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports History"])
api_router.include_router(stats.router, prefix="/stats", tags=["Statistics"])
api_router.include_router(career.router, prefix="/career", tags=["Career Intelligence Engine"])
api_router.include_router(job_match.router, prefix="/job-match", tags=["Job Match Engine"])
api_router.include_router(learning.router, prefix="/learning", tags=["Learning Roadmap Engine"])
api_router.include_router(interview.router, prefix="/interview", tags=["Interview Engine"])
