from functools import wraps
import logging

def asyncHandler(fn):
    @wraps(fn)
    async def decorator(*args, **kwargs):
        try:
            return await fn(*args, **kwargs)
        except Exception as e:
            logging.exception("Unhandled exception")
            raise
    return decorator