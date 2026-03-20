import sys
import os

print(f"Python executable: {sys.executable}")
print(f"Working directory: {os.getcwd()}")
print("Python path:")
for p in sys.path:
    print(f"  {p}")

try:
    import fastapi
    print(f"fastapi version: {fastapi.__version__}")
    print(f"fastapi path: {fastapi.__file__}")
except ImportError as e:
    print(f"fastapi NOT found: {e}")

try:
    from src import constants
    print("src.constants imported successfully")
except ImportError as e:
    print(f"src.constants NOT found: {e}")
