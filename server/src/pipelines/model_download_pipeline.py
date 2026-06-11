
from src.entity.config_entity import JobSimilarityModelConfig
from src.components.model_downloader import ModelDownloader
from src.utils.Abstract import Pipeline
from logger import logging

class ModelDownloadPipeline(Pipeline):
    def __init__(self):
        self.config = JobSimilarityModelConfig(


             )
        self.downloader = ModelDownloader(self.config)

    async def initiate(self):
        logging.info("Starting model download pipeline...")
        return await self.downloader.download_model()


