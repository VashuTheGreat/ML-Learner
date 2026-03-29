
from src.Predictors.entity.config_entity import JobSimilarityModelConfig
from src.Predictors.components.model_downloader import ModelDownloader
from src.Predictors.utils.Abstract import Pipeline
from logger import logging

class ModelDownloadPipeline(Pipeline):
    def __init__(self):
        self.config = JobSimilarityModelConfig(


             )
        self.downloader = ModelDownloader(self.config)

    async def initiate(self):
        logging.info("Starting model download pipeline...")
        return await self.downloader.download_model()


