from fastapi import APIRouter, Depends, HTTPException, Request, Response, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_
from api.database import User, get_db
from api.utils.api_response import ApiResponse
from api.utils.api_error import ApiError
from api.middlewares.verifyuser_middleware import verify_jwt
import logging
import json
import re

router = APIRouter()
logger = logging.getLogger(__name__)

TOKEN_OPTION = {"httponly": True, "secure": True, "samesite": "none"}

def validate_email(email):
    return re.match(r"[^@]+@[^@]+\.[^@]+", email)

@router.post("/create")
async def create_user(request: Request, response: Response, db: Session = Depends(get_db)):
    body = await request.json()
    fullName = body.get("fullName")
    email = body.get("email")
    password = body.get("password")
    username = body.get("username")

    if not all([fullName, email, password, username]):
        raise ApiError(400, "All fields (fullName, email, password, username) are required")

    if not validate_email(email):
        raise ApiError(400, "Invalid email")

    if len(password) < 6:
        raise ApiError(400, "password must be at least 6 characters long")

    existing_user = db.query(User).filter(or_(User.email == email, User.username == username)).first()
    if existing_user:
        if existing_user.email == email:
            raise ApiError(400, "email already taken")
        raise ApiError(400, "username already taken")

    user = User(fullName=fullName, email=email, username=username)
    user.set_password(password)
    
    access_token = user.generate_access_token()
    refresh_token = user.generate_refresh_token()
    user.refreshToken = refresh_token
    
    db.add(user)
    db.commit()
    db.refresh(user)

    response.set_cookie(key="accessToken", value=access_token, **TOKEN_OPTION)
    response.set_cookie(key="refreshToken", value=refresh_token, **TOKEN_OPTION)

    # Prepare response data (exclude password and refresh token)
    user_data = {
        "id": user.id,
        "fullName": user.fullName,
        "email": user.email,
        "username": user.username,
        "avatar": user.avatar
    }

    return ApiResponse(200, user_data, "User created successfully")

@router.post("/login")
async def login(request: Request, response: Response, db: Session = Depends(get_db)):
    body = await request.json()
    email_or_username = body.get("email")
    password = body.get("password")

    if not email_or_username or not password:
        raise ApiError(400, "Email/username and password are required")

    user = db.query(User).filter(or_(User.email == email_or_username, User.username == email_or_username)).first()
    if not user or not user.check_password(password):
        raise ApiError(401, "Invalid credentials")

    access_token = user.generate_access_token()
    refresh_token = user.generate_refresh_token()
    user.refreshToken = refresh_token
    db.commit()

    response.set_cookie(key="accessToken", value=access_token, **TOKEN_OPTION)
    response.set_cookie(key="refreshToken", value=refresh_token, **TOKEN_OPTION)

    user_data = {
        "id": user.id,
        "fullName": user.fullName,
        "email": user.email,
        "username": user.username,
        "avatar": user.avatar
    }

    return ApiResponse(200, user_data, "User logged in successfully")

@router.get("/logout")
async def logout(request: Request, response: Response, db: Session = Depends(get_db), user=Depends(verify_jwt)):
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise ApiError(401, "Unauthorized")

    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user:
        db_user.refreshToken = None
        db.commit()

    response.delete_cookie("accessToken")
    response.delete_cookie("refreshToken")
    
    return ApiResponse(200, None, "User logged out successfully")

@router.get("/getUser")
async def get_user(request: Request, db: Session = Depends(get_db), user=Depends(verify_jwt)):
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise ApiError(401, "Unauthorized")

    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise ApiError(404, "User not found")

    user_data = {
        "id": db_user.id,
        "fullName": db_user.fullName,
        "email": db_user.email,
        "username": db_user.username,
        "avatar": db_user.avatar,
        "aboutUser": db_user.aboutUser,
        "temp_data": db_user.temp_data
    }

    return ApiResponse(200, user_data, "User fetched successfully")

@router.post("/updateUserJson")
async def update_user_data(request: Request, db: Session = Depends(get_db), user=Depends(verify_jwt)):
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise ApiError(401, "Unauthorized")

    body = await request.json()
    temp_data = body.get("temp_data")
    
    if temp_data is None:
        raise ApiError(400, "temp_data is required")

    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise ApiError(404, "User not found")

    if isinstance(temp_data, str):
        try:
            temp_data = json.loads(temp_data)
        except:
            pass
            
    db_user.temp_data = temp_data
    db.commit()
    db.refresh(db_user)

    return ApiResponse(200, {"id": db_user.id, "temp_data": db_user.temp_data})

@router.get("/getUserById/{id}")
async def get_user_by_id(id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == id).first()
    if not db_user:
        raise ApiError(404, "User not found")

    user_data = {
        "id": db_user.id,
        "fullName": db_user.fullName,
        "email": db_user.email,
        "username": db_user.username,
        "avatar": db_user.avatar
    }

    return ApiResponse(200, user_data, "User fetched successfully")












# ======================== Agentic USER ================================

@router.post("/generate_schema")
async def generate_schema(
    details: UserDetailsModel = Body(...)
):
    logging.info("Entering generate_schema route (async)")
    try:
        pipeline = ResumeSchemaGenerationPipeline()
        schema = await pipeline.initiate(userDetails=details)
        return schema
    except Exception as e:
        raise MyException(e, sys)

@router.post("/aboutUserByResume")
async def aboutUserByResume(file: UploadFile):
    logging.info("Entering aboutUserByResume route (async)")
    try:
        os.makedirs("api/public",exist_ok=True)
        id=uuid.uuid4()
        file_path=f"api/public/{id}.pdf"
        with open(file_path,"wb") as f:
            f.write(file.file.read())

        pipeline = ResumeSummaryPipeline()
        res = await pipeline.initiate(file_path=file_path)
        return res
    except Exception as e:
        raise MyException(e, sys)
    finally:
        if "file_path" in locals() and os.path.exists(file_path):
            os.remove(file_path)
