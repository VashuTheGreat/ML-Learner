import enum
from sqlalchemy import Column, Integer, String, JSON, ForeignKey, Enum
from ..db import Base


class TemplateType(str, enum.Enum):
    RESUME = "resume"
    CODING = "coding"


class Template(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    t_type = Column(Enum(TemplateType, native_enum=False), nullable=False)
    content = Column(JSON, nullable=False)
