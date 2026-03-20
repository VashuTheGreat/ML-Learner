import fastapi
import logging

router = fastapi.APIRouter()

@router.get("/health")
async def _health():
    logging.info("Health check requested")
    return {"status": "ok", "message": "Agents API is healthy"}
