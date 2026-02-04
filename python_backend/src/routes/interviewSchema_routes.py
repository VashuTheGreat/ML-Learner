import fastapi
from fastapi import Request,Depends
from src.controllers.interview_controller import interview,chat_intervier,List,Query

router=fastapi.APIRouter()


@router.post("/generate_interview_schemas")
async def generate_interview_schemas(no_of_interviews: int = 3,
    updated: bool = False,
    fields: List[str] = Query(default=["AI/ML", "Backend", "Data Science"]),
    companiesName: List[str] = Query(default=["Google","Amazon","Microsoft","Apple","Meta","Netflix"])):


    return await interview( no_of_interviews=no_of_interviews,
    updated=updated,
    fields=fields,
    companiesName=companiesName)


@router.post("/chat_intervier")
async def chat_intervier(thread_id: str='1', time_remain: int='1', topic: str='machine learning', user_input: str='hello sir'):
    return await chat_intervier(thread_id=thread_id, time_remain=time_remain, topic=topic, user_input=user_input)
