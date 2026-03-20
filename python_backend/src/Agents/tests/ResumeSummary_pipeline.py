import os
import sys

sys.path.append(os.getcwd())

from dotenv import load_dotenv

load_dotenv()

from logger import *

import logging
import asyncio
from src.Agents.pipelines.ResumeSummary_pipeline import ResumeSummaryPipeline

async def main():
    resume_schema_pipeline=ResumeSummaryPipeline()

    res=await resume_schema_pipeline.initiate(file_path="docs/vashuResume.pdf")
    logging.info(res)



asyncio.run(main())

