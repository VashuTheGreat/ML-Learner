from fastapi import Request, HTTPException, Depends
import jwt
import os
from sqlalchemy.orm import Session
from db import User, get_db
from config.app_config import app_config

from typing import Optional
async def verify_jwt(request: Request, db: Session = Depends(get_db)) -> Optional[bool]:
    token = request.cookies.get("accessToken") or request.headers.get("Authorization")
    if token and token.startswith("Bearer "):
        token = token.replace("Bearer ", "")

    if not token:
        print("[DEBUG] No token found in request cookies or headers")
        raise HTTPException(status_code=401, detail={"success": False, "message": "Unauthorized request", "data": None})

    try:
        decoded_token = jwt.decode(token, app_config.secret_key, algorithms=[app_config.algorithm])
        user_id = decoded_token.get("id")
        
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            print(f"[DEBUG] Token is valid, but User not found in DB for user_id: {user_id}")
            raise HTTPException(status_code=401, detail={"success": False, "message": "Invalid Access Token", "data": None})

        request.state.user = user
        return True

    except jwt.ExpiredSignatureError as e:
        print(f"[DEBUG] ExpiredSignatureError: {e}")
        raise HTTPException(status_code=401, detail={"success": False, "message": "Token has expired", "data": None})
    except jwt.InvalidTokenError as e:
        print(f"[DEBUG] InvalidTokenError: {e}")
        raise HTTPException(status_code=401, detail={"success": False, "message": "Invalid token", "data": None})
