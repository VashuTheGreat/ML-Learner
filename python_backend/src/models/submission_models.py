from pydantic import BaseModel,Field
class Submission(BaseModel):
    code: str = "ZGVmIGFkZChhLCBiKToKICAgIHJldHVybiBhICsgYgo="
    function_name: str = "add"
    test_cases: list = Field(default= [
        {"test": (2, 3), "expected_output": 6},
        {"test": (0, 0), "expected_output": 0},
        {"test": (-1, 5), "expected_output": 4},
        {"test": (100, 200), "expected_output": 300},
        {"test": (-10, -20), "expected_output": -30},
    ])