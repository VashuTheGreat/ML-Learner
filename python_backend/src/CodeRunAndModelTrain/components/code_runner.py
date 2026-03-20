import base64
import importlib.util
import os
from exception import MyException
import sys
import uuid
import numpy as np
from utils.main_utils import write_file, delete_file

# Optional torch import — only available if installed
try:
    import torch
    _TORCH_AVAILABLE = True
except ImportError:
    _TORCH_AVAILABLE = False


# ─── Conversion helpers ────────────────────────────────────────────────────────

class CodeRunner:
    def __init__(self):
        pass

    def _to_numpy_if_nested(self, val):
        """
        Only converts 2-D nested lists (list-of-lists / matrices) to numpy arrays.
        Flat 1-D lists stay as plain Python lists so they still work as shape args
        (reshape), index tuples, etc.
        """
        if isinstance(val, list) and val and isinstance(val[0], list):
            return np.array(val)
        return val

    def _smart_args(self, args):
        """Convert every argument through _to_numpy_if_nested."""
        if isinstance(args, (list, tuple)):
            return [self._to_numpy_if_nested(a) for a in args]
        return [self._to_numpy_if_nested(args)]

    def _serialize(self, val):
        """
        Convert any non-JSON-serialisable value (numpy array, torch Tensor, etc.)
        into a plain Python list/scalar for safe JSON encoding.
        """
        if _TORCH_AVAILABLE and isinstance(val, torch.Tensor):
            return val.detach().cpu().tolist()
        if isinstance(val, np.ndarray):
            return val.tolist()
        if isinstance(val, (np.integer,)):
            return int(val)
        if isinstance(val, (np.floating,)):
            return float(val)
        if isinstance(val, (np.bool_,)):
            return bool(val)
        return val

    def _equal(self, a, b):
        """Robust equality: handles torch Tensors, numpy arrays, lists, scalars."""
        try:
            a_s = self._serialize(a)
            b_s = self._serialize(b)
            if isinstance(a_s, np.ndarray) or isinstance(b_s, np.ndarray):
                return bool(np.array_equal(a_s, b_s))
            return a_s == b_s
        except Exception:
            return False

    async def run_code(self, sub):
        try:
            code_to_write = base64.b64decode(sub.code).decode("utf-8")
            # Using src/CodeRunAndModelTrain/code_run for temp files to keep it local if possible, 
            # but original used src/code_run. I'll stick to a subdirectory of the component.
            os.makedirs(os.path.join("src", "CodeRunAndModelTrain", "temp_code"), exist_ok=True)
            file_path = os.path.join("src", "CodeRunAndModelTrain", "temp_code", f"Solution_{uuid.uuid4()}.py")

            await write_file(file_path, code_to_write)

            try:
                # Dynamically load the solution module
                spec = importlib.util.spec_from_file_location("Solution", file_path)
                solution_module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(solution_module)

                solution = solution_module.Solution()
                res = []
                for test in sub.test_cases:
                    func = getattr(solution, sub.function_name)

                    # Convert nested-list inputs (matrices) to numpy arrays
                    call_args = self._smart_args(test["test"])
                    output = func(*call_args)

                    expected = self._to_numpy_if_nested(test["expected_output"])
                    is_true = self._equal(output, expected)

                    res.append({
                        "test_input": test["test"],
                        "test_res": self._serialize(output),
                        "expected_res": test["expected_output"],
                        "pass": bool(is_true),
                    })
                return res
            finally:
                if os.path.exists(file_path):
                    await delete_file(file_path)
        except Exception as e:
            raise MyException(e, sys)