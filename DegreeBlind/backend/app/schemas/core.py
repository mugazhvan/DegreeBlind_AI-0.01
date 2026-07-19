from pydantic import BaseModel, ConfigDict
from typing import Dict, List, Optional


class RepositoryData(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    name: str
    owner: str
    description: Optional[str] = None
    primaryLanguage: Optional[str] = None
    stars: Optional[int] = None
    forks: Optional[int] = None
    openIssues: Optional[int] = None
    defaultBranch: Optional[str] = None
    createdDate: Optional[str] = None
    lastUpdated: Optional[str] = None
    url: str
    license: Optional[str] = None
    topics: List[str] = []
    sizeKb: Optional[int] = None
    contributorsCount: Optional[int] = None


class AIAnalysisReport(BaseModel):
    problemSolving: Optional[str] = None
    architecture: Optional[str] = None
    codeQuality: Optional[str] = None
    documentation: Optional[str] = None
    security: Optional[str] = None
    testing: Optional[str] = None
    maintainability: Optional[str] = None
    scalability: Optional[str] = None
    overallSummary: Optional[str] = None


class RecommendedRole(BaseModel):
    roleName: str
    confidence: Optional[int] = None


class FullReport(BaseModel):
    repository: Optional[RepositoryData] = None
    languages: Optional[Dict[str, int]] = None
    analysis: Optional[AIAnalysisReport] = None
    roles: Optional[List[RecommendedRole]] = None
    recommendations: Optional[List[str]] = None


# AI Response Schema as dictated by the prompt instructions
class NemotronResponseSchema(BaseModel):
    repository_overview: str
    technical_strengths: List[str]
    areas_for_improvement: List[str]
    engineering_practices: str
    documentation_review: str
    security_observations: str
    testing_review: str
    architecture_assessment: str
    maintainability_assessment: str
    scalability_assessment: str
    final_summary: str
    potential_roles: List[str]
