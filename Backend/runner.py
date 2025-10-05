import sys

try:
    user_code=sys.stdin.read()
    exec(user_code)
except Exception as e:
    print(f"Error : {e}",file=sys.stderr)    