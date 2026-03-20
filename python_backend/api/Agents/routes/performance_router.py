import fastapi
from src.Agents.pipelines.InterviewPerformance_pipeline import InterviewPerformancePipeline
import logging
import sys
from exception import MyException

router = fastapi.APIRouter()

@router.get("/performance/{thread_id}")
async def performance(thread_id: str):
    logging.info(f"Entering performance route for thread {thread_id} (async)")
    try:
        pipeline = InterviewPerformancePipeline()
        result = await pipeline.initiate(thread_id=thread_id)
        return result
    except Exception as e:
        raise MyException(e, sys)
