from pydantic import BaseModel
from typing import Optional, Any

class QuestionCreate(BaseModel):
    id: Optional[int] = None
    title: str
    difficulty: str
    category: str
    problem_description: Optional[str] = None
    starter_code: Optional[str] = None
    example_input: Optional[str] = None
    example_output: Optional[str] = None
    example_reasoning: Optional[str] = None
    learn_content: Optional[str] = None
    solution_code: Optional[str] = None
    test_cases: Optional[Any] = None
    function_name: Optional[str] = None
