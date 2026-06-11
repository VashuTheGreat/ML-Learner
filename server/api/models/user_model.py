from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class CreateUser(BaseModel):
    """
    Schema for registering a new user.
    """
    fullName: str = Field(
        ...,
        description="The user's full name.",
        example="Vashu The Great"
    )
    email: EmailStr = Field(
        ...,
        description="A unique email address used for login and notifications.",
        example="vashu@example.com"
    )
    password: str = Field(
        ...,
        description="The secret password. Must be strong.",
        example="supersecret123"
    )
    username: str = Field(
        ...,
        description="A unique alphanumeric username for the profile URL.",
        example="vashu_dev"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "fullName": "Jane Doe",
                "email": "jane@example.com",
                "password": "mypassword123",
                "username": "janedoe"
            }
        }


class UpdateUser(BaseModel):
    """
    Schema for updating basic user profile information.
    """
    fullName: Optional[str] = Field(
        None,
        description="New full name override.",
        example="Jane Smith"
    )
    username: Optional[str] = Field(
        None,
        description="New username override. Will fail if the new username is already taken.",
        example="janesmith"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "fullName": "Jane Smith",
                "username": "janesmith"
            }
        }


class LoginUser(BaseModel):
    """
    Schema for user authentication/login.
    """
    email: str = Field(
        ...,
        description="The email address associated with the user account.",
        example="vashu@example.com"
    )
    password: str = Field(
        ...,
        description="The plaintext password to verify.",
        example="supersecret123"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "email": "vashu@example.com",
                "password": "supersecret123"
            }
        }