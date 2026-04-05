from dataclasses import dataclass
from src.Predictors.constants import *
@dataclass
class JobSimilarityModelConfig:
    model_uri: str=MLFLOW_MODEL_URI
    local_model_path: str=MLFLOW_DOWNLOADED_MODEL_PATH
    mlflow_tracking_uri:str=MLFLOW_TRACKING_URI
    mlflow_username:str=MLFLOW_TRACKING_USERNAME
    mlflow_password:str=MLFLOW_TRACKING_PASSWORD



@dataclass
class JobSimilarityPredictionnConfig:
    pass

    pass



@dataclass
class JobSimilaritynValidationConfig:
    
    pass




@dataclass
class JobSimilaritynTrainingConfig:
    
    pass
