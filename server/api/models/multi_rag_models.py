from pydantic import BaseModel
from fastapi import File, UploadFile,File

class ChatRequest(BaseModel):
    message: str



class UploadState(BaseModel):
    uploaded_file:UploadFile=File(...)


class User(BaseModel):
    thread_id:str

