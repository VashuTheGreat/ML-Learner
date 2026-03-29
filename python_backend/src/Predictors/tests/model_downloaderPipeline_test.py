import os
import sys
sys.path.append(os.getcwd())

# load_dotenv MUST come before any project imports so that os.getenv() calls
# inside constants/__init__.py capture the correct values at module load time.
from dotenv import load_dotenv
load_dotenv()

from src.Predictors.pipelines.model_download_pipeline import ModelDownloadPipeline
from logger import *
import asyncio


async def main():
    model_downloader_pipeline=ModelDownloadPipeline()
    await model_downloader_pipeline.initiate()


asyncio.run(main())