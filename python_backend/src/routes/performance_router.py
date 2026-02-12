import fastapi
from src.pipelines.performance_pipeline import PerformancePipeline
router=fastapi.APIRouter()

@router.get("/performance/{thread_id}")
async def performance(thread_id:str):
    performancePipeline=PerformancePipeline(thread_id=thread_id)
    performance=await performancePipeline.initiate()
    return performance

