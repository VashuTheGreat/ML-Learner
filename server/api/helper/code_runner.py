import subprocess
import json
from fastapi import HTTPException
from sqlalchemy.orm import Session
from db import Question
from api.models.coding_models import RunCode

# =========================== Helper function to run user code =================
async def code_runner(body: RunCode, db: Session):
    question = (
        db.query(Question)
        .filter(Question.id == body.question_id)
        .first()
    )

    if not question:
        raise HTTPException(
            status_code=404,
            detail="Question not found"
        )

    test_cases = question.test_cases
    function_name = question.function_name

    runner_code = body.code + "\n\n"

    runner_code += """
import json
import inspect

# Helper to recursively convert PyTorch Tensors, NumPy arrays, etc. to clean Python structures
def to_list_recursive(val):
    if hasattr(val, "tolist"):
        return to_list_recursive(val.tolist())
    if isinstance(val, tuple):
        return [to_list_recursive(x) for x in val]
    if isinstance(val, list):
        return [to_list_recursive(x) for x in val]
    if isinstance(val, dict):
        return {k: to_list_recursive(v) for k, v in val.items()}
    if hasattr(val, "item") and callable(getattr(val, "item")):
        try:
            return val.item()
        except:
            pass
    return val

# Helper to automatically cast input list arguments based on function type hints
def prepare_args(func, raw_args):
    try:
        sig = inspect.signature(func)
        params = list(sig.parameters.values())
    except Exception:
        return raw_args

    prepared = []
    for i, arg in enumerate(raw_args):
        if i < len(params):
            param = params[i]
            annotation = param.annotation
            annotation_str = str(annotation)
            
            if "Tensor" in annotation_str or "tensor" in annotation_str:
                try:
                    import torch
                    if isinstance(arg, (list, tuple)):
                        arg = torch.tensor(arg)
                except Exception:
                    pass
            elif "ndarray" in annotation_str or "array" in annotation_str:
                try:
                    import numpy as np
                    if isinstance(arg, (list, tuple)):
                        arg = np.array(arg)
                except Exception:
                    pass
        prepared.append(arg)
    return prepared

sol = Solution()
results = []
"""

    for idx, tc in enumerate(test_cases):

        args = repr(tc["test"])
        expected = repr(tc["expected_output"])

        runner_code += f"""
try:
    test_input = {args}
    prepared_input = prepare_args(sol.{function_name}, test_input)

    output = sol.{function_name}(*prepared_input)

    # Convert output recursively (handles single values, lists, and tuples of Tensors/Arrays)
    converted_output = to_list_recursive(output)

    passed = converted_output == {expected}

    results.append({{
        "test_case": {idx + 1},
        "input": test_input,
        "passed": passed,
        "expected": {expected},
        "got": converted_output
    }})

except Exception as e:
    results.append({{
        "test_case": {idx + 1},
        "input": {args},
        "passed": False,
        "error": str(e)
    }})
"""

    runner_code += """
print(json.dumps(results))
"""

    with open("public/run.py", "w", encoding="utf-8") as f:
        f.write(runner_code)

    res = subprocess.run(
        ["python", "public/run.py"],
        capture_output=True,
        text=True,
        timeout=10
    )

    if res.returncode != 0:
        raise RuntimeError(res.stderr or res.stdout)

    results = json.loads(res.stdout)
    total = len(results)
    passed = sum(1 for r in results if r.get("passed") is True)
    status = "Accepted" if passed == total else "Failed"

    return status, passed, total, results
