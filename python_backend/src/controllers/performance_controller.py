import sys
import logging
import json
from src.components.generate_interview_performance import get_performance
from src.exception import MyException

async def performance(thread_id: str):
    logging.info(f"Entering performance controller for thread_id: {thread_id}")
    try:
        res = await get_performance(thread_id=thread_id)
        # res=json.dumps(res.model_dump()) # Removing this if not needed or keeping consistent
        logging.info("Performance data retrieved")
        # Fixing common typo in previous version where it was a set instead of dict/tuple
        return {"data": res.model_dump()} 
    except Exception as e:
        raise MyException(e, sys)