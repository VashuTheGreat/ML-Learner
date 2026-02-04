from typing import List
from fastapi import Query
from src.components.dummyInterviews import generate_interview_schema
from src.components.interview import chat_interviewer

async def interview(
    no_of_interviews: int = 3,
    updated: bool = False,
    fields: List[str] = Query(default=["AI/ML", "Backend", "Data Science"]),
    companiesName: List[str] = Query(default=["Google","Amazon","Microsoft","Apple","Meta","Netflix"])
):
    res = await generate_interview_schema(
        no_of_interviews=no_of_interviews,
        fields=fields,
        updated=updated,
        companiesName=companiesName
    )
    return {"interviews": res}



async def chat_intervier(thread_id: str='1', time_remain: int='1', topic: str='machine learning', user_input: str='hello sir'):
    res=await chat_interviewer(thread_id=thread_id,time_remain=time_remain,topic=topic,user_input=user_input)
    return {"ai_response":res['messages'][-1].content}