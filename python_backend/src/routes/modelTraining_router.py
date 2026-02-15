import fastapi
from src.components.model_train import Train_model
from src.models.model_train_models import Train
router=fastapi.APIRouter()
@router.post("/train")
async def _submit(sub: Train):
    return await Train_model(sub=sub)
