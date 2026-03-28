import os
import sys
sys.path.append(os.getcwd())
from src.Predictors.entity.config_entity import JobSimilarityModelConfig
from src.Predictors.components.model_downloader import ModelDownloader
from logger import logging
import os

class ModelDownloadPipeline:
    def __init__(self):
        self.config = JobSimilarityModelConfig(
            model_name="JobSimilarity",
            version="latest",
            local_model_path=os.path.join("artifact", "jobsimilarModel", "model.pt")
        )
        self.downloader = ModelDownloader(self.config)

    def initiate_model_download(self):
        logging.info("Starting model download pipeline...")
        return self.downloader.download_model()

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    pipeline = ModelDownloadPipeline()
    pipeline.initiate_model_download()
