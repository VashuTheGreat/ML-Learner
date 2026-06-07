import os
import shutil
from fastapi import UploadFile

UPLOAD_PATH = "./public/temp"

if not os.path.exists(UPLOAD_PATH):
    os.makedirs(UPLOAD_PATH, exist_ok=True)

async def save_upload_file(upload_file: UploadFile) -> str:
    file_path = os.path.join(UPLOAD_PATH, upload_file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    return file_path
