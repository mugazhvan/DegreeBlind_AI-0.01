"""
Pydantic schemas for the Job Match Engine (Phase 10).
Compares a candidate's profile against a specific job description.
"""
from pydantic import BaseModel, Field
from typing import List, Optional


class SkillMatch(BaseModel):
    skill: str = Field(description="The skill being evaluated")
    status: str = Field(description="'strong', 'partial', or 'missing'")
    evidence: str = Field(description="Where this skill was found or why it's missing")


class JobMatchResponse(BaseModel):
    match_percentage: int = Field(description="Overall match percentage (0-100)")
    missing_skills: List[str] = Field(description="Skills required by the JD but not found in the candidate's profile")
    strong_skills: List[str] = Field(description="Skills the candidate has that strongly match the JD")
    partial_skills: List[str] = Field(description="Skills that partially match or are related")
    skill_breakdown: List[SkillMatch] = Field(description="Detailed skill-by-skill analysis")

    salary_estimate: Optional[str] = Field(None, description="Estimated salary range for this role")
    interview_probability: int = Field(description="Probability (0-100) of getting an interview")
    learning_plan: List[str] = Field(description="Skills to learn to increase match score")

    recruiter_summary: str = Field(description="Summary for a recruiter about this candidate-job fit")
