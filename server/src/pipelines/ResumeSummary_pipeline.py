import sys
import logging
from src.utils.Abstract import Pipeline
from src.utils.asyncHandler import asyncHandler
from src.components.get_summary_using_resume_pdf import ResumeSummary
from src.entity.artifact_entity import ResumeSummaryArtifact
from exception import MyException


class ResumeSummaryPipeline(Pipeline):
    def __init__(self):
        self.resume_summary = ResumeSummary()

    @asyncHandler
    async def initiate(self, file_path: str) -> ResumeSummaryArtifact:
        logging.info("Entered in the initiate ResumeSummaryPipeline method")
        try:
            summary_artifact = await self.resume_summary.get_summary(file_path=file_path)
            logging.info("Resume summary generated successfully")
            logging.info("Exiting from ResumeSummaryPipeline method")
            return summary_artifact
        except Exception as e:
            raise MyException(e, sys)
