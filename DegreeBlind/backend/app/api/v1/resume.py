import os
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Dict, Any, Optional
from pydantic import BaseModel

from app.db.session import get_db
from app.db.models import Resume, ParsedResume, User
from app.api.deps import get_current_user_optional, get_current_user
from app.schemas.resume_gen import ResumeGenerateRequest, GeneratedResumeResponse
from app.services.resume_service import resume_service
from app.services.resume_generator_service import resume_generator_service

router = APIRouter()

@router.get("/")
async def get_user_resumes(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all uploaded resumes for the current user."""
    stmt = select(Resume).where(Resume.user_id == current_user.id).order_by(Resume.created_at.desc())
    result = await db.execute(stmt)
    resumes = result.scalars().all()
    
    return [
        {
            "id": r.id,
            "filename": r.filename,
            "status": r.status,
            "uploaded_at": r.created_at,
            "error_message": r.error_message
        }
        for r in resumes
    ]

ALLOWED_EXTENSIONS = {'.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'}
MAX_FILE_SIZE = 15 * 1024 * 1024 # 15 MB

@router.post("/upload")
async def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user_optional)
):
    """
    Upload a resume (PDF/DOCX) for AI parsing.
    Returns a resume ID and starts background processing.
    """
    # 1. Validate File Size & Extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF, DOCX, and Images (PNG/JPG) are supported.")
        
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 15MB.")

    # 2. Save file and create DB record
    user_id = user.id if user else None
    resume = await resume_service.save_upload(file, db, user_id)
    
    # 3. If it's already completed or processing, we don't need to queue it again
    if resume.status in ["pending", "failed"]:
        if resume.status == "failed":
            resume.status = "pending"
            resume.error_message = None
            await db.commit()
            await db.refresh(resume)
        background_tasks.add_task(resume_service.process_resume_background, resume.id)
    
    return {
        "resume_id": resume.id,
        "status": resume.status,
        "message": "Resume uploaded successfully and is being processed."
    }

@router.get("/{resume_id}/status")
async def get_resume_status(resume_id: int, db: AsyncSession = Depends(get_db)):
    """Check the processing status of an uploaded resume."""
    result = await db.execute(select(Resume).where(Resume.id == resume_id))
    resume = result.scalar_one_or_none()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    return {
        "resume_id": resume.id,
        "status": resume.status,
        "error_message": resume.error_message
    }

@router.get("/{resume_id}")
async def get_parsed_resume(resume_id: int, db: AsyncSession = Depends(get_db)):
    """Get the fully parsed JSON representation of a completed resume."""
    result = await db.execute(select(ParsedResume).where(ParsedResume.resume_id == resume_id))
    parsed_resume = result.scalar_one_or_none()
    
    if not parsed_resume:
        # Check if it failed
        resume_result = await db.execute(select(Resume).where(Resume.id == resume_id))
        resume = resume_result.scalar_one_or_none()
        if resume and resume.status == "failed":
             raise HTTPException(status_code=400, detail=f"Resume parsing failed: {resume.error_message}")
        raise HTTPException(status_code=404, detail="Parsed resume not found or still processing")
        
    return parsed_resume.parsed_json

@router.post("/generate", response_model=GeneratedResumeResponse)
async def generate_resume(
    request: ResumeGenerateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generates a tailored resume for the user.
    """
    try:
        report = await resume_generator_service.generate_resume(db, current_user.id, request.target_role, request.theme)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate resume: {str(e)}")

class ResumeUpdateRequest(BaseModel):
    filename: Optional[str] = None
    parsed_json: Optional[Dict[str, Any]] = None

@router.patch("/{resume_id}")
async def update_resume(
    resume_id: int,
    request: ResumeUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a resume's filename or parsed data."""
    result = await db.execute(select(Resume).where(Resume.id == resume_id, Resume.user_id == current_user.id))
    resume = result.scalar_one_or_none()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    if request.filename:
        resume.filename = request.filename
        
    if request.parsed_json is not None:
        parsed_result = await db.execute(select(ParsedResume).where(ParsedResume.resume_id == resume_id))
        parsed = parsed_result.scalar_one_or_none()
        if parsed:
            parsed.parsed_json = request.parsed_json
        else:
            parsed = ParsedResume(resume_id=resume_id, parsed_json=request.parsed_json)
            db.add(parsed)
            
    await db.commit()
    await db.refresh(resume)
    return {"status": "success", "message": "Resume updated successfully", "id": resume.id, "filename": resume.filename}

@router.delete("/{resume_id}")
async def delete_resume(
    resume_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a resume and its parsed data."""
    result = await db.execute(select(Resume).where(Resume.id == resume_id, Resume.user_id == current_user.id))
    resume = result.scalar_one_or_none()
    
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    await db.delete(resume)
    await db.commit()
    return {"status": "success", "message": "Resume deleted"}
