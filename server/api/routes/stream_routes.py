from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import StreamingResponse
import os
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

RESOURCES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "resources")

@router.get("/video")
async def stream_video(request: Request):
    logger.info("Entered streaming controller")
    file_path = os.path.join(RESOURCES_DIR, "intro.mp4")
    
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail="Video file not found")
    
    file_size = os.path.getsize(file_path)
    range_header = request.headers.get("range")
    
    if not range_header:
        def iterfile():
            with open(file_path, mode="rb") as file_like:
                yield from file_like
        return StreamingResponse(iterfile(), media_type="video/mp4", headers={
            "Content-Length": str(file_size),
            "Accept-Ranges": "bytes"
        })
    
    # Simple range handling
    try:
        range_value = range_header.replace("bytes=", "").split("-")
        start = int(range_value[0])
        chunk_size = 1024 * 1024 # 1MB
        end = min(start + chunk_size, file_size - 1)
        if range_value[1]:
            end = int(range_value[1])
    except:
        start = 0
        end = file_size - 1

    content_length = end - start + 1
    
    def iterfile_range(start, end):
        with open(file_path, mode="rb") as file_like:
            file_like.seek(start)
            yield file_like.read(content_length)

    return StreamingResponse(
        iterfile_range(start, end),
        status_code=206,
        media_type="video/mp4",
        headers={
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(content_length),
        }
    )
