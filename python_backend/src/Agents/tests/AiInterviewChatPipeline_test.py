import os
import sys

sys.path.append(os.getcwd())

from dotenv import load_dotenv

load_dotenv()

from logger import *

import logging
import asyncio
from src.Agents.pipelines.AiInterviewChat_pipeline import ChatInterviewerPipeline

async def main():
    chat_interviewer_pipeline=ChatInterviewerPipeline()

    res=await chat_interviewer_pipeline.initiate(
        thread_id="1",
        time_remain=30,
        topic="Machine Learning",
        user_input="""Supervised learning is when a model learns from labeled data, meaning each input example has a known correct output (like “this image is a cat” or “this house is worth X dollars”). The goal is to learn a mapping from inputs to outputs so the model can predict accurate labels for new, unseen data, using tasks such as classification and regression.

Unsupervised learning, on the other hand, works on unlabeled data where there are only input features and no predefined outputs. The model’s goal is to discover hidden patterns, groupings, or structures in the data, such as clustering similar customers or finding associations in item purchases."""
    )
    logging.info(res)



asyncio.run(main())

