import fastapi
from src.controllers.deleteThread_controller import deleteThread_conversation
router = fastapi.APIRouter()

@router.delete("/{thread_id}")
async def _deleteThread(thread_id: str):
    return await deleteThread_conversation(thread_id=thread_id)
