"""
Pydantic schemas for the Learning Roadmap Engine (Phase 11).
Generates personalized 30/60/90-day learning plans.
"""
from pydantic import BaseModel, Field
from typing import List, Optional


class WeeklyPlan(BaseModel):
    week_number: int = Field(description="Week number (e.g. 1 to 12)")
    theme: str = Field(description="Core learning theme for the week")
    daily_goals: List[str] = Field(description="Specific actionable learning tasks or code goals for the week")
    expected_outcome: str = Field(description="What should be completed or mastered by the end of the week")


class LearningMilestone(BaseModel):
    day_range: str = Field(description="e.g., 'Day 1-30', 'Day 31-60', 'Day 61-90'")
    focus_area: str = Field(description="The primary learning focus for this period")
    tasks: List[str] = Field(description="Specific learning tasks and goals")
    weekly_plans: Optional[List[WeeklyPlan]] = Field(None, description="Detailed week-by-week learning breakdown for this milestone")


class LearningResource(BaseModel):
    type: str = Field(description="'project', 'book', 'course', or 'certification'")
    name: str = Field(description="Name of the resource")
    url: Optional[str] = Field(None, description="Link to the resource if available")
    reason: str = Field(description="Why this resource is recommended")


class LearningRoadmapResponse(BaseModel):
    target_role: str = Field(description="The role the roadmap is designed for")
    current_level: str = Field(description="Assessment of current skill level (junior, mid, senior)")
    milestones: List[LearningMilestone] = Field(description="30/60/90-day milestones")
    weekly_planner: Optional[List[WeeklyPlan]] = Field(None, description="Comprehensive step-by-step detailed weekly learning schedule")
    recommended_projects: List[LearningResource] = Field(description="Projects to build")
    recommended_books: List[LearningResource] = Field(description="Books to read")
    recommended_courses: List[LearningResource] = Field(description="Courses to take")
    recommended_certifications: List[LearningResource] = Field(description="Certifications to pursue")
    key_skills_to_acquire: List[str] = Field(description="Critical skills to develop")

