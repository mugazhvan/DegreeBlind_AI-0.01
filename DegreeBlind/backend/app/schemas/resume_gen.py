from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

# ==========================================
# PASS 1: Analysis Schema
# ==========================================
class ResumeScores(BaseModel):
    overall_score: int = Field(..., description="Overall score out of 10", ge=0, le=10)
    ats_score: int = Field(..., description="ATS compatibility score out of 100", ge=0, le=100)
    readability_score: int = Field(..., description="Readability score out of 10", ge=0, le=10)
    professionalism_score: int = Field(..., description="Professionalism score out of 10", ge=0, le=10)
    design_score: int = Field(..., description="Design layout score out of 10", ge=0, le=10)

class ResumeAnalysisSchema(BaseModel):
    scores: ResumeScores
    executive_summary: str = Field(..., description="Recruiter-style executive summary")
    high_priority_fixes: List[str] = Field(..., description="List of high priority actionable fixes")
    medium_priority_fixes: List[str] = Field(..., description="List of medium priority fixes")
    optional_improvements: List[str] = Field(..., description="Optional nice-to-have improvements")
    weak_areas: List[str] = Field(..., description="Areas where the candidate is weak")
    strong_areas: List[str] = Field(..., description="Areas where the candidate excels")

# ==========================================
# PASS 2: Optimized Resume Schema
# ==========================================
class ContactInfo(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    location: Optional[str] = None

class ExperienceItem(BaseModel):
    company: str
    role: str
    location: Optional[str] = None
    start_date: str
    end_date: str
    bullet_points: List[str] = Field(..., description="Rewritten using action verbs and quantified impact")

class ProjectItem(BaseModel):
    name: str
    description: str
    technologies: List[str]
    link: Optional[str] = None
    bullet_points: List[str]

class EducationItem(BaseModel):
    institution: str
    degree: str
    start_date: Optional[str] = None
    end_date: str
    gpa: Optional[str] = None

class SkillsSection(BaseModel):
    languages: List[str] = []
    frameworks: List[str] = []
    tools: List[str] = []
    databases: List[str] = []
    cloud: List[str] = []

class OptimizedResumeSchema(BaseModel):
    contact: ContactInfo
    summary: str = Field(..., description="Rewritten professional summary")
    experience: List[ExperienceItem]
    projects: List[ProjectItem]
    education: List[EducationItem]
    skills: SkillsSection

# ==========================================
# PASS 3: Theme Metadata
# ==========================================
class ThemeMetadata(BaseModel):
    font_family: str
    primary_color: str
    secondary_color: str
    layout_type: str = Field(..., description="e.g., one_column, two_column")

# ==========================================
# PASS 5: Final Deliverable
# ==========================================
class FinalDeliverableSchema(BaseModel):
    generation_id: int
    target_role: str
    theme: str
    analysis: ResumeAnalysisSchema
    optimized_resume: OptimizedResumeSchema
    pdf_url: Optional[str] = None
    docx_url: Optional[str] = None
    status: str

# ==========================================
# Request Schemas
# ==========================================
class ResumeGenerateRequest(BaseModel):
    target_role: str
    theme: str = "modern"
    source_resume_id: Optional[int] = None

class GeneratedResumeResponse(BaseModel):
    markdown_content: str
    html_content: str
