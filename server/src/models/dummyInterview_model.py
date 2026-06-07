from pydantic import BaseModel, Field
from typing import List

class InterviewSchema(BaseModel):
    companyName: str = Field(..., description="Company name")
    topic: str = Field(..., description="Interview topic")
    job_Role: str = Field(..., description="Job role")
    time: str = Field(..., description="Interview date and time")

class InterviewResponse(BaseModel):
    result: List[InterviewSchema]