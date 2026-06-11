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

sol = Solution()
results = []
"""

    for idx, tc in enumerate(test_cases):

        args = repr(tc["test"])
        expected = repr(tc["expected_output"])

        runner_code += f"""
try:
    test_input = {args}

    output = sol.{function_name}(*test_input)

    # torch / numpy support
    if hasattr(output, "tolist"):
        output = output.tolist()

    passed = output == {expected}

    results.append({{
        "test_case": {idx + 1},
        "input": test_input,
        "passed": passed,
        "expected": {expected},
        "got": output
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
