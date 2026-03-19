import base64
import ast
import importlib.util
import os
import logging
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
    Converts lists of numbers (1-D or 2-D) to numpy arrays so that functions
    using .shape, .dot(), etc. work correctly with test case inputs.
    Non-numeric lists (e.g. lists of strings) are left as-is.
    """
    if not isinstance(val, (list, tuple)):
        return val
    if not val:
        return val
    # Check if elements are numeric or nested lists (matrix)
    first = val[0]
    if isinstance(first, (int, float)):
        # 1-D numeric list → numpy array (so .shape works)
        return np.array(val)
    if isinstance(first, list):
        # 2-D list-of-lists → numpy array (matrix)
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

        try:
            # Dynamically load the solution module
            spec = importlib.util.spec_from_file_location("Solution", file_path)
            solution_module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(solution_module)

            # Flexibility: Check if Solution class exists, otherwise use module level
            if hasattr(solution_module, 'Solution'):
                target = solution_module.Solution()
            else:
                target = solution_module

            res = []
            for test in sub.test_cases:
                func = getattr(target, sub.function_name, None)
                if not func:
                    raise AttributeError(f"Function '{sub.function_name}' not found in submitted code.")

                # Handle different test case formats:
                # 1. test["test"] is a list of args (standard)
                # 2. test["test"] is a single value (wrap it)
                # 3. test["test"] is a string (eval - handle with caution)
                
                raw_test_input = test.get("test")
                
                try:
                    if isinstance(raw_test_input, str):
                        try:
                            parsed = ast.literal_eval(f"[{raw_test_input}]")
                            call_args = _smart_args(parsed) if isinstance(parsed, list) else _smart_args([parsed])
                        except (ValueError, SyntaxError):
                            call_args = _smart_args([raw_test_input])
                    elif isinstance(raw_test_input, (list, tuple)):
                        call_args = _smart_args(list(raw_test_input))
                    else:
                        call_args = _smart_args([raw_test_input])
                except Exception as e:
                    logging.warning(f"Failed to parse test input {raw_test_input}: {e}")
                    call_args = _smart_args([raw_test_input])

                output = func(*call_args)

                expected_raw = test.get("expected_output") or test.get("expected_res")
                expected = _to_numpy_if_nested(expected_raw)
                is_true = _equal(output, expected)

                res.append({
                    "test_input": raw_test_input,
                    "test_res": _serialize(output),
                    "expected_res": expected_raw,
                    "pass": bool(is_true),
                })
            
            return res
        finally:
            # Always attempt to delete the temp file
            if os.path.exists(file_path):
                await delete_file(file_path)

    except Exception as e:
        import traceback
        error_msg = f"{str(e)}\n{traceback.format_exc()}"
        logging.error(f"Error in run_code: {error_msg}")
        raise MyException(e, sys)