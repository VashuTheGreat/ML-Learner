import sys
import traceback
from functools import wraps
from exception import MyException

def asyncHandler(fn):
    @wraps(fn)
    async def decorator(*args, **kwargs):
        try:
            return await fn(*args, **kwargs)
        except Exception as e:
            # Get the exact file and line number where the error occurred
            tb = traceback.extract_tb(sys.exc_info()[2])
            # Filter out the asyncHandler wrapper lines from the traceback payload
            filtered_tb = [frame for frame in tb if "asyncHandler.py" not in frame.filename]
            
            error_msg = f"{e}\n[Error Trace]: " + " -> ".join([f"{frame.filename}:at Line_NO:{frame.lineno}" for frame in filtered_tb])
            raise MyException(Exception(error_msg), sys)
    return decorator