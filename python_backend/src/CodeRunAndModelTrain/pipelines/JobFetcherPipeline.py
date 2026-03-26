from src.CodeRunAndModelTrain.components.job_fetcher import JobFetcher
from src.CodeRunAndModelTrain.utils.Abstract import Pipeline
from src.CodeRunAndModelTrain.entity.config_entity import JobFetcherConfig
from utils.asyncHandler import asyncHandler
import os
import logging

class JobFetcherPipeline(Pipeline):
    def __init__(self):
        super().__init__()
        self.job_fetcher_config = JobFetcherConfig()
        self.job_fetcher = JobFetcher(job_fetcher_config=self.job_fetcher_config)


    @asyncHandler
    async def initiate(self, jobtile: str="Machine Learning",updated:bool=False):
        print("received",jobtile,updated)
        if not updated and os.path.exists(os.path.join("artifact","jobs",jobtile+".csv")):
            logging.info("loading jobs from the saved file")
            self.job_fetcher_config.saved_jobs_file_path=os.path.join("artifact","jobs",jobtile+".csv")
            return self.job_fetcher_config

        logging.info("Entered in the initiate JobFetcherPipeline method")
        result = await self.job_fetcher.fetch(jobtile=jobtile)
        logging.info("jobFetcher execution completed")
        logging.info("Exiting from JobFetcherPipeline method")
        return result
