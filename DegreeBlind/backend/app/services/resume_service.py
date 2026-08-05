import os
import hashlib
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import UploadFile

from app.db.models import Resume, ParsedResume
from app.services.document_parser import document_parser
from app.services.llm_service import llm_service
from app.db.session import AsyncSessionLocal

logger = logging.getLogger(__name__)

class ResumeService:
    def __init__(self):
        self.upload_dir = "uploads/resumes"
        os.makedirs(self.upload_dir, exist_ok=True)

    async def get_file_hash(self, file: UploadFile) -> str:
        sha256 = hashlib.sha256()
        while True:
            chunk = await file.read(8192)
            if not chunk:
                break
            sha256.update(chunk)
        await file.seek(0)
        return sha256.hexdigest()

    async def save_upload(self, file: UploadFile, db: AsyncSession, user_id: int = None) -> Resume:
        """Saves the uploaded file, creates a pending Resume DB entry, and returns it."""
        file_hash = await self.get_file_hash(file)
        
        # Check if hash already exists to prevent duplicate processing
        result = await db.execute(select(Resume).where(Resume.file_hash == file_hash))
        existing_resume = result.scalar_one_or_none()
        
        if existing_resume:
            logger.info(f"Resume with hash {file_hash} already exists.")
            return existing_resume

        file_ext = os.path.splitext(file.filename)[1].lower()
        new_filename = f"{file_hash}{file_ext}"
        file_path = os.path.join(self.upload_dir, new_filename)
        
        with open(file_path, "wb") as f:
            while True:
                chunk = await file.read(8192)
                if not chunk:
                    break
                f.write(chunk)
                
        resume = Resume(
            user_id=user_id,
            filename=file.filename,
            file_path=file_path,
            file_hash=file_hash,
            status="pending"
        )
        db.add(resume)
        await db.commit()
        await db.refresh(resume)
        return resume

    async def process_resume_background(self, resume_id: int):
        """Background task to parse the resume, extract text, run LLM, and save structured output."""
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(Resume).where(Resume.id == resume_id))
            resume = result.scalar_one_or_none()
            
            if not resume:
                logger.error(f"Resume with ID {resume_id} not found for background processing.")
                return

            try:
                resume.status = "processing"
                await db.commit()
                
                # 1. Parse Raw Text
                file_ext = os.path.splitext(resume.file_path)[1].lower()
                raw_text = await document_parser.parse_document(resume.file_path, file_ext)
                
                # 2. Pass to LLM
                structured_json = await llm_service.parse_resume(raw_text)
                
                # 3. Save to ParsedResume
                parsed_resume = ParsedResume(
                    resume_id=resume.id,
                    parsed_json=structured_json
                )
                db.add(parsed_resume)
                
                # 4. Update status
                resume.status = "completed"
                await db.commit()
                logger.info(f"Successfully processed resume {resume_id}")
                
            except Exception as e:
                logger.error(f"Failed to process resume {resume_id}: {e}")
                resume.status = "failed"
                resume.error_message = str(e)
                await db.commit()

resume_service = ResumeService()
