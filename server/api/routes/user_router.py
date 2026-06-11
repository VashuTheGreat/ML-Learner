
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_
from db import User, get_db
from fastapi.responses import JSONResponse
from api.middlewares.verifyuser_middleware import verify_jwt
import logging
from api.models.user_model import CreateUser, UpdateUser, LoginUser
from src.utils.cloudinary import upload_avatar_to_cloudinary, delete_avatar_from_cloudinary


router = APIRouter(tags=["Authentication & Users"])

from config.app_config import app_config

is_secure = app_config.app_env != "development"
TOKEN_OPTION = {
    "httponly": True,
    "secure": is_secure,
    "samesite": "lax" if app_config.app_env == "development" else "none"
}


# ====================== Registering a new User ==========================================
@router.post(
    "/create",
    summary="Register a new user",
    description="Creates a new user account, generates access and refresh tokens, sets them in secure HTTP-only cookies, and returns the basic user profile details.",
    responses={
        200: {
            "description": "User created successfully. Auth cookies are set.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "User created successfully",
                        "data": {
                            "id": 1,
                            "fullName": "John Doe",
                            "email": "john@example.com",
                            "username": "johndoe",
                            "avatar": None,
                            "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        }
                    }
                }
            }
        },
        400: {
            "description": "Email or Username already taken.",
            "content": {"application/json": {"example": "email already taken"}}
        }
    }
)
async def create_user(user: CreateUser, db: Session = Depends(get_db)):
    """
    Register a new user account in the system.
    """
    logging.info(f"Attempting to register new user: email={user.email}, username={user.username}")
    existing_user = db.query(User).filter(or_(User.email == user.email, User.username == user.username)).first()
    if existing_user:
        if existing_user.email == user.email:
            logging.warning(f"Registration failed: email {user.email} is already taken")
            raise HTTPException(status_code=400, detail="email already taken")
        logging.warning(f"Registration failed: username {user.username} is already taken")
        raise HTTPException(status_code=400, detail="username already taken")

    db_user = User(fullName=user.fullName, email=user.email, username=user.username)
    db_user.set_password(user.password)
    
    access_token = db_user.generate_access_token()
    refresh_token = db_user.generate_refresh_token()
    db_user.refreshToken = refresh_token
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    logging.info(f"User registered successfully: id={db_user.id}, username={db_user.username}")

    response_data = {
        "success": True,
        "message": "User created successfully",
        "data": {
            "id": db_user.id,
            "fullName": db_user.fullName,
            "email": db_user.email,
            "username": db_user.username,
            "avatar": db_user.avatar,
            "refreshToken":refresh_token
        },
    }
    response = JSONResponse(status_code=200, content=response_data)
    response.set_cookie(key="accessToken", value=access_token, **TOKEN_OPTION)
    response.set_cookie(key="refreshToken", value=refresh_token, **TOKEN_OPTION)

    return response
    


# ====================== Logging in an existing User ==========================================
@router.post(
    "/login",
    summary="Login user session",
    description="Authenticates credentials, generates JWT access and refresh tokens, sets them in secure HTTP-only cookies, and returns the user profile.",
    responses={
        200: {
            "description": "User logged in successfully. Auth cookies are set.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "User logged in successfully",
                        "data": {
                            "id": 1,
                            "fullName": "John Doe",
                            "email": "john@example.com",
                            "username": "johndoe",
                            "avatar": None,
                            "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        }
                    }
                }
            }
        },
        401: {
            "description": "Invalid credentials provided.",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "message": "Invalid credentials",
                        "data": None
                    }
                }
            }
        }
    }
)
async def login(user: LoginUser, db: Session = Depends(get_db)):
    """
    Log in an existing user and set session cookies.
    """
    logging.info(f"Attempting login for user: email={user.email}")
    db_user = db.query(User).filter(or_(User.email == user.email)).first()

    if not db_user or not db_user.check_password(user.password):
        logging.warning(f"Login failed for email={user.email}: Invalid credentials")
        raise HTTPException(status_code=401, detail={"success": False, "message": "Invalid credentials", "data": None})

    access_token = db_user.generate_access_token()
    refresh_token = db_user.generate_refresh_token()
    db_user.refreshToken = refresh_token
    db.commit()

    logging.info(f"User logged in successfully: id={db_user.id}, username={db_user.username}")

    user_data = {
        "id": db_user.id,
        "fullName": db_user.fullName,
        "email": db_user.email,
        "username": db_user.username,
        "avatar": db_user.avatar,
        "refreshToken": refresh_token
    }

    response = JSONResponse(status_code=200, content={"success": True, "message": "User logged in successfully", "data": user_data})
    response.set_cookie(key="accessToken", value=access_token, **TOKEN_OPTION)
    response.set_cookie(key="refreshToken", value=refresh_token, **TOKEN_OPTION)

    return response



# ================================ Logout User =================================
@router.get(
    "/logout",
    dependencies=[Depends(verify_jwt)],
    summary="Logout user session",
    description="Invalidates user session, clears HTTP cookies, and removes refresh token from the database.",
    responses={
        200: {
            "description": "User logged out successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "User logged out successfully",
                        "data": None
                    }
                }
            }
        },
        401: {
            "description": "Unauthorized session.",
            "content": {"application/json": {"example": "Unauthorized"}}
        }
    }
)
async def logout(request: Request, db: Session = Depends(get_db)):
    """
    Log out user and clear cookies.
    """
    user = request.state.user
    if not user:
        logging.warning("Logout attempted without valid session/user state")
        raise HTTPException(401, "Unauthorized")

    logging.info(f"Logging out user: id={user.id}, username={user.username}")
    db_user = db.query(User).filter(User.id == user.id).first()

    if db_user:
        db_user.refreshToken = None
        db.commit()

    logging.info(f"User logged out successfully from DB: id={user.id}")

    response = JSONResponse(status_code=200, content={"success": True, "message": "User logged out successfully", "data": None})
    response.delete_cookie("accessToken")
    response.delete_cookie("refreshToken")
    
    return response




# ========================= return user data ====================================
@router.get(
    "/itself",
    dependencies=[Depends(verify_jwt)],
    summary="Get current user details",
    description="Returns detailed profile information for the currently authenticated user.",
    responses={
        200: {
            "description": "User details successfully retrieved.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "User fetched successfully",
                        "data": {
                            "id": 1,
                            "fullName": "John Doe",
                            "email": "john@example.com",
                            "username": "johndoe",
                            "avatar": "https://res.cloudinary.com/...",
                            "aboutUser": "Developer",
                            "temp_data": None
                        }
                    }
                }
            }
        }
    }
)
async def get_itself(request: Request):
    """
    Fetch the currently logged-in user details.
    """
    user = request.state.user
    logging.info(f"Fetching self profile data for user: id={user.id}")
    user_data = {
        "id": user.id,
        "fullName": user.fullName,
        "email": user.email,
        "username": user.username,
        "avatar": user.avatar,
        "aboutUser": user.aboutUser,
        "temp_data": user.temp_data
    }

    return JSONResponse(status_code=200, content={"success": True, "message": "User fetched successfully", "data": user_data})





@router.put(
    "/update", 
    dependencies=[Depends(verify_jwt)],
    summary="Update user details",
    description="Updates the profile username and/or full name of the authenticated user. Validates username uniqueness.",
    responses={
        200: {
            "description": "Profile updated successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "User updated successfully",
                        "data": {
                            "id": 1,
                            "fullName": "Jane Doe",
                            "email": "john@example.com",
                            "username": "janedoe",
                            "avatar": None,
                            "aboutUser": "Software Engineer"
                        }
                    }
                }
            }
        },
        400: {
            "description": "Target username is already occupied.",
            "content": {"application/json": {"example": "username already exists"}}
        }
    }
)
async def update_user_data(request: Request, updated_user: UpdateUser, db: Session = Depends(get_db)):
    """
    Update profile details for the authenticated user.
    """
    user = getattr(request.state, "user", None)
    if not user:
        logging.warning("Update attempted without user state")
        raise HTTPException(status_code=401, detail={"success": False, "message": "Unauthorized", "data": None})

    logging.info(f"Attempting to update profile for user: id={user.id}")
    db_user = db.query(User).filter(User.id == user.id).first()
    if not db_user:
        logging.error(f"User model not found in database for id: {user.id}")
        raise HTTPException(status_code=404, detail={"success": False, "message": "User not found", "data": None})
    
    if updated_user.fullName:
        logging.debug(f"Updating fullName from '{db_user.fullName}' to '{updated_user.fullName}' for user id={user.id}")
        db_user.fullName = updated_user.fullName
        
    if updated_user.username:
        logging.debug(f"Checking uniqueness for new username: '{updated_user.username}'")
        existing_user = db.query(User).filter(User.username == updated_user.username).first()
        if existing_user:
            logging.warning(f"Update failed: username '{updated_user.username}' is already taken")
            raise HTTPException(status_code=400, detail={"success": False, "message": "username already exists", "data": None})
        logging.debug(f"Updating username from '{db_user.username}' to '{updated_user.username}' for user id={user.id}")
        db_user.username = updated_user.username

    db.commit()
    db.refresh(db_user)     
    logging.info(f"User updated successfully: id={db_user.id}")
    
    user_data = {
        "id": db_user.id,
        "fullName": db_user.fullName,
        "email": db_user.email,
        "username": db_user.username,
        "avatar": db_user.avatar,
        "aboutUser": db_user.aboutUser,
    }
    return JSONResponse(status_code=200, content={"success": True, "message": "User updated successfully", "data": user_data})



# ======================= get User by Id ==========================
@router.get(
    "/{id}",
    summary="Get user profile by ID",
    description="Public endpoint to fetch public user details (name, username, avatar) by user database ID.",
    responses={
        200: {
            "description": "User profile retrieved successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "User fetched successfully",
                        "data": {
                            "id": 2,
                            "fullName": "Bob Builder",
                            "email": "bob@example.com",
                            "username": "bob_builder",
                            "avatar": "https://res.cloudinary.com/...",
                            "aboutUser": "Constructor"
                        }
                    }
                }
            }
        },
        404: {
            "description": "Requested user ID not found.",
            "content": {"application/json": {"example": "User not found"}}
        }
    }
)
async def get_user_by_id(id: int, db: Session = Depends(get_db)):
    """
    Fetch a user's details by their ID.
    """
    logging.info(f"Fetching user profile by id: {id}")
    db_user = db.query(User).filter(User.id == id).first()
    if not db_user:
        logging.warning(f"User profile fetch failed: id={id} not found")
        raise HTTPException(status_code=404, detail={"success": False, "message": "User not found", "data": None})

    user_data = {
        "id": db_user.id,
        "fullName": db_user.fullName,
        "email": db_user.email,
        "username": db_user.username,
        "avatar": db_user.avatar,
        "aboutUser": db_user.aboutUser,
    }

    return JSONResponse(status_code=200, content={"success": True, "message": "User fetched successfully", "data": user_data})



# ======================= Upload User Avatar ==========================
@router.put(
    "/avatar", 
    dependencies=[Depends(verify_jwt)],
    summary="Upload user avatar image",
    description="Accepts a multipart file upload, uploads the avatar image to Cloudinary, deletes the old avatar from Cloudinary (if set), and updates the user profile record.",
    responses={
        200: {
            "description": "Avatar uploaded and saved successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Avatar uploaded successfully",
                        "data": {
                            "id": 1,
                            "fullName": "Jane Doe",
                            "email": "john@example.com",
                            "username": "janedoe",
                            "avatar": "https://res.cloudinary.com/...",
                            "aboutUser": "Software Engineer"
                        }
                    }
                }
            }
        },
        500: {
            "description": "Cloudinary upload failed.",
            "content": {"application/json": {"example": "Failed to upload avatar"}}
        }
    }
)
async def upload_avatar(request: Request, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Upload an avatar image to Cloudinary and link it to the user.
    """
    user = getattr(request.state, "user", None)
    if not user:
        logging.warning("Avatar upload attempted without user state")
        raise HTTPException(status_code=401, detail={"success": False, "message": "Unauthorized", "data": None})
    
    # If user already has an avatar, delete it from Cloudinary first
    if user.avatar:
        logging.info(f"User already has an avatar, attempting to delete old avatar: {user.avatar}")
        await delete_avatar_from_cloudinary(user.avatar)
        
    try:
        logging.info(f"Uploading new avatar for user: id={user.id}")
        # Upload new avatar
        avatar_url = await upload_avatar_to_cloudinary(file)
        
        # Update user record 
        user.avatar = avatar_url
        db.commit()
        db.refresh(user)
        
        user_data = {
            "id": user.id,
            "fullName": user.fullName,
            "email": user.email,
            "username": user.username,
            "avatar": user.avatar,
            "aboutUser": user.aboutUser,
        }
        return JSONResponse(status_code=200, content={"success": True, "message": "Avatar uploaded successfully", "data": user_data})
    except Exception as e:
        logging.error(f"Failed to upload avatar: {e}")
        raise HTTPException(status_code=500, detail={"success": False, "message": f"Failed to upload avatar: {str(e)}", "data": None})


# ======================= Delete User Avatar ==========================
@router.delete(
    "/avatar", 
    dependencies=[Depends(verify_jwt)],
    summary="Delete user avatar image",
    description="Deletes the user's avatar image from Cloudinary storage and sets the user's avatar URL column to null in the database.",
    responses={
        200: {
            "description": "Avatar removed successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Avatar deleted successfully",
                        "data": {
                            "id": 1,
                            "fullName": "Jane Doe",
                            "email": "john@example.com",
                            "username": "janedoe",
                            "avatar": None,
                            "aboutUser": "Software Engineer"
                        }
                    }
                }
            }
        },
        400: {
            "description": "User has no avatar configured.",
            "content": {"application/json": {"example": "No avatar to delete"}}
        }
    }
)
async def delete_avatar(request: Request, db: Session = Depends(get_db)):
    """
    Remove user avatar image from Cloudinary and reset column in database.
    """
    user = getattr(request.state, "user", None)
    if not user:
        logging.warning("Avatar deletion attempted without user state")
        raise HTTPException(status_code=401, detail={"success": False, "message": "Unauthorized", "data": None})
    
    if not user.avatar:
        logging.warning(f"Avatar deletion failed: user id={user.id} has no avatar set")
        raise HTTPException(status_code=400, detail={"success": False, "message": "No avatar to delete", "data": None})
        
    try:
        logging.info(f"Deleting avatar for user: id={user.id}, url={user.avatar}")
        # Delete avatar from Cloudinary
        await delete_avatar_from_cloudinary(user.avatar)
        
        # Set database field to None
        user.avatar = None
        db.commit()
        db.refresh(user)
        
        user_data = {
            "id": user.id,
            "fullName": user.fullName,
            "email": user.email,
            "username": user.username,
            "avatar": user.avatar,
            "aboutUser": user.aboutUser,
        }
        return JSONResponse(status_code=200, content={"success": True, "message": "Avatar deleted successfully", "data": user_data})
    except Exception as e:
        logging.error(f"Failed to delete avatar: {e}")
        raise HTTPException(status_code=500, detail={"success": False, "message": f"Failed to delete avatar: {str(e)}", "data": None})


