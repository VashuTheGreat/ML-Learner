
from models.userSchema_model import userDetails
from src.components.resume import create_resume_schema
from src.components.get_summary_using_resume_pdf import get_summary
import os
from fastapi import UploadFile
async def create_schema(userDetails:userDetails):
    print(userDetails)
    schema=await create_resume_schema(userDetails=userDetails.userDetails)
    schema=schema['ai_generated_schema']
    return {"userDetails":schema}




async def uploadResume(file:UploadFile):
    file_path=f"./docs/{file.filename}"
    with open(file_path,"wb") as f:
        content = await file.read()
        f.write(content) 
    res=await get_summary(file_path=file_path)    
    os.remove(file_path)
    return {"data":res}