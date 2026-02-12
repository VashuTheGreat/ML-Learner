import fastapi
from fastapi import Request, Depends
from typing import List
from fastapi import Query
from src.pipelines.interviewSchemaPipeline import InterviewSchemaPipeline
from src.pipelines.ChatInterviewer_pipeline import ChatInterviewerPipeline
from src.constants import DEFAULT_INTERVIEW_FIELDS, DEFAULT_COMPANIES

router = fastapi.APIRouter()


@router.post("/generate_interview_schemas")
async def generate_interview_schemas(
    no_of_interviews: int = 3,
    updated: bool = False,
    fields: List[str] = Query(default=DEFAULT_INTERVIEW_FIELDS),
    companiesName: List[str] = Query(default=DEFAULT_COMPANIES)
):
    return await InterviewSchemaPipeline(no_of_interviews=no_of_interviews, updated=updated, fields=fields, companiesName=companiesName).initiate()


@router.post("/chat_interviewer")
async def chat_interviewer(thread_id: str='1', time_remain: int='1', topic: str='machine learning', user_input: str='hello sir'):
    return await ChatInterviewerPipeline(thread_id=thread_id, time_remain=time_remain, topic=topic, user_input=user_input).initiate()
