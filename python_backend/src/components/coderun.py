import base64
import importlib.util
import os
from src.exception import MyException
import sys
import uuid
import numpy as np
from src.utils.main_utils import write_file, delete_file

# Optional torch import — only available if installed
try:
    import torch
    _TORCH_AVAILABLE = True
except ImportError:
    _TORCH_AVAILABLE = False


# ─── Conversion helpers ────────────────────────────────────────────────────────

def _to_numpy_if_nested(val):
    """
    Only converts 2-D nested lists (list-of-lists / matrices) to numpy arrays.
    Flat 1-D lists stay as plain Python lists so they still work as shape args
    (reshape), index tuples, etc.
    Numpy handles  ndarray @ list  and  ndarray.reshape(list)  natively.
    """
    if isinstance(val, list) and val and isinstance(val[0], list):
        return np.array(val)
    return val


def _smart_args(args):
    """Convert every argument through _to_numpy_if_nested."""
    if isinstance(args, (list, tuple)):
        return [_to_numpy_if_nested(a) for a in args]
    return [_to_numpy_if_nested(args)]


# ─── Serialisation ─────────────────────────────────────────────────────────────

def _serialize(val):
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


# ─── Equality ─────────────────────────────────────────────────────────────────

def _equal(a, b):
    """
    Robust equality: handles torch Tensors, numpy arrays, lists, scalars.
    Converts everything to plain Python lists before comparing so that
    cross-type comparisons (e.g. Tensor vs list) work correctly.
    """
    try:
        a_s = _serialize(a)
        b_s = _serialize(b)
        # After serialisation both sides are plain Python — compare directly
        if isinstance(a_s, np.ndarray) or isinstance(b_s, np.ndarray):
            return bool(np.array_equal(a_s, b_s))
        return a_s == b_s
    except Exception:
        return False


# ─── Runner ───────────────────────────────────────────────────────────────────

async def run_code(sub):
    try:
        code_to_write = base64.b64decode(sub.code).decode("utf-8")
        file_path = os.path.join("src", "code_run", f"Solution_{uuid.uuid4()}.py")

        await write_file(file_path, code_to_write)

        # Dynamically load the solution module
        spec = importlib.util.spec_from_file_location("Solution", file_path)
        solution_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(solution_module)

        solution = solution_module.Solution()
        res = []
        try:
            for test in sub.test_cases:
                func = getattr(solution, sub.function_name)

                # Convert nested-list inputs (matrices) to numpy arrays
                call_args = _smart_args(test["test"])
                output = func(*call_args)

                expected = _to_numpy_if_nested(test["expected_output"])
                is_true = _equal(output, expected)

                res.append({
                    "test_input": test["test"],
                    # Serialise output so FastAPI can JSON-encode it
                    "test_res": _serialize(output),
                    "expected_res": test["expected_output"],
                    "pass": bool(is_true),
                })
        finally:
            await delete_file(file_path)

        return res
    except Exception as e:
        raise MyException(e, sys)