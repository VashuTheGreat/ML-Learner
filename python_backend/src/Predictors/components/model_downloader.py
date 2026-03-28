import os
import mlflow.pytorch
import torch
import dagshub
from src.Predictors.entity.config_entity import JobSimilarityModelConfig
from logger import logging

class ModelDownloader:
    def __init__(self, config: JobSimilarityModelConfig):
        self.config = config

    def download_model(self):
        max_retries = 3
        for attempt in range(max_retries):
            try:
                if "ML_FLOW_TRACKING_URI" in os.environ:
                    mlflow.set_tracking_uri(os.environ["ML_FLOW_TRACKING_URI"])
                    logging.info(f"MLflow tracking URI set to: {os.environ['ML_FLOW_TRACKING_URI']}")
                
                model_uri = f"models:/{self.config.model_name}/{self.config.version}"
                logging.info(f"Downloading model from MLflow: {model_uri} (Attempt {attempt+1})")
                
                model = mlflow.pytorch.load_model(model_uri)
                
                os.makedirs(os.path.dirname(self.config.local_model_path), exist_ok=True)
                
                if isinstance(model, torch.nn.Module):
                    torch.save(model.state_dict(), self.config.local_model_path)
                else:
                    torch.save(model, self.config.local_model_path)
                    
                logging.info(f"Model saved locally at: {self.config.local_model_path}")
                return self.config.local_model_path
                
            except Exception as e:
                logging.error(f"Attempt {attempt+1} failed: {e}")
                if attempt == max_retries - 1:
                    logging.error("All MLflow download attempts failed.")
                    raise e
                import time
                time.sleep(5) 
