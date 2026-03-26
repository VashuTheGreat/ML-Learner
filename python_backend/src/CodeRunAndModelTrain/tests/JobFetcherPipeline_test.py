import os
import sys

sys.path.append(os.getcwd())

from dotenv import load_dotenv

load_dotenv()

from logger import *

import logging
import asyncio
from src.CodeRunAndModelTrain.pipelines.JobFetcherPipeline import JobFetcherPipeline
from src.CodeRunAndModelTrain.models.model_train_models import Train as TrainSchema

async def main():
    job_fetcher_pipeline=JobFetcherPipeline()

    res=await job_fetcher_pipeline.initiate(
        jobtile="machine learning intern",updated=False
    )
    logging.info(res)



asyncio.run(main())


