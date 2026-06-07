import os
import mlflow
import torch
from src.Predictors.entity.config_entity import JobSimilarityModelConfig
import logging
from utils.asyncHandler import asyncHandler

class ModelDownloader:
    def __init__(self, config: JobSimilarityModelConfig):
        self.config = config
    @asyncHandler
    async def download_model(self):
        logging.info("Downloading model")
        mlflow.set_tracking_uri(self.config.mlflow_tracking_uri)
        path=mlflow.artifacts.download_artifacts(artifact_uri=self.config.model_uri,dst_path=self.config.local_model_path)
        logging.info("Downloaded Model Uri",path)
        logging.info("Model Downloaded")

        
        