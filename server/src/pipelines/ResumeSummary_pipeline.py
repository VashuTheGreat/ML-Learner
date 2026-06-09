
import os
import sys
from src.utils.Abstract import Pipeline
import logging


from src.utils.asyncHandler import asyncHandler

from src.components.get_summary_using_resume_pdf import ResumeSummary


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
        