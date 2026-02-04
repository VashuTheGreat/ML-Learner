import fastapi
from src.controllers.user_controller import create_schema,userDetails,uploadResume,UploadFile
router=fastapi.APIRouter()


@router.post("/generate_schema")
async def generate_schema(userDetails:userDetails):
    return await create_schema(userDetails=userDetails)


@router.post("/aboutUserByResume")
async def aboutUserByResume(file:UploadFile):
    return await uploadResume(file=file)
