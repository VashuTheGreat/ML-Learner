

import os
import sys

sys.path.append(os.getcwd())

from logger import *

from dotenv import load_dotenv
load_dotenv()

import asyncio
from src.Predictors.pipelines.similarPrediction_pipeline import SimilarJobPipeline

from PIL import Image


async def main():
    similar_job_prediction_pipeline=SimilarJobPipeline()

    res=await similar_job_prediction_pipeline.initiate(jobDiscription="""digital marketing strategist innovatetech corp""",userDetails="""waqas zulfiqar professional summary customer o..""")
    print(res)



asyncio.run(main())
