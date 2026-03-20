import os
import sys

sys.path.append(os.getcwd())

from dotenv import load_dotenv

load_dotenv()

from logger import *

import logging
import asyncio
from src.CodeRunAndModelTrain.pipelines.ModelTrainPipeline import ModelTrainPipeline
from src.CodeRunAndModelTrain.models.model_train_models import Train as TrainSchema

async def main():
    model_trainer_pipeline=ModelTrainPipeline()

    res=await model_trainer_pipeline.initiate(
        schema=TrainSchema(
            model_name="LinearRegression",
            model_params={"fit_intercept": True},
            type="regression",
            make_dataset={"n_samples": 100, "n_features": 2, "noise": 0.1}
        )
    )
    logging.info(res)



asyncio.run(main())


