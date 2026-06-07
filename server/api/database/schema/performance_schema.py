from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..db import Base

class Verdict(enum.Enum):
    hire = "hire"
    maybe = "maybe"
    reject = "reject"

class Performance(Base):
    __tablename__ = "performances"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    overallScore = Column(Float, nullable=False)
    verdict = Column(Enum(Verdict), nullable=False)
    summaryFeedback = Column(String, nullable=False)
    skills = Column(JSON)
    strengths = Column(JSON)
    weaknesses = Column(JSON)
    practiceRecommendations = Column(JSON)
    studyRecommendations = Column(JSON)
    lowPriorityOrAvoid = Column(JSON)
    confidenceLevel = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="performances")
    interview = relationship("Interview", back_populates="performance")
