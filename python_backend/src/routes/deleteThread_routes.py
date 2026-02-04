import fastapi
from src.controllers.deleteThread_controller import deleteThread
router=fastapi.APIRouter()
@router.get("/deleteThread/{thread_id}")
async def _deleteThread(thread_id: str):
    return await deleteThread(thread_id=thread_id)
