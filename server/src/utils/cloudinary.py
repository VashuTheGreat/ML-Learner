import asyncio
import os
import shutil
import uuid
from fastapi import UploadFile
from config.app_config import app_config
from src.constants import PUBLIC_TEMP_DIR
import cloudinary
import cloudinary.uploader

# Configure Cloudinary
cloudinary.config(
    cloud_name=app_config.cloudinary_cloud_name,
    api_key=app_config.cloudinary_api_key,
    api_secret=app_config.cloudinary_api_secret,
    secure=True
)


def extract_public_id(url: str) -> str | None:
    """
    Extracts the public_id from a Cloudinary URL.
    E.g., https://res.cloudinary.com/cloud_name/image/upload/v1234567/avatars/abc123xyz.png -> avatars/abc123xyz
    """
    if not url or "res.cloudinary.com" not in url:
        return None
    try:
        parts = url.split("/upload/")
        if len(parts) < 2:
            return None
        # Remove version prefix (e.g. v1619000000/) if present
        subparts = parts[1].split("/", 1)
        if len(subparts) < 2:
            return None
        
        path_with_ext = subparts[1]
        public_id = os.path.splitext(path_with_ext)[0]
        return public_id
    except Exception:
        return None


async def upload_avatar_to_cloudinary(file: UploadFile) -> str:
    """
    Saves an uploaded file locally to the public temp directory,
    uploads it to Cloudinary, deletes the local file, and returns the Cloudinary URL.
    """
    # Ensure public/temp directory exists
    os.makedirs(PUBLIC_TEMP_DIR, exist_ok=True)
    
    # Create a unique file name to avoid collisions
    file_extension = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    temp_file_path = os.path.join(PUBLIC_TEMP_DIR, unique_filename)
    
    try:
        # Save file locally in public/temp
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Upload to Cloudinary using threadpool to keep it async
        upload_result = await asyncio.to_thread(
            cloudinary.uploader.upload,
            temp_file_path,
            folder="avatars"
        )
        
        secure_url = upload_result.get("secure_url")
        if not secure_url:
            raise Exception("Cloudinary upload failed: secure_url was not returned.")
            
        return secure_url
        
    finally:
        # Delete local file after upload
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)


async def delete_avatar_from_cloudinary(url: str) -> bool:
    """
    Deletes an asset from Cloudinary using its secure URL.
    """
    public_id = extract_public_id(url)
    if not public_id:
        print(f"[DEBUG] Could not extract public_id from url: {url}")
        return False
    try:
        result = await asyncio.to_thread(
            cloudinary.uploader.destroy,
            public_id,
            invalidate=True
        )
        print(f"[DEBUG] Cloudinary destroy result for {public_id}: {result}")
        return result.get("result") == "ok"
    except Exception as e:
        print(f"[ERROR] Failed to delete image from Cloudinary: {e}")
        return False
