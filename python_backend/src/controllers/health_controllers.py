from fastapi.responses import JSONResponse

async def health():
    return JSONResponse(status_code=200,content={"success":True})

