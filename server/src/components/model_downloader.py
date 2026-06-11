import os
import mlflow
import torch
from src.entity.config_entity import JobSimilarityModelConfig
import logging
from src.utils.asyncHandler import asyncHandler

class ModelDownloader:
    def __init__(self, config: JobSimilarityModelConfig):
        self.config = config
    @asyncHandler
    async def download_model(self):
        # Check if local model file already exists to skip redundant network calls
        model_file = os.path.join(self.config.local_model_path, "data", "model.pth")
        if os.path.exists(model_file):
            logging.info(f"Model already exists at {model_file}. Skipping download.")
            return self.config.local_model_path

        logging.info("Downloading model")
        if self.config.mlflow_username:
            os.environ["MLFLOW_TRACKING_USERNAME"] = self.config.mlflow_username
        if self.config.mlflow_password:
            os.environ["MLFLOW_TRACKING_PASSWORD"] = self.config.mlflow_password
        mlflow.set_tracking_uri(self.config.mlflow_tracking_uri)
        path=mlflow.artifacts.download_artifacts(artifact_uri=self.config.model_uri,dst_path=self.config.local_model_path)
        logging.info(f"Downloaded Model Uri: {path}")
        logging.info("Model Downloaded")

        
        