from utils.asyncHandler import asyncHandler

import mlflow.pytorch
import torch
from logger import logging
from src.Predictors.constants import DEVICE
from src.Predictors.models.similarJobPredictor_model import ResumeScore
from src.Predictors.utils.similarJobPrediction_utils import prepare_input,preprocess_text,tokenize
from src.Predictors.entity.config_entity import JobSimilarityModelConfig
from src.Predictors.pipelines.model_download_pipeline import ModelDownloadPipeline
import os
import pandas as pd
class Model:
    def __init__(self):
        # Point to the MLflow artifact directory, not the inner model.pth
        self.artifact_dir = os.path.join("artifact", "JobSimilarityModel", "JobSimilarity.pth")
        self.config = JobSimilarityModelConfig(
            local_model_path=os.path.join(self.artifact_dir, "data", "model.pth")
        )
        self.model = None
        self.is_loaded = False
        


        

    async def load(self):
        if self.is_loaded:
            return
        if not os.path.exists(self.config.local_model_path):
            logging.info(f"Local model not found at {self.config.local_model_path}. Triggering download...")
            downloader = ModelDownloadPipeline()
            await downloader.initiate()

        # Use mlflow.pytorch.load_model on the artifact directory.
        # Direct torch.load on model.pth fails when the model was saved with a
        # different Python version (pickle protocol mismatch: saved on 3.12, running 3.10).
        logging.info(f"Loading model from MLflow artifact dir: {self.artifact_dir}")
        self.model = mlflow.pytorch.load_model(self.artifact_dir, map_location=DEVICE)
        self.model.to(DEVICE)
        self.model.eval()

        self.is_loaded = True
        logging.info("Model loaded successfully!")
        

    async def predict(self, job_discription: str, userDetails: str):
        self.model.eval()
        with torch.no_grad():
            sample = {
                'job_description': job_discription,
                'resume': userDetails
            }
            text,labels=prepare_input(sample)
            enc=tokenize(text)
            input_ids=enc['input_ids'].to(DEVICE)
            attention_mask=enc['attention_mask'].to(DEVICE)
            output=self.model(input_ids,attention_mask)
            return output.cpu().numpy()