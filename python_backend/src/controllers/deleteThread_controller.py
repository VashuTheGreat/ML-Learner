import sys
import logging
from src.components.interview import deleteThread
from src.exception import MyException

async def deleteThread_conversation(thread_id: str):
    logging.info(f"Entering deleteThread_conversation controller for thread_id: {thread_id}")
    try:
        res = await deleteThread(thread_id=thread_id)
        logging.info("Thread deleted successfully")
        return {"data": res}
    except Exception as e:
        raise MyException(e, sys)