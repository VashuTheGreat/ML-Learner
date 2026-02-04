from src.models.submission_models import Submission
from src.components.coderun import run_code
def submit(sub: Submission):
    return {"data":run_code(sub)}