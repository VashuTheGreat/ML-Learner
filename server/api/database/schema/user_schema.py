from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..db import Base
import bcrypt
import jwt
import os
from datetime import datetime, timedelta
from config.app_config import app_config

user_resumes = Table(
    "user_resumes",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("template_id", Integer, ForeignKey("templates.id"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    fullName = Column(String, nullable=False)
    password = Column(String, nullable=False)
    avatar = Column(String)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    refreshToken = Column(String)
    aboutUser = Column(String)
    temp_data = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def set_password(self, password):
        self.password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password.encode('utf-8'))

    def generate_access_token(self):
        payload = {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "fullName": self.fullName,
            "exp": datetime.utcnow() + timedelta(minutes=app_config.access_token_expire_minutes)
        }
        return jwt.encode(payload, app_config.secret_key, algorithm=app_config.algorithm)

    def generate_refresh_token(self):
        payload = {
            "id": self.id,
            "exp": datetime.utcnow() + timedelta(days=app_config.refresh_token_expire_days) # 10 days expiry
        }
        return jwt.encode(payload, app_config.secret_key, algorithm=app_config.algorithm)
