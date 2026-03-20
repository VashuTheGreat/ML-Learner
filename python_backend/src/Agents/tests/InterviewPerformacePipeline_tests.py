


import os
import sys

sys.path.append(os.getcwd())

from dotenv import load_dotenv

load_dotenv()

from logger import *

import logging
import asyncio
from Agents.pipelines.InterviewPerformance_pipeline import InterviewPerformancePipeline

async def main():
    interview_performance_pipeline=InterviewPerformancePipeline()

    res=await interview_performance_pipeline.initiate(thread_id="1")
    logging.info(res)



asyncio.run(main())

