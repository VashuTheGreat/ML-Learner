from sqlalchemy import Column, Integer, String, JSON
from ..db import Base

class Template(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    template = Column(String, unique=True, nullable=False)
    temp_data = Column(JSON, nullable=False)
