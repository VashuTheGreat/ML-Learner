from sqlalchemy import Column, Integer, String, ForeignKey, ARRAY
from sqlalchemy.orm import relationship
from typing import List
from ..db import Base

class Coding(Base):
    __tablename__ = "coding"

    id = Column(Integer, primary_key=True, index=True)
    recently_solved: List[int] = Column(ARRAY(Integer), default=[])
    recently_visited: List[int] = Column(ARRAY(Integer), default=[])
    all_questions_solved: List[int] = Column(ARRAY(Integer), default=[])
    easy:int = Column(Integer, default=0)
    medium:int= Column(Integer, default=0)
    hard:int = Column(Integer, default=0)
    user_id = Column(Integer, ForeignKey("users.id"))


