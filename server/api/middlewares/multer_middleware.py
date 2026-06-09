import os
import shutil
from fastapi import UploadFile

from src.constants import PUBLIC_TEMP_DIR

os.makedirs(PUBLIC_TEMP_DIR, exist_ok=True)

async def multer_middleware(upload_file: UploadFile) -> str:
    file_path = os.path.join(PUBLIC_TEMP_DIR, upload_file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    return file_path
