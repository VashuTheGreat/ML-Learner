from src.components.interview import deleteThread

async def deleteThread_conversation(thread_id:str):
    res=await deleteThread(thread_id=thread_id)
    return {"data":res}