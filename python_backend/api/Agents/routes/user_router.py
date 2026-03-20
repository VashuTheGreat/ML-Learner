import fastapi
from fastapi import UploadFile, Body
from src.Agents.pipelines.ResumeSchemaGeneration_pipeline import ResumeSchemaGenerationPipeline
from src.Agents.pipelines.ResumeSummary_pipeline import ResumeSummaryPipeline
from src.Agents.models.userSchema_model import userDetails as UserDetailsModel
import logging
import sys
from exception import MyException
import uuid
import os

router = fastapi.APIRouter()

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
