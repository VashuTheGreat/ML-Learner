import sys
import io

def run_user_code(code: str):
    # stdout capture
    old_stdout = sys.stdout
    sys.stdout = io.StringIO()
    
    try:
        # Separate namespace for safety
        local_env = {}
        exec(code, {}, local_env)
        output = sys.stdout.getvalue()
        return {"output": output, "error": None, "env": local_env}
    except Exception as e:
        return {"output": None, "error": str(e), "env": None}
    finally:
        sys.stdout = old_stdout


# Example usage
user_code = """
print("Hello from user!")
x = 10
y = 20
print("Sum:", x+y)
"""

result = run_user_code(user_code)

print("OUTPUT:", result["output"])
print("ERROR:", result["error"])
print("ENV:", result["env"])  # user ke variables yaha store ho gaye
