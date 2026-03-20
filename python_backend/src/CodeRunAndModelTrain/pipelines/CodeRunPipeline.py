from src.CodeRunAndModelTrain.components.code_runner import CodeRunner
from src.CodeRunAndModelTrain.models.code_run_models import Submission
from src.CodeRunAndModelTrain.utils.Abstract import Pipeline
from utils.asyncHandler import asyncHandler
import logging
import sys

class CodeRunPipeline(Pipeline):
    def __init__(self):
        super().__init__()
        self.code_runner = CodeRunner()

    @asyncHandler
    async def initiate(self, sub: Submission):
        logging.info("Entered in the initiate CodeRunPipeline method")
        result = await self.code_runner.run_code(sub)
        logging.info("Code execution completed")
        logging.info("Exiting from CodeRunPipeline method")
        return result
