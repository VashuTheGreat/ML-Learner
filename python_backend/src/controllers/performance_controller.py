import json
from src.components.generate_interview_performance import get_performance
async def performance(thread_id:str):
    res=await get_performance(thread_id=thread_id)
    # print(res)
    res=json.dumps(res.model_dump())
    return {"data",res}