import fastapi
from src.controllers.health_controllers import health
router=fastapi.APIRouter()


@router.get("/health")
async def _health():
    return await health()
