import json
import logging
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from pydantic import BaseModel

from app.db.models import InterviewSession, InterviewQuestion, InterviewAnswer, Resume, ParsedResume, Report, Analysis
from app.schemas.interview import (
    InterviewSessionResponse,
    InterviewQuestionResponse,
    InterviewAnswerSubmit,
    InterviewAnswerResponse,
    InterviewFeedbackResponse
)
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)


# =====================================================================
# Module-level Pydantic schemas to avoid repetitive runtime overhead
# =====================================================================

class QuestionGenerateSchema(BaseModel):
    questions: List[dict]


class AnswerEvalSchema(BaseModel):
    score: int
    feedback: str


class SummaryEvalSchema(BaseModel):
    summary: str
    strengths: List[str]
    weaknesses: List[str]


class InterviewService:
    async def start_session(
        self, db: AsyncSession, user_id: int, interview_type: str, target_role: Optional[str]
    ) -> InterviewSessionResponse:
        """
        Starts a new interview session and generates questions based on candidate profile.
        Optimized for atomic database transactions and minimal network roundtrips.
        """
        # 1. Fetch candidate profile using a single joined query for resume data
        stmt_resume = (
            select(ParsedResume.parsed_json)
            .join(Resume, Resume.id == ParsedResume.resume_id)
            .where(Resume.user_id == user_id, Resume.status == "completed")
            .order_by(Resume.id.desc())
            .limit(1)
        )
        parsed_data = (await db.execute(stmt_resume)).scalar_one_or_none() or {}

        # Fetch latest engineering report
        stmt_report = (
            select(Report.report_json)
            .join(Report.analysis)
            .where(Analysis.user_id == user_id, Analysis.status == "completed")
            .order_by(Report.id.desc())
            .limit(1)
        )
        engineering_data = (await db.execute(stmt_report)).scalar_one_or_none() or {}
        
        candidate_profile = {
            "resume_data": parsed_data,
            "engineering_analysis": engineering_data
        }

        # 2. Call LLM before creating database rows to prevent orphaned sessions on API failure
        response_json = await llm_service.call_llm(
            prompt_path="app/prompts/interview_generate.txt",
            schema=QuestionGenerateSchema,
            candidate_profile=json.dumps(candidate_profile, separators=(",", ":")),  # Compact JSON saves tokens & latency
            target_role=target_role or "Software Engineer",
            interview_type=interview_type
        )

        # 3. Perform a single atomic transaction for both session and questions
        session = InterviewSession(
            user_id=user_id,
            interview_type=interview_type,
            target_role=target_role,
            status="in_progress"
        )
        db.add(session)
        await db.flush()  # Generates session.id without committing

        questions_data = response_json.get("questions", [])
        questions = [
            InterviewQuestion(
                session_id=session.id,
                question_text=q.get("question_text", ""),
                question_type=q.get("question_type", "general"),
                difficulty=q.get("difficulty", "medium"),
                order_index=idx
            )
            for idx, q in enumerate(questions_data)
        ]
        db.add_all(questions)
        await db.commit()

        # Load session with questions using selectinload for async compatibility
        stmt_loaded = (
            select(InterviewSession)
            .options(selectinload(InterviewSession.questions))
            .where(InterviewSession.id == session.id)
        )
        session_loaded = (await db.execute(stmt_loaded)).scalar_one()

        return InterviewSessionResponse(
            id=session_loaded.id,
            user_id=session_loaded.user_id,
            interview_type=session_loaded.interview_type,
            target_role=session_loaded.target_role,
            status=session_loaded.status,
            overall_score=session_loaded.overall_score,
            feedback_summary=session_loaded.feedback_summary,
            created_at=session_loaded.created_at,
            updated_at=session_loaded.updated_at,
            questions=[
                InterviewQuestionResponse(
                    id=q.id,
                    session_id=q.session_id,
                    question_text=q.question_text,
                    question_type=q.question_type,
                    difficulty=q.difficulty,
                    order_index=q.order_index,
                    created_at=q.created_at
                )
                for q in sorted(session_loaded.questions, key=lambda x: x.order_index)
            ]
        )

    async def submit_answer(
        self, db: AsyncSession, question_id: int, answer_text: str
    ) -> InterviewAnswerResponse:
        """
        Submits an answer and gets AI feedback for it.
        Uses optimized outer-join query to validate existence and deduplication in a single DB hit.
        """
        # Validate question existence and check for existing answer in a single query
        stmt = (
            select(InterviewQuestion.question_text, InterviewAnswer.id)
            .outerjoin(InterviewAnswer, InterviewAnswer.question_id == InterviewQuestion.id)
            .where(InterviewQuestion.id == question_id)
        )
        result = (await db.execute(stmt)).first()
        
        if not result:
            raise ValueError("Question not found")
        if result.id is not None:
            raise ValueError("Question already answered")

        question_text = result.question_text

        # Evaluate answer via LLM
        eval_json = await llm_service.call_llm(
            prompt_path="app/prompts/interview_evaluate.txt",
            schema=AnswerEvalSchema,
            question=question_text,
            answer=answer_text
        )
        
        answer = InterviewAnswer(
            question_id=question_id,
            answer_text=answer_text,
            score=eval_json.get("score", 0),
            feedback=eval_json.get("feedback", "")
        )
        db.add(answer)
        await db.commit()
        await db.refresh(answer)
        
        return InterviewAnswerResponse(
            id=answer.id,
            question_id=answer.question_id,
            answer_text=answer.answer_text,
            score=answer.score,
            feedback=answer.feedback,
            created_at=answer.created_at
        )

    async def complete_session(
        self, db: AsyncSession, session_id: int
    ) -> InterviewFeedbackResponse:
        """
        Completes the session and generates overall feedback.
        """
        stmt = (
            select(InterviewSession)
            .options(
                selectinload(InterviewSession.questions).selectinload(InterviewQuestion.answer)
            )
            .where(InterviewSession.id == session_id)
        )
        session = (await db.execute(stmt)).scalar_one_or_none()
        
        if not session:
            raise ValueError("Session not found")

        # Compile Q&A history and calculate score efficiently
        details = []
        total_score = 0
        answered_questions = 0

        for q in sorted(session.questions, key=lambda x: x.order_index):
            if q.answer:
                total_score += q.answer.score
                answered_questions += 1
                details.append(
                    f"Q: {q.question_text}\nA: {q.answer.answer_text}\nScore: {q.answer.score}\nFeedback: {q.answer.feedback}"
                )
                
        overall_score = (total_score // answered_questions) if answered_questions > 0 else 0
        
        eval_json = await llm_service.call_llm(
            prompt_path="app/prompts/interview_summary.txt",
            schema=SummaryEvalSchema,
            qna_history="\n\n".join(details) if details else "No answered questions recorded."
        )

        session.status = "completed"
        session.overall_score = overall_score
        session.feedback_summary = json.dumps(eval_json, separators=(",", ":"))
        
        await db.commit()
        
        return InterviewFeedbackResponse(
            session_id=session.id,
            overall_score=overall_score,
            detailed_feedback=eval_json.get("summary", ""),
            strengths=eval_json.get("strengths", []),
            weaknesses=eval_json.get("weaknesses", [])
        )


interview_service = InterviewService()

