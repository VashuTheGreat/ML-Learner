import os
import sys

sys.path.append(os.getcwd())

from dotenv import load_dotenv

load_dotenv()

from logger import *

import logging
import asyncio
from src.Agents.constants import DEFAULT_NO_OF_INTERVIEWS,DEFAULT_FIELDS,DEFAULT_COMPANIES_NAME,DEFAULT_UPDATED
from src.Agents.pipelines.DummyInterviews_pipeline import DummyInterviewsPipeline

async def main():
    dummy_interview_pipeline=DummyInterviewsPipeline(
        no_of_interviews=DEFAULT_NO_OF_INTERVIEWS,
        fields=DEFAULT_FIELDS,
        companiesName=DEFAULT_COMPANIES_NAME,
        updated=DEFAULT_UPDATED
        
    )

    res=await dummy_interview_pipeline.initiate()
    logging.info(res)



asyncio.run(main())

