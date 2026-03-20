import fastapi
from typing import List
from fastapi import Query
from src.Agents.pipelines.DummyInterviews_pipeline import DummyInterviewsPipeline
from src.Agents.pipelines.AiInterviewChat_pipeline import ChatInterviewerPipeline
from src.Agents.constants import DEFAULT_INTERVIEW_FIELDS, DEFAULT_COMPANIES
import logging
import sys
from exception import MyException

router = fastapi.APIRouter()

@router.post("/generate_interview_schemas")
async def generate_interview_schemas(
    no_of_interviews: int = 3,
    updated: bool = False,
    fields: List[str] = Query(default=DEFAULT_INTERVIEW_FIELDS),
    companiesName: List[str] = Query(default=DEFAULT_COMPANIES)
):
    logging.info("Entering generate_interview_schemas route (async)")
    try:
        pipeline = DummyInterviewsPipeline(
            no_of_interviews=no_of_interviews, 
            updated=updated, 
            fields=fields, 
            companiesName=companiesName
        )
        return await pipeline.initiate()
    except Exception as e:
        raise MyException(e, sys)

@router.post("/chat_interviewer")
async def chat_interviewer(
    thread_id: str = '1', 
    time_remain: int = 1, 
    topic: str = 'machine learning', 
    user_input: str = 'hello'
):
    logging.info("Entering chat_interviewer route (async)")
    try:
        pipeline = ChatInterviewerPipeline()
        return await pipeline.initiate(
            thread_id=thread_id, 
            time_remain=time_remain, 
            topic=topic, 
            user_input=user_input
        )
    except Exception as e:
        raise MyException(e, sys)
