from pydantic import BaseModel, Field
from typing import Optional, List

class UpdateCodingSchema(BaseModel):
    """
    Schema for updating a user's coding statistics and history.
    Used by the frontend to update solved question counters and history arrays.
    """
    recently_solved: Optional[List[int]] = Field(
        None, 
        description="List of unique question IDs that were recently solved by the user, ordered by recency.",
        example=[101, 102]
    )
    recently_visited: Optional[List[int]] = Field(
        None, 
        description="List of unique question IDs recently visited or viewed by the user.",
        example=[103, 104]
    )
    all_questions_solved: Optional[List[int]] = Field(
        None, 
        description="Historical list of all unique question IDs successfully solved by the user.",
        example=[101, 102, 105]
    )
    easy: Optional[int] = Field(
        None, 
        description="Total number of 'easy' difficulty coding questions solved.",
        example=5
    )
    medium: Optional[int] = Field(
        None, 
        description="Total number of 'medium' difficulty coding questions solved.",
        example=2
    )
    hard: Optional[int] = Field(
        None, 
        description="Total number of 'hard' difficulty coding questions solved.",
        example=0
    )

    class Config:
        json_schema_extra = {
            "example": {
                "recently_solved": [101, 102],
                "recently_visited": [101, 102, 103],
                "all_questions_solved": [101, 102],
                "easy": 5,
                "medium": 2,
                "hard": 0
            }
        }


class RunCode(BaseModel):
    """
    Schema representing user code execution requests.
    Sent when the user compiles or submits code for a specific problem.
    """
    language: str = Field(
        ..., 
        description="Programming language used for code execution. Currently supports 'python'.",
        example="python"
    )
    code: str = Field(
        ..., 
        description="Raw code string written by the user to be executed against test cases.",
        example="def add(a, b):\n    return a + b"
    )
    question_id: int = Field(
        ..., 
        description="The database identifier of the problem being solved.",
        example=1
    )

    class Config:
        json_schema_extra = {
            "example": {
                "language": "python",
                "code": "def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        if target - num in seen:\n            return [seen[target - num], i]\n        seen[num] = i\n    return []",
                "question_id": 1
            }
        }