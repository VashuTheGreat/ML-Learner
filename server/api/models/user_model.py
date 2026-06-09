from pydantic import BaseModel, EmailStr
from typing import Optional


class CreateUser(BaseModel):
    fullName: str
    email: EmailStr
    password: str
    username: str


class UpdateUser(BaseModel):
    fullName: Optional[str] = None
    username: Optional[str] = None
    


class LoginUser(BaseModel):
    email: str
    password: str