import os
import sys
import asyncio
import logging

# Add root directory to sys.path
sys.path.append(os.getcwd())

from dotenv import load_dotenv
load_dotenv()

from logger import *
from src.CodeRunAndModelTrain.pipelines.CodeRunPipeline import CodeRunPipeline
from src.CodeRunAndModelTrain.models.code_run_models import Submission

async def main():
    pipeline = CodeRunPipeline()
    
    # Using the default Submission model (addition function)
    sub = Submission()
    
    logging.info("Starting CodeRunPipeline test")
    res = await pipeline.initiate(sub)
    
    for r in res:
        logging.info(f"Input: {r['test_input']} | Result: {r['test_res']} | Expected: {r['expected_res']} | Pass: {r['pass']}")

if __name__ == "__main__":
    asyncio.run(main())
