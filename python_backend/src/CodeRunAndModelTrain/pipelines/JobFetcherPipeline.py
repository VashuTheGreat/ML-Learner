from src.CodeRunAndModelTrain.components.job_fetcher import JobFetcher
from src.CodeRunAndModelTrain.utils.Abstract import Pipeline
from src.CodeRunAndModelTrain.entity.config_entity import JobFetcherConfig
from utils.asyncHandler import asyncHandler
import logging

class JobFetcherPipeline(Pipeline):
    def __init__(self):
        super().__init__()
        self.job_fetcher_config = JobFetcherConfig()
        self.job_fetcher = JobFetcher(job_fetcher_config=self.job_fetcher_config)


    @asyncHandler
    async def initiate(self, jobtile: str="Machine Learning"):
        logging.info("Entered in the initiate JobFetcherPipeline method")
        result = await self.job_fetcher.fetch(jobtile=jobtile)
        logging.info("jobFetcher execution completed")
        logging.info("Exiting from JobFetcherPipeline method")
        return result
