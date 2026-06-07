
import json
import ast
import re

def clean_and_refactor(code, function_name):
    # 1. First, UNWRAP anything that was double-wrapped or already wrapped
    # Remove any existing "class Solution:" lines and unindent
    lines = code.split('\n')
    unindented_lines = []
    for line in lines:
        if line.strip() == "class Solution:":
            continue
        # Remove one level of indentation (4 spaces) if it was wrapped
        if line.startswith("    "):
            unindented_lines.append(line[4:])
        else:
            unindented_lines.append(line)
    
    code = "\n".join(unindented_lines)
    
    # Remove redundant (self, self, ...)
    code = code.replace("(self, self, ", "(self, ")
    code = code.replace("(self, self)", "(self)")

    # 2. Apply the intended refactors (idempotent)
    code = code.replace("from tinygrad.tensor import Tensor", "import numpy as np")
    code = code.replace("tinygrad.tensor import Tensor", "numpy as np")
    
    # Replace Tensor( ... ) calls with np.array( ... ) - only if not torch.
    code = code.replace("Tensor(-1)", "-1")
    code = re.sub(r'(?<!torch\.)\bTensor\s*\(', 'np.array(', code)
    
    # Replace Tensor type hints with np.ndarray
    code = re.sub(r'[:]\s*(?<!torch\.)\bTensor\b', ': np.ndarray', code)
    code = re.sub(r'->\s*(?<!torch\.)\bTensor\b', '-> np.ndarray', code)
    
    # Catch-all for standalone Tensor
    code = re.sub(r'(?<!torch\.)\bTensor\b', 'np.ndarray', code)

    # 3. Re-wrap correctly
    lines = code.split('\n')
    imports = []
    body = []
    for line in lines:
        if line.strip().startswith(("import ", "from ")):
            imports.append(line)
        else: body.append(line)
        
    final_body = []
    found_func = False
    for line in body:
        if line.strip().startswith("def "):
            # Ensure only ONE self is present
            if "(self, " not in line and "(self)" not in line:
                line = re.sub(r'def\s+(\w+)\s*\(', r'def \1(self, ', line)
                line = line.replace("self, )", "self)")
            found_func = True
        final_body.append("    " + line if (line.strip() or found_func) else line)
        
    return "\n".join(imports) + "\n\n" + "class Solution:\n" + "\n".join(final_body)

def main():
    with open("problems.json", "r") as f:
        problems = json.load(f)

    for p in problems:
        func_name = p.get("function_name", "unknown")
        if func_name == "unknown":
            match = re.search(r"def (\w+)\s*\(", p["starter_code"])
            if match: func_name = match.group(1)
            p["function_name"] = func_name

        p["starter_code"] = clean_and_refactor(p["starter_code"], func_name)
        p["solution_code"] = clean_and_refactor(p["solution_code"], func_name)
        
        # Test cases are likely already fine (lists), but let's double check they aren't double-nested
        # Actually they looked okay in the previous view.

    with open("problems.json", "w") as f:
        json.dump(problems, f, indent=2)

if __name__ == "__main__":
    main()
