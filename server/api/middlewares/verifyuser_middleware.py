from fastapi import Request
import jwt
import os
from api.database import User, SessionLocal
from api.utils.api_error import ApiError

async def verify_jwt(request: Request):
    token = request.cookies.get("accessToken") or request.headers.get("Authorization")
    if token and token.startswith("Bearer "):
        token = token.replace("Bearer ", "")

    if not token:
        raise ApiError(401, "Unauthorized request")

    try:
        decoded_token = jwt.decode(token, os.getenv("ACCESS_TOKEN_SECRET", "secret"), algorithms=["HS256"])
        user_id = decoded_token.get("id")
        
        db = SessionLocal()
        user = db.query(User).filter(User.id == user_id).first()
        db.close()

        if not user:
            raise ApiError(401, "Invalid Access Token")

        request.state.user_id = user.id
        request.state.user = user
        return True

    except jwt.ExpiredSignatureError:
        raise ApiError(401, "Token has expired")
    except jwt.InvalidTokenError:
        raise ApiError(401, "Invalid token")
