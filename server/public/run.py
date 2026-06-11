import numpy as np

class Solution:
    def matrix_dot_vector_tg(self, a: np.ndarray, b: np.ndarray) -> np.ndarray:
        """
        Compute the product of matrix `a` and vector `b` using tinygrad.
        Inputs will be tinygrad Tensors.
        Returns a 1-D np.ndarray of length m, or -1 if dimensions mismatch.
        """
        if len(a[0]) != len(b):
            return -1
        return a @ b


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

try:
    test_input = [[[1, 2, 3], [2, 4, 5], [6, 8, 9]], [1, 2, 3]]
    prepared_input = prepare_args(sol.matrix_dot_vector_tg, test_input)

    output = sol.matrix_dot_vector_tg(*prepared_input)

    # Convert output recursively (handles single values, lists, and tuples of Tensors/Arrays)
    converted_output = to_list_recursive(output)

    passed = converted_output == [14, 25, 49]

    results.append({
        "test_case": 1,
        "input": test_input,
        "passed": passed,
        "expected": [14, 25, 49],
        "got": converted_output
    })

except Exception as e:
    results.append({
        "test_case": 1,
        "input": [[[1, 2, 3], [2, 4, 5], [6, 8, 9]], [1, 2, 3]],
        "passed": False,
        "error": str(e)
    })

try:
    test_input = [[[1, 2], [2, 4], [6, 8], [12, 4]], [1, 2, 3]]
    prepared_input = prepare_args(sol.matrix_dot_vector_tg, test_input)

    output = sol.matrix_dot_vector_tg(*prepared_input)

    # Convert output recursively (handles single values, lists, and tuples of Tensors/Arrays)
    converted_output = to_list_recursive(output)

    passed = converted_output == -1

    results.append({
        "test_case": 2,
        "input": test_input,
        "passed": passed,
        "expected": -1,
        "got": converted_output
    })

except Exception as e:
    results.append({
        "test_case": 2,
        "input": [[[1, 2], [2, 4], [6, 8], [12, 4]], [1, 2, 3]],
        "passed": False,
        "error": str(e)
    })

print(json.dumps(results))
