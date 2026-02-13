import fastapi
from src.controllers.coding_controllers import submit
from src.models.submission_models import Submission
router=fastapi.APIRouter()
@router.post("/submit")
async def _submit(sub: Submission):
    return await submit(sub=sub)
