from pydantic import BaseModel, Field
from typing import Dict, List, Optional

class ScoreDimension(BaseModel):
    score: int = Field(description="Score out of 100")
    reasoning: str = Field(description="Brief justification for the score")

class Recommendation(BaseModel):
    category: str = Field(description="e.g., 'Career', 'Learning'")
    suggestion: str = Field(description="Actionable advice based on the repo analysis")

class EngineeringIntelligenceResponse(BaseModel):
    # Core Scores
    architecture: ScoreDimension
    code_quality: ScoreDimension
    security: ScoreDimension
    testing: ScoreDimension
    documentation: ScoreDimension
    maintainability: ScoreDimension
    scalability: ScoreDimension
    project_complexity: ScoreDimension
    engineering_maturity: ScoreDimension
    best_practices: ScoreDimension

    # Derived Data
    engineering_score: int = Field(description="Overall aggregate score out of 100")
    skill_radar: Dict[str, int] = Field(description="Dictionary mapping technical skills (e.g., 'Python', 'Docker') to proficiency scores (0-100)")
    
    # Qualitative Summaries
    recruiter_summary: str = Field(description="A concise summary for technical recruiters highlighting the engineer's capabilities based on this repo")
    strengths: List[str] = Field(description="Top engineering strengths demonstrated")
    weaknesses: List[str] = Field(description="Areas where the repository/engineer falls short")
    
    # Recommendations
    career_recommendations: List[Recommendation] = Field(description="Suggested roles or career pivots")
    learning_recommendations: List[Recommendation] = Field(description="Technologies or practices the engineer should learn next")
