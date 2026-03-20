
import os
import sys
sys.path.append(os.getcwd())
from src.Agents.utils.Abstract import Pipeline
import logging


from utils.asyncHandler import asyncHandler

from src.Agents.components.get_summary_using_resume_pdf import ResumeSummary


class ResumeSummaryPipeline(Pipeline):
    def __init__(self,):
        self.resume_summary=ResumeSummary()


    @asyncHandler
    async def initiate(self,file_path:str):
        logging.info("Entered in the initiate AboutUserPipeline method")
        res=await self.resume_summary.get_summary(file_path=file_path)
        logging.info("aboutUser generated")
        logging.info("Exiting from AboutUserPipeline method")
        return res
        