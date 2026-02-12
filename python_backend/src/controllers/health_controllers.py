from fastapi.responses import JSONResponse
import logging

async def health():
    logging.info("Health check requested")
    return JSONResponse(status_code=200, content={"success": True})
