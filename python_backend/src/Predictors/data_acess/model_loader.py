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
        self.config = JobSimilarityModelConfig(
            model_name="JobSimilarity",
            version="latest",
            local_model_path=os.path.join("artifact", "JobSimilarityModel", "JobSimilarity.pt")
        )
        self.model = ResumeScore()
        self.is_loaded = False
        


        

    async def load(self):
        if self.is_loaded:
            return
            
        if not os.path.exists(self.config.local_model_path):
            logging.info(f"Local model not found at {self.config.local_model_path}. Triggering download...")
            downloader = ModelDownloadPipeline()
            downloader.initiate_model_download()
            
        logging.info(f"Loading model from local path: {self.config.local_model_path}")
        state_dict = torch.load(self.config.local_model_path, map_location=DEVICE)
        self.model.load_state_dict(state_dict)
        self.model.to(DEVICE)
        self.model.eval()
            
        self.is_loaded = True
        logging.info("Model loaded successfully from local artifact!")
        

    async def predict(self,job_discription:str,userDetails:str):
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