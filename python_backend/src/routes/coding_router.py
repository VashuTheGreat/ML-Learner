import fastapi
from src.controllers.coding_controllers import submit,Submission
router=fastapi.APIRouter()
@router.post("/submit")
async def _submit(sub: Submission):
    return await submit(sub=sub)
