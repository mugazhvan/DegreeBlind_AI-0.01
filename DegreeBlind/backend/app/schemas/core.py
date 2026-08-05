"""
Core Pydantic schemas shared across the application.
"""
from pydantic import BaseModel, ConfigDict
from typing import Dict, List, Optional

from app.schemas.engineering import EngineeringIntelligenceResponse


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


class FullReport(BaseModel):
    """The complete report returned to the frontend after a GitHub analysis."""
    repository: Optional[RepositoryData] = None
    languages: Optional[Dict[str, int]] = None
    analysis: Optional[EngineeringIntelligenceResponse] = None


class AnalysisStartResponse(BaseModel):
    analysis_id: int
    status: str


class AnalysisStatusResponse(BaseModel):
    status: str
    error: Optional[str] = None
    report: Optional[FullReport] = None
