from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel

from app.api.deps import get_db, get_current_user
from app.db.models import User
from app.schemas.interview import (
    InterviewSessionResponse,
    InterviewAnswerSubmit,
    InterviewAnswerResponse,
    InterviewFeedbackResponse
)
from app.services.interview_service import interview_service

router = APIRouter()


class InterviewStartRequest(BaseModel):
    interview_type: str = "technical"
    target_role: Optional[str] = None


@router.post("/start", response_model=InterviewSessionResponse)
async def start_interview(
    request: InterviewStartRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Starts a new interview session and generates questions.
    """
    try:
        session = await interview_service.start_session(
            db, current_user.id, request.interview_type, request.target_role
        )
        return session
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start interview: {str(e)}")


@router.post("/question/{question_id}/answer", response_model=InterviewAnswerResponse)
async def submit_answer(
    question_id: int,
    request: InterviewAnswerSubmit,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Submits an answer and receives AI feedback immediately.
    """
    try:
        answer = await interview_service.submit_answer(db, question_id, request.answer_text)
        return answer
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit answer: {str(e)}")


@router.post("/session/{session_id}/complete", response_model=InterviewFeedbackResponse)
async def complete_interview(
    session_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Completes the session and generates an overall feedback report.
    """
    try:
        feedback = await interview_service.complete_session(db, session_id)
        return feedback
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to complete session: {str(e)}")
