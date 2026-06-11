from fastapi import Request, HTTPException
from api.models.multi_rag_models import User

async def authenticate_user(request: Request):
    thread_id = request.cookies.get("thread_id")
    if not thread_id:
        raise HTTPException(
            status_code=401,
            detail={"success": False, "message": "Please login", "data": None}
        )

    request.scope["user"] = User(thread_id=thread_id)