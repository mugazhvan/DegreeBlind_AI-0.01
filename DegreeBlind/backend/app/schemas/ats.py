from pydantic import BaseModel, Field
from typing import List, Optional

class ATSDeduction(BaseModel):
    metric: str = Field(description="The metric that caused the deduction (e.g., 'Action Verbs', 'Formatting')")
    deduction_amount: int = Field(description="Points deducted (e.g., 5)")
    reason: str = Field(description="Explanation for the deduction")

class ATSImprovement(BaseModel):
    category: str = Field(description="Category of improvement")
    suggestion: str = Field(description="Actionable advice for the user")

class ATSKeywordMatch(BaseModel):
    found_keywords: List[str] = Field(description="Keywords found in the resume matching the JD or industry standard")
    missing_keywords: List[str] = Field(description="Important keywords missing from the resume")
    keyword_density_score: int = Field(description="Score out of 100 for keyword density")

class ATSScoreDetail(BaseModel):
    category: str = Field(description="e.g., 'Formatting', 'Readability', 'ATS Compatibility'")
    score: int = Field(description="Score out of 100 for this specific category")
    feedback: str = Field(description="Qualitative feedback from the AI")

class ATSScoreResponse(BaseModel):
    overall_score: int = Field(description="Overall ATS Score (0-100)")
    categories: List[ATSScoreDetail] = Field(description="Detailed scores per category")
    keyword_analysis: ATSKeywordMatch
    deductions: List[ATSDeduction] = Field(description="List of specific deductions applied")
    improvements: List[ATSImprovement] = Field(description="List of actionable improvements")
