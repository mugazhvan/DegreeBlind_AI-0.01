"""
Pydantic schemas for the Interview Engine (Phase 12).
Generates interview questions and evaluates answers.
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class GeneratedQuestion(BaseModel):
    question_text: str = Field(description="The interview question")
    question_type: str = Field(description="'behavioral', 'technical', 'coding', or 'design'")
    difficulty: str = Field(description="'easy', 'medium', or 'hard'")
    expected_topics: List[str] = Field(description="Key topics the answer should cover")


class InterviewGenerationResponse(BaseModel):
    interview_type: str = Field(description="The type of interview generated")
    questions: List[GeneratedQuestion] = Field(description="List of generated questions")


class AnswerEvaluation(BaseModel):
    score: int = Field(description="Score out of 100 for this answer")
    feedback: str = Field(description="Detailed feedback on the answer")
    strengths: List[str] = Field(description="What was good about the answer")
    improvements: List[str] = Field(description="How the answer could be improved")
    model_answer: str = Field(description="An example of an ideal answer")


class InterviewSummary(BaseModel):
    overall_score: int = Field(description="Overall interview score (0-100)")
    feedback_summary: str = Field(description="Overall feedback from the recruiter's perspective")
    strengths: List[str] = Field(description="Candidate's interview strengths")
    weaknesses: List[str] = Field(description="Areas to improve")
    hire_recommendation: str = Field(description="'Strong Hire', 'Hire', 'Lean Hire', 'Lean No Hire', 'No Hire'")


# Request schemas

class StartInterviewRequest(BaseModel):
    interview_type: str = Field(description="Type: 'hr', 'technical', 'dsa', 'system_design', 'resume', 'github'")
    target_role: Optional[str] = Field(None, description="Optional target role for contextualized questions")


class SubmitAnswerRequest(BaseModel):
    question_id: int
    answer_text: str

class InterviewQuestionResponse(BaseModel):
    id: int
    question_text: str
    question_type: str
    difficulty: str

class InterviewSessionResponse(BaseModel):
    id: int
    interview_type: str
    target_role: Optional[str] = None
    status: str
    questions: List[InterviewQuestionResponse] = []

class InterviewAnswerSubmit(BaseModel):
    answer_text: str

class InterviewAnswerResponse(BaseModel):
    id: int
    question_id: int
    answer_text: str
    score: int
    feedback: str
    created_at: datetime

class InterviewFeedbackResponse(BaseModel):
    overall_score: int
    feedback_summary: str
    strengths: List[str]
    weaknesses: List[str]
    hire_recommendation: str
