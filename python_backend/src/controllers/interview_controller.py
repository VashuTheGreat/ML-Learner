import sys
import logging
from typing import List
from fastapi import Query
from src.components.dummyInterviews import generate_interview_schema
from src.components.interview import chat_interviewer as chat_node
from src.exception import MyException
from src.constants import DEFAULT_INTERVIEW_FIELDS, DEFAULT_COMPANIES

async def interview(
    no_of_interviews: int = 3,
    updated: bool = False,
    fields: List[str] = Query(default=DEFAULT_INTERVIEW_FIELDS),
    companiesName: List[str] = Query(default=DEFAULT_COMPANIES)
):
    logging.info("Entering interview controller")
    try:
        res = await generate_interview_schema(
            no_of_interviews=no_of_interviews,
            fields=fields,
            updated=updated,
            companiesName=companiesName
        )
        logging.info("Interview schema generated successfully")
        print("the schema generated is ",res)
        return {"interviews": res}
    except Exception as e:
        raise MyException(e, sys)

async def chat_interviewer(thread_id: str='1', time_remain: int='1', topic: str='machine learning', user_input: str='hello sir'):
    logging.info(f"Entering chat_interviewer controller for thread_id: {thread_id}")
    try:
        res = await chat_node(thread_id=thread_id, time_remain=time_remain, topic=topic, user_input=user_input)
        logging.info("AI response received")
        return {"ai_response": res['messages'][-1].content}
    except Exception as e:
        raise MyException(e, sys)