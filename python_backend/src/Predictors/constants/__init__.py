import os

import torch
# ----------- JOb Similar -------------------------
MLFLOW_TRACKING_URI=os.getenv('ML_FLOW_TRACKING_URI')
MLFLOW_TRACKING_USERNAME=os.getenv("MLFLOW_TRACKING_USERNAME")
MLFLOW_TRACKING_PASSWORD=os.getenv("MLFLOW_TRACKING_PASSWORD")
MLFLOW_MODEL_URI= "models:/JobSimilarity/2"
MLFLOW_DOWNLOADED_MODEL_PATH:str=os.path.join("artifact","JobSimilarityModel","JobSimilarity.pth")
DEVICE=torch.device("cuda" if torch.cuda.is_available() else "cpu")
