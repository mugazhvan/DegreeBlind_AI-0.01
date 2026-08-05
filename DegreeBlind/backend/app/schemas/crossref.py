from pydantic import BaseModel, Field
from typing import List, Literal

class Discrepancy(BaseModel):
    type: Literal["Missing Project", "Fake Skill", "Unused Technology", "Unsupported Claim"] = Field(description="The category of the discrepancy")
    description: str = Field(description="A clear explanation of the inconsistency found")
    severity: Literal["Low", "Medium", "High"] = Field(description="How critical this discrepancy is to the candidate's credibility")

class HiddenStrength(BaseModel):
    description: str = Field(description="A skill or strength evident in the GitHub repos but missing from the resume")
    evidence_from_repo: str = Field(description="The specific repo or code where this was found")

class CrossReferenceResponse(BaseModel):
    consistency_score: int = Field(description="Score out of 100 on how consistent the resume is with the GitHub repos")
    credibility_score: int = Field(description="Score out of 100 on the authenticity of the resume claims based on code evidence")
    trust_score: int = Field(description="Aggregate score (Consistency + Credibility) out of 100 indicating overall trust in the candidate")
    
    discrepancies: List[Discrepancy] = Field(description="List of inconsistencies found between the resume and repos")
    hidden_strengths: List[HiddenStrength] = Field(description="List of strengths found in repos but not in the resume")
    
    recommendations: List[str] = Field(description="Actionable advice for the candidate to align their resume and GitHub presence")
