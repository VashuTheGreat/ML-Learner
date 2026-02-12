from pydantic import BaseModel, Field
from typing import List, Optional, Dict
class Project(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tech_stack: List[str] = Field(default_factory=list)

class Education(BaseModel):
    degree: Optional[str] = None
    institute: Optional[str] = None
    year: Optional[str] = None

class Experience(BaseModel):
    role: Optional[str] = None
    company: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None

class ResumeSchema(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    soft_skills: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    education: List[Education] = Field(default_factory=list)
    experience: List[Experience] = Field(default_factory=list)
    projects: List[Project] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)
    someImportantUrls: Dict[str, str] = Field(default_factory=dict)

class ResumeState(BaseModel):
    userDetails: str
    ai_generated_schema: Optional[ResumeSchema] = None
