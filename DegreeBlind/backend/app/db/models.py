"""
SQLAlchemy ORM models for DegreeBlind.
All models use integer auto-increment PKs for SQLite compatibility.
UUID PKs can be swapped in when migrating to PostgreSQL.
"""
from datetime import datetime
from sqlalchemy import String, Integer, Float, DateTime, JSON, ForeignKey, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    provider_id: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    name: Mapped[str | None] = mapped_column(String(255))
    email: Mapped[str | None] = mapped_column(String(255))
    avatar_url: Mapped[str | None] = mapped_column(String(512))
    github_username: Mapped[str | None] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    resumes: Mapped[list["Resume"]] = relationship(back_populates="user")
    cross_references: Mapped[list["CrossReference"]] = relationship(back_populates="user")
    career_reports: Mapped[list["CareerIntelligence"]] = relationship(back_populates="user")
    job_matches: Mapped[list["JobMatch"]] = relationship(back_populates="user")
    learning_roadmaps: Mapped[list["LearningRoadmap"]] = relationship(back_populates="user")
    interview_sessions: Mapped[list["InterviewSession"]] = relationship(back_populates="user")


class Repository(Base):
    __tablename__ = "repositories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    github_id: Mapped[int | None] = mapped_column(Integer)
    owner: Mapped[str] = mapped_column(String(255), nullable=False)
    repository_name: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(512), nullable=False, unique=True)
    repository_url: Mapped[str] = mapped_column(String(512), nullable=False)
    default_branch: Mapped[str | None] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(String(1024))
    stars: Mapped[int | None] = mapped_column(Integer, default=0)
    forks: Mapped[int | None] = mapped_column(Integer, default=0)
    language: Mapped[str | None] = mapped_column(String(100))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    analyses: Mapped[list["Analysis"]] = relationship(back_populates="repository")


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    repository_id: Mapped[int] = mapped_column(ForeignKey("repositories.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending")  # pending, processing, completed, failed
    execution_time: Mapped[float | None] = mapped_column(Float)
    ai_model: Mapped[str] = mapped_column(String(100))
    prompt_version: Mapped[str] = mapped_column(String(50))
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False)
    error_message: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    repository: Mapped["Repository"] = relationship(back_populates="analyses")
    report: Mapped["Report"] = relationship(back_populates="analysis", uselist=False)


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    analysis_id: Mapped[int] = mapped_column(ForeignKey("analyses.id"), nullable=False)
    report_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    summary: Mapped[str | None] = mapped_column(String(1024))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    analysis: Mapped["Analysis"] = relationship(back_populates="report")


class Resume(Base):
    __tablename__ = "resumes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    file_hash: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    status: Mapped[str] = mapped_column(String(50), default="pending")  # pending, processing, completed, failed
    error_message: Mapped[str | None] = mapped_column(String(1024))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship(back_populates="resumes")
    parsed_resume: Mapped["ParsedResume"] = relationship(back_populates="resume", uselist=False)
    ats_score: Mapped["ATSScore"] = relationship(back_populates="resume", uselist=False)


class ParsedResume(Base):
    __tablename__ = "parsed_resumes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    resume_id: Mapped[int] = mapped_column(ForeignKey("resumes.id"), nullable=False, unique=True)
    parsed_json: Mapped[dict] = mapped_column(JSON, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    resume: Mapped["Resume"] = relationship(back_populates="parsed_resume")


class ATSScore(Base):
    __tablename__ = "ats_scores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    resume_id: Mapped[int] = mapped_column(ForeignKey("resumes.id"), nullable=False, unique=True)
    job_description_hash: Mapped[str | None] = mapped_column(String(255))
    overall_score: Mapped[int] = mapped_column(Integer, nullable=False)
    score_data: Mapped[dict] = mapped_column(JSON, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    resume: Mapped["Resume"] = relationship(back_populates="ats_score")


class CrossReference(Base):
    __tablename__ = "cross_references"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    consistency_score: Mapped[int] = mapped_column(Integer, nullable=False)
    credibility_score: Mapped[int] = mapped_column(Integer, nullable=False)
    trust_score: Mapped[int] = mapped_column(Integer, nullable=False)
    report_data: Mapped[dict] = mapped_column(JSON, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship(back_populates="cross_references")


# ============================================================
# Phase 9 — Career Intelligence Engine
# ============================================================

class CareerIntelligence(Base):
    __tablename__ = "career_intelligence"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    career_score: Mapped[int] = mapped_column(Integer, nullable=False)
    report_data: Mapped[dict] = mapped_column(JSON, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship(back_populates="career_reports")


# ============================================================
# Phase 10 — Job Match Engine
# ============================================================

class JobMatch(Base):
    __tablename__ = "job_matches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    job_title: Mapped[str] = mapped_column(String(255), nullable=False)
    job_description: Mapped[str] = mapped_column(Text, nullable=False)
    match_score: Mapped[int] = mapped_column(Integer, nullable=False)
    report_data: Mapped[dict] = mapped_column(JSON, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship(back_populates="job_matches")


# ============================================================
# Phase 11 — Learning Roadmap
# ============================================================

class LearningRoadmap(Base):
    __tablename__ = "learning_roadmaps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    target_role: Mapped[str] = mapped_column(String(255), nullable=False)
    report_data: Mapped[dict] = mapped_column(JSON, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship(back_populates="learning_roadmaps")


# ============================================================
# Phase 12 — Interview Engine
# ============================================================

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    interview_type: Mapped[str] = mapped_column(String(50), nullable=False)  # hr, technical, dsa, system_design, resume, github
    target_role: Mapped[str | None] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(50), default="in_progress")  # in_progress, completed
    overall_score: Mapped[int | None] = mapped_column(Integer)
    feedback_summary: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship(back_populates="interview_sessions")
    questions: Mapped[list["InterviewQuestion"]] = relationship(back_populates="session", cascade="all, delete-orphan")


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("interview_sessions.id"), nullable=False)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_type: Mapped[str] = mapped_column(String(50), nullable=False)  # behavioral, technical, coding, design
    difficulty: Mapped[str] = mapped_column(String(20), default="medium")  # easy, medium, hard
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    session: Mapped["InterviewSession"] = relationship(back_populates="questions")
    answer: Mapped["InterviewAnswer"] = relationship(back_populates="question", uselist=False)


class InterviewAnswer(Base):
    __tablename__ = "interview_answers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    question_id: Mapped[int] = mapped_column(ForeignKey("interview_questions.id"), nullable=False, unique=True)
    answer_text: Mapped[str] = mapped_column(Text, nullable=False)
    score: Mapped[int | None] = mapped_column(Integer)  # 0-100
    feedback: Mapped[str | None] = mapped_column(Text)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    question: Mapped["InterviewQuestion"] = relationship(back_populates="answer")


# ============================================================
# Phase 13 — AI Resume Design Engine
# ============================================================

class ResumeGeneration(Base):
    __tablename__ = "resume_generations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    source_resume_id: Mapped[int | None] = mapped_column(ForeignKey("resumes.id"), nullable=True)
    target_role: Mapped[str] = mapped_column(String(255), nullable=False)
    theme_choice: Mapped[str] = mapped_column(String(50), default="modern")
    status: Mapped[str] = mapped_column(String(50), default="pending")  # pending, analyzing, rewriting, rendering, completed, failed
    final_pdf_url: Mapped[str | None] = mapped_column(String(1024))
    final_docx_url: Mapped[str | None] = mapped_column(String(1024))

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    analysis_report: Mapped["ResumeAnalysisReport"] = relationship(back_populates="generation", uselist=False, cascade="all, delete-orphan")
    design: Mapped["ResumeDesign"] = relationship(back_populates="generation", uselist=False, cascade="all, delete-orphan")


class ResumeAnalysisReport(Base):
    __tablename__ = "resume_analysis_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    generation_id: Mapped[int] = mapped_column(ForeignKey("resume_generations.id"), nullable=False, unique=True)
    scores_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    weaknesses_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    improvements_json: Mapped[dict] = mapped_column(JSON, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    generation: Mapped["ResumeGeneration"] = relationship(back_populates="analysis_report")


class ResumeDesign(Base):
    __tablename__ = "resume_designs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    generation_id: Mapped[int] = mapped_column(ForeignKey("resume_generations.id"), nullable=False, unique=True)
    optimized_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    typography_meta: Mapped[dict] = mapped_column(JSON, nullable=False)
    layout_meta: Mapped[dict] = mapped_column(JSON, nullable=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    generation: Mapped["ResumeGeneration"] = relationship(back_populates="design")
