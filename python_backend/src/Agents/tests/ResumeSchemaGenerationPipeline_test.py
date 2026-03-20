import os
import sys

sys.path.append(os.getcwd())

from dotenv import load_dotenv

load_dotenv()

from logger import *

import logging
import asyncio
from src.Agents.pipelines.ResumeSchemaGeneration_pipeline import ResumeSchemaGenerationPipeline

async def main():
    resume_schema_generation_pipeline=ResumeSchemaGenerationPipeline()

    res=await resume_schema_generation_pipeline.initiate(userDetails="""
 B.Tech CSE (AIML) undergraduate student.
    Strong interest in Artificial Intelligence and Machine Learning.
    Experienced in software development and problem solving.
    Hands-on experience with real-world projects.
    Quick learner with a passion for continuous improvement.

""")
    logging.info(res)



asyncio.run(main())

