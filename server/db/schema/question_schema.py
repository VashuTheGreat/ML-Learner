from sqlalchemy import Column, Integer, String, Text, JSON
from ..connection import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    category = Column(String, nullable=False)
    problem_description = Column(Text)
    starter_code = Column(Text)
    example_input = Column(Text)
    example_output = Column(Text)
    example_reasoning = Column(Text)
    learn_content = Column(Text)
    solution_code = Column(Text)
    test_cases = Column(JSON)
    function_name = Column(String)
