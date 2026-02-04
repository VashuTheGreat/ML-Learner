from src.controllers.performance_controller import get_performance
import fastapi
router=fastapi.APIRouter()

@router.get("/performance/{thread_id}")
async def performance(thread_id:str):
    return await get_performance(thread_id=thread_id)

