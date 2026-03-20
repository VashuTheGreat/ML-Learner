import fastapi
from src.CodeRunAndModelTrain.pipelines.CodeRunPipeline import CodeRunPipeline
from src.CodeRunAndModelTrain.models.code_run_models import Submission
import logging
import sys
from exception import MyException

router = fastapi.APIRouter()

@router.post("/submit")
async def submit_code(sub: Submission):
    logging.info("Entering submit route (async)")
    try:
        pipeline = CodeRunPipeline()
        result = await pipeline.initiate(sub)
        logging.info("Code execution completed")
        return {"data": result}
    except Exception as e:
        raise MyException(e, sys)
