from fastapi import UploadFile, Body
from src.controllers.user_controller import create_schema, uploadResume, userDetails as UserDetailsModel
from src.pipelines.SchemaGeneration_pipeline import SchemaPipeline
from src.pipelines.AboutUserByResume_pipeline import AboutUserPipeline
from src.constants import DEFAULT_USER_DETAILS
import json
import fastapi
router = fastapi.APIRouter()

@router.post("/generate_schema")
async def generate_schema(
    details: UserDetailsModel = Body(default=UserDetailsModel(userDetails=DEFAULT_USER_DETAILS))
):
    schemapipeline = SchemaPipeline(userDetails=details)
    schema = await schemapipeline.initiate()
    print("the schema generated is ",schema)
    return schema


@router.post("/aboutUserByResume")
async def aboutUserByResume(file: UploadFile):
    aboutUserpipeline = AboutUserPipeline(resume_file=file)
    res = await aboutUserpipeline.initiate()
    return res
