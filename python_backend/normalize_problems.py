
import json
import ast
import re

def normalize_code(code, function_name):
    # 1. Separate imports from the rest
    lines = code.split('\n')
    imports = []
    others = []
    for line in lines:
        if line.strip().startswith(("import ", "from ")):
            if line.strip() not in imports:
                imports.append(line.strip())
        elif line.strip() == "class Solution:":
            continue
        else:
            if line.strip() or others: # ignore leading empty lines in body
                others.append(line)
    
    # 2. Clean up the body lines
    # We need to find the minimum indentation of the non-empty lines in 'others'
    # and strip it, then re-indent by 4.
    
    # However, since we might have double-nested or messed up indentation,
    # let's find the 'def' line and use it as a reference.
    def_index = -1
    for i, line in enumerate(others):
        if f"def {function_name}" in line:
            def_index = i
            break
    
    if def_index == -1:
        # If we can't find it, just strip and indent everything
        clean_body = [line.strip() for line in others]
    else:
        # Strip common leading whitespace from def_index onwards
        def_line = others[def_index]
        leading_ws = len(def_line) - len(def_line.lstrip())
        clean_body = []
        for line in others:
            if line.strip():
                # Remove the leading whitespace found at def_line
                curr_ws = len(line) - len(line.lstrip())
                to_remove = min(curr_ws, leading_ws)
                clean_body.append(line[to_remove:])
            else:
                clean_body.append("")

    # 3. Final assembly
    # Ensure imports are unique and separated
    final_imports = "\n".join(imports)
    
    # Re-indent exactly 4 spaces
    indented_body = []
    for line in clean_body:
        if line.strip():
            indented_body.append("    " + line)
        else:
            indented_body.append("")
            
    return final_imports + "\n\nclass Solution:\n" + "\n".join(indented_body)

def main():
    with open("problems.json", "r") as f:
        problems = json.load(f)

    for p in problems:
        func_name = p.get("function_name", "unknown")
        p["starter_code"] = normalize_code(p["starter_code"], func_name)
        p["solution_code"] = normalize_code(p["solution_code"], func_name)

    with open("problems.json", "w") as f:
        json.dump(problems, f, indent=2)

if __name__ == "__main__":
    main()
