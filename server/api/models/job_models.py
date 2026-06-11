from pydantic import BaseModel, Field
from typing import Optional


class FetchJobsRequest(BaseModel):
    """
    Schema for filtering/refreshing fetched job opportunities.
    """
    jobtile: Optional[str] = Field(
        "machine learning intern",
        description="The job title or query to search for jobs.",
        example="machine learning engineer"
    )
    updated: Optional[bool] = Field(
        False,
        description="Flag to bypass internal cache and fetch fresh job descriptions.",
        example=True
    )


class ATS_SCORE(BaseModel):
    """
    Schema to calculate alignment/ATS similarity score between a user's resume/profile details and a target job description.
    """
    jobDiscription: str = Field(
        ...,
        description="The full text content of the target job description.",
        example="We are looking for an ML Engineer with experience in PyTorch and transformers..."
    )
    userDetails: str = Field(
        ...,
        description="The user's skills, experience, or parsed resume content text.",
        example="Experienced in PyTorch, developed and trained transformer models for NLP..."
    )

    class Config:
        json_schema_extra = {
            "example": {
                "jobDiscription": "Requires Python, SQL, and 2+ years of Machine Learning experience.",
                "userDetails": "Skills: Python, SQL. Experience: 3 years building predictive models."
            }
        }

