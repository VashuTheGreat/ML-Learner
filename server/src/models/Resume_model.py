from pydantic import BaseModel, EmailStr
from typing import List, Optional, Literal


class Links(BaseModel):
    social_links: List[str] = []


class Experience(BaseModel):
    role: str
    company: str
    summary: str


class Education(BaseModel):
    degree: str
    college: str
    university: str
    start: Optional[str] = None
    end: Optional[str] = None


class Project(BaseModel):
    title: str
    bullet_points: List[str]
    links: List[str] = []


class ResumeSchema(BaseModel):
    name: str
    email: EmailStr
    phone: str
    location: str

    summary: str

    links: Links

    skills: List[str]

    experience: List[Experience]

    education: List[Education]

    projects: List[Project]

    apparentSeniority: Literal["Junior", "Mid", "Senior"]

class ResumeState(BaseModel):
    userDetails: str
    ai_generated_schema: Optional[ResumeSchema] = None
