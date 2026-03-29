import fastapi
from exception import MyException
import sys
from src.Predictors.pipelines.model_download_pipeline import ModelDownloadPipeline
router = fastapi.APIRouter()


@router.get("/")
async def download_model():
    try:
        model_downloader_pipeline=ModelDownloadPipeline()
        await model_downloader_pipeline.initiate()

    except Exception as e:
        raise MyException(e,sys)    

    