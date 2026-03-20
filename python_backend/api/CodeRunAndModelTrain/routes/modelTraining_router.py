import fastapi
from src.CodeRunAndModelTrain.pipelines.ModelTrainPipeline import ModelTrainPipeline
from src.CodeRunAndModelTrain.models.model_train_models import Train as TrainSchema
import logging
import sys
from exception import MyException

router = fastapi.APIRouter()

@router.post("/train")
async def train_model(sub: TrainSchema):
    logging.info("Entering train route (async)")
    try:
        pipeline = ModelTrainPipeline()
        result = await pipeline.initiate(schema=sub)
        logging.info("Model training completed")
        return {"data": result}
    except Exception as e:
        raise MyException(e, sys)
