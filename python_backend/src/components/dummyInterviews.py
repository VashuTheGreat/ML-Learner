from pydantic import BaseModel, Field
from datetime import datetime, timezone, timedelta
from typing import List
from langchain_aws import ChatBedrockConverse
import json
from src.prompts.dummyInterview_prompts import prompt as interview_generater_Prompt
from src.utils.common_LLm import llm
class InterviewSchema(BaseModel):
    companyName: str = Field(..., description="Company name")
    topic: str = Field(..., description="Interview topic")
    job_Role: str = Field(..., description="Job role")
    time: str = Field(..., description="Interview date and time")

class InterviewResponse(BaseModel):
    result: List[InterviewSchema]

llm = llm

llm_structured = llm.with_structured_output(InterviewResponse)

async def generate_interview_schema(no_of_interviews: int = 3, fields: List[str] = None,updated:bool=False,companiesName:List[str]=['Google',"Amazon","Microsoft","Apple","Meta","Netflix"]):
    if fields is None:
        fields = []
        
    if not updated:
        with open("interviews.json", "r") as f:
            res = json.load(f)
        return res

    current_time = datetime.now(timezone.utc)
    min_date = (current_time + timedelta(days=2)).strftime("%Y-%m-%dT%H:%M:%SZ")
    max_date = (current_time + timedelta(days=7)).strftime("%Y-%m-%dT%H:%M:%SZ")

    prompt = interview_generater_Prompt.format(
    no_of_interviews=no_of_interviews,
    fields=fields,
    companiesName=companiesName,
    min_date=min_date,
    max_date=max_date,
)

    result = await llm_structured.ainvoke(prompt)

    interviews = []
    if result and getattr(result, "result", None):
        for interview in result.result:
            interviews.append({
                "companyName": getattr(interview, "companyName", "Unknown"),
                "topic": getattr(interview, "topic", "Unknown"),
                "job_Role": getattr(interview, "job_Role", "Unknown"),
                "time": getattr(interview, "time", current_time.isoformat()),
                "status": "pending"
            })
    with open("interviews.json", "w") as f:
        json.dump(interviews, f, indent=4)    

    return interviews
