import fastapi
from src.Agents.graphs.interview_graph_builder import deleteThread
import logging
import sys
from exception import MyException

router = fastapi.APIRouter()

@router.delete("/{thread_id}")
async def _deleteThread(thread_id: str):
    logging.info(f"Entering deleteThread route for thread {thread_id} (async)")
    try:
        success = await deleteThread(thread_id=thread_id)
        if success:
            return {"status": "success", "message": f"Thread {thread_id} deleted"}
        else:
            return {"status": "error", "message": f"Thread {thread_id} not found or error occurred"}
    except Exception as e:
        raise MyException(e, sys)
