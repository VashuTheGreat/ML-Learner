from pydantic import BaseModel
from typing import Optional


class FetchJobsRequest(BaseModel):
    jobtile: Optional[str] = "machine learning intern"
    updated: Optional[bool] = False


class ATS_SCORE(BaseModel):
    jobDiscription: str
    userDetails: str
