from sqlalchemy import Column, Integer, String, JSON, ForeignKey
from sqlalchemy.orm import relationship
from ..db import Base

class Coding(Base):
    __tablename__ = "coding"

    id = Column(Integer, primary_key=True, index=True)
    recently_solved = Column(JSON, default=[])
    recently_visited = Column(JSON, default=[])
    all_questions_solved = Column(JSON, default=[])
    easy = Column(Integer, default=0)
    medium = Column(Integer, default=0)
    hard = Column(Integer, default=0)
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="coding_profile")
