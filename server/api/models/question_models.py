from pydantic import BaseModel, Field
from typing import Optional, Any

class QuestionCreate(BaseModel):
    """
    Schema for creating or adding a new coding question to the database.
    """
    id: Optional[int] = Field(
        None,
        description="Optional custom identifier for the question. If not provided, it will be auto-incremented.",
        example=42
    )
    title: str = Field(
        ...,
        description="The display name or title of the coding problem.",
        example="Two Sum"
    )
    difficulty: str = Field(
        ...,
        description="Difficulty tier. Must be 'easy', 'medium', or 'hard'.",
        example="easy"
    )
    category: str = Field(
        ...,
        description="The category of the question, e.g. 'Arrays', 'Recursion', 'Dynamic Programming'.",
        example="Arrays"
    )
    problem_description: Optional[str] = Field(
        None,
        description="The detailed markdown-formatted problem description.",
        example="Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`."
    )
    starter_code: Optional[str] = Field(
        None,
        description="The template code provided to the user in the IDE when they load the question.",
        example="def twoSum(nums: list[int], target: int) -> list[int]:\n    pass"
    )
    example_input: Optional[str] = Field(
        None,
        description="Sample input scenario details.",
        example="nums = [2,7,11,15], target = 9"
    )
    example_output: Optional[str] = Field(
        None,
        description="Expected output for the sample input.",
        example="[0,1]"
    )
    example_reasoning: Optional[str] = Field(
        None,
        description="Step-by-step logic explaining the sample output.",
        example="Because nums[0] + nums[1] == 2 + 7 == 9, we return [0, 1]."
    )
    learn_content: Optional[str] = Field(
        None,
        description="Additional training / learning material or hints about the question.",
        example="Learn about hashing techniques to solve this in O(N) time complexity."
    )
    solution_code: Optional[str] = Field(
        None,
        description="The reference solution code in Python to verify user submissions.",
        example="def twoSum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        if target - num in seen:\n            return [seen[target - num], i]\n        seen[num] = i\n    return []"
    )
    test_cases: Optional[Any] = Field(
        None,
        description="A list of objects containing inputs and outputs for sandbox test suites. Can be a JSON array or dict.",
        example=[{"input": [[2, 7, 11, 15], 9], "output": [0, 1]}]
    )
    function_name: Optional[str] = Field(
        None,
        description="The entrypoint function name used in the evaluation script to test user code.",
        example="twoSum"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "title": "Two Sum",
                "difficulty": "easy",
                "category": "Arrays",
                "problem_description": "Given an array of integers nums and an integer target...",
                "starter_code": "def twoSum(nums, target):\n    pass",
                "example_input": "nums = [2,7,11,15], target = 9",
                "example_output": "[0,1]",
                "example_reasoning": "Because 2 + 7 == 9, we return [0, 1].",
                "learn_content": "Use a hash map to reduce time complexity from O(n^2) to O(n).",
                "solution_code": "def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in seen:\n            return [seen[diff], i]\n        seen[n] = i",
                "test_cases": [{"input": [[2, 7, 11, 15], 9], "output": [0, 1]}],
                "function_name": "twoSum"
            }
        }

