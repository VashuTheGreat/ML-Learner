import os
import sys
import logging
from src.models.userSchema_model import userDetails
from src.components.resume import create_resume_schema
from src.components.get_summary_using_resume_pdf import get_summary
from fastapi import UploadFile
from src.exception import MyException

async def create_schema(userDetails: userDetails):
    logging.info("Entering create_schema controller")
    try:
        logging.debug(f"User details: {userDetails}")
        schema = await create_resume_schema(userDetails=userDetails.userDetails)
        schema = schema['ai_generated_schema']
        logging.info("Schema created successfully")
        return schema
    except Exception as e:
        raise MyException(e, sys)

async def uploadResume(file: UploadFile):
    logging.info(f"Entering uploadResume controller for file: {file.filename}")
    try:
        file_path = f"./docs/{file.filename}"
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        logging.info(f"File saved to {file_path}, generating summary")
        res = await get_summary(file_path=file_path)    
        
        os.remove(file_path)
        logging.info("Resume processed and file removed")
        return res
    except Exception as e:
        raise MyException(e, sys)