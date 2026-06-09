from pydantic import BaseModel
from typing import Optional, List, Any

class UpdateCodingSchema(BaseModel):
    recently_solved: Optional[List[int]] = None
    recently_visited: Optional[List[int]] = None
    all_questions_solved: Optional[List[int]] = None
    easy: Optional[int] = None
    medium: Optional[int] = None
    hard: Optional[int] = None
