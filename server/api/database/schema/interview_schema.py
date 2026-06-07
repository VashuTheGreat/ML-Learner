from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..db import Base

class InterviewStatus(enum.Enum):
    live = "live"
    pending = "pending"
    done = "done"

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    companyName = Column(String, nullable=False)
    topic = Column(String, nullable=False)
    job_Role = Column(String, nullable=False)
    time = Column(DateTime, nullable=False)
    status = Column(Enum(InterviewStatus), default=InterviewStatus.pending)
    user_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="interviews")
    performance = relationship("Performance", back_populates="interview", uselist=False)
