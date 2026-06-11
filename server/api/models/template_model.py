from pydantic import BaseModel, Field
from typing import Any

class UpdateTemplateBody(BaseModel):
    """
    Schema for updating templates (e.g. resume information schemas or coding configs).
    """
    content: Any = Field(
        ...,
        description="The updated template content. This can be a structured dictionary or any arbitrary object representing template settings.",
        example={"work_experience": [{"company": "Google", "role": "ML Engineer"}]}
    )

    class Config:
        json_schema_extra = {
            "example": {
                "content": {
                    "personal_info": {"name": "John Doe", "email": "john@example.com"},
                    "skills": ["Python", "Machine Learning", "FastAPI"],
                    "experience": []
                }
            }
        }