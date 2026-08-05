"""
Pydantic schemas for the Career Intelligence Engine (Phase 9).
Aggregates Resume + GitHub + ATS + Engineering scores into a unified career profile.
"""
from pydantic import BaseModel, Field
from typing import List, Optional


class CareerDimension(BaseModel):
    score: int = Field(description="Score out of 100")
    reasoning: str = Field(description="Brief justification")


class CareerIntelligenceResponse(BaseModel):
    # Core Scores
    career_score: int = Field(description="Overall career readiness score (0-100)")
    resume_score: CareerDimension = Field(description="Quality and completeness of the resume")
    ats_score: CareerDimension = Field(description="ATS compatibility assessment")
    engineering_score: CareerDimension = Field(description="Technical engineering capability based on GitHub")
    employability: CareerDimension = Field(description="How employable the candidate is based on all data")
    interview_readiness: CareerDimension = Field(description="How prepared the candidate is for interviews")

    # Qualitative
    strengths: List[str] = Field(description="Top career strengths")
    weaknesses: List[str] = Field(description="Areas for improvement")
    recommended_roles: List[str] = Field(description="Job titles the candidate is best suited for")
    salary_range: Optional[str] = Field(None, description="Estimated salary range based on skills and experience")

    # Actionable
    next_steps: List[str] = Field(description="Immediate actions the candidate should take")
