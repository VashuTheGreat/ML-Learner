import sys
import logging
from src.models.submission_models import Submission
from src.components.coderun import run_code
from src.exception import MyException

async def submit(sub: Submission):
    logging.info("Entering submit controller (async)")
    try:
        result = run_code(sub)
        logging.info("Code execution completed")
        return {"data": result}
    except Exception as e:
        raise MyException(e, sys)