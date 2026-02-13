import io
import base64
import contextlib
import importlib.util
import os
from src.exception import MyException
import sys
import os
import uuid
from src.utils.main_utils import write_file, delete_file

async def run_code(sub):
    try:
        code_to_write = base64.b64decode(sub.code).decode("utf-8")
        file_path = os.path.join("src", "code_run", f"Solution_{uuid.uuid4()}.py")
        
        await write_file(file_path, code_to_write)

        # Dynamically load the module
        spec = importlib.util.spec_from_file_location("Solution", file_path)
        solution_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(solution_module)
        
        solution = solution_module.Solution()
        res=[]
        for test in sub.test_cases:
            func = getattr(solution, sub.function_name)
            if isinstance(test['test'], (list, tuple)):
                output = func(*test['test'])
            else:
                output = func(test['test'])
            is_true=output==test['expected_output']
            res.append({
                "test_input": test['test'],
                "test_res": output,
                "expected_res": test['expected_output'],
                "pass": is_true
            })
            await delete_file(file_path)
        return res
    except Exception as e:
        await delete_file(file_path)
        raise MyException(e, sys)