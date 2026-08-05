from pydantic import BaseModel, Field
from typing import List, Optional

class ResumePersonalInfo(BaseModel):
    name: str = Field(description="Full name of the candidate")
    email: Optional[str] = Field(None, description="Email address")
    phone: Optional[str] = Field(None, description="Phone number")
    location: Optional[str] = Field(None, description="City, State, or Country")
    linkedin: Optional[str] = Field(None, description="LinkedIn profile URL")
    github: Optional[str] = Field(None, description="GitHub profile URL")
    website: Optional[str] = Field(None, description="Personal website or portfolio URL")

class ResumeSkill(BaseModel):
    category: str = Field(description="Category of the skill (e.g., Languages, Frameworks, Tools)")
    skills: List[str] = Field(description="List of specific skills in this category")

class ResumeExperience(BaseModel):
    company: str = Field(description="Name of the company or organization")
    role: str = Field(description="Job title or role")
    location: Optional[str] = Field(None, description="Location of the job")
    start_date: Optional[str] = Field(None, description="Start date (e.g., MM/YYYY or Month Year)")
    end_date: Optional[str] = Field(None, description="End date or 'Present'")
    description: List[str] = Field(description="List of bullet points describing the work done")

class ResumeEducation(BaseModel):
    institution: str = Field(description="Name of the educational institution")
    degree: str = Field(description="Degree obtained or pursued (e.g., B.S. Computer Science)")
    location: Optional[str] = Field(None, description="Location of the institution")
    start_date: Optional[str] = Field(None, description="Start date")
    end_date: Optional[str] = Field(None, description="End date or expected graduation")
    gpa: Optional[str] = Field(None, description="GPA if mentioned")

class ResumeProject(BaseModel):
    name: str = Field(description="Name of the project")
    description: List[str] = Field(description="List of bullet points describing the project")
    technologies: List[str] = Field(default_factory=list, description="Technologies used in the project")
    url: Optional[str] = Field(None, description="Link to the project (GitHub, live site, etc.)")

class ResumeCertification(BaseModel):
    name: str = Field(description="Name of the certification")
    issuer: str = Field(description="Organization that issued the certification")
    date: Optional[str] = Field(None, description="Date issued")

class ParsedResumeResponse(BaseModel):
    personal_info: ResumePersonalInfo
    skills: List[ResumeSkill] = Field(default_factory=list)
    experience: List[ResumeExperience] = Field(default_factory=list)
    education: List[ResumeEducation] = Field(default_factory=list)
    projects: List[ResumeProject] = Field(default_factory=list)
    certifications: List[ResumeCertification] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list, description="List of general achievements or awards")
    summary: Optional[str] = Field(None, description="A brief professional summary if present on the resume")
