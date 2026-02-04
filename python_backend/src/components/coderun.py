import io
import base64
import contextlib

def run_code(sub):
    code_to_write = base64.b64decode(sub.code).decode("utf-8")
    out_put = []

    # Prepare execution context with common libraries
    ctx = {}
    try:
        import numpy as np
        ctx['np'] = np
        ctx['numpy'] = np
    except ImportError: pass
    try:
        from tinygrad.tensor import Tensor
        ctx['Tensor'] = Tensor
    except ImportError: pass
    try:
        import torch
        ctx['torch'] = torch
    except ImportError: pass

    # Custom print to handle Tensors/Numpy arrays
    def to_list(obj):
        # tinygrad Tensor
        try:
            from tinygrad.tensor import Tensor
            if isinstance(obj, Tensor):
                return obj.tolist()
        except Exception:
            pass

        # numpy array or torch tensor
        if hasattr(obj, 'detach'):  # torch
            try:
                return obj.detach().cpu().tolist()
            except Exception:
                pass

        if hasattr(obj, 'numpy'):  # numpy-like
            try:
                res = obj.numpy()
                return res.tolist() if hasattr(res, 'tolist') else res
            except Exception:
                pass

        return obj


    def custom_print(*args, **kwargs):
        new_args = [to_list(arg) for arg in args]
        print(*new_args, **kwargs)

    ctx['print'] = custom_print

    import ast
    def get_clean_result(actual_str, expected):
        try:
            actual_obj = ast.literal_eval(actual_str)
            expected_obj = expected if not isinstance(expected, str) else ast.literal_eval(expected)
            return actual_obj == expected_obj, actual_obj
        except Exception:
            def normalize(s):
                import re
                s = re.sub(r'\s+', '', str(s))
                return s.replace("'", '"').replace(",]", "]").replace(",}", "}")
            return normalize(actual_str) == normalize(expected), actual_str

    for test in sub.test_cases:
        test_input = test["test"]
        result_display = ""
        is_true = False
        
        try:
            f = io.StringIO()
            with contextlib.redirect_stdout(f):
                exec(code_to_write + "\n" + test_input, ctx)
            
            raw_result = f.getvalue().strip()
            is_true, result_display = get_clean_result(raw_result, test["expected_output"])
        except Exception as e:
            result_display = f"Error: {e}"
            is_true = False

        out_put.append({
            "test_input": test_input,
            "test_res": result_display,
            "expected_res": test["expected_output"],
            "pass": is_true
        })

    return out_put
