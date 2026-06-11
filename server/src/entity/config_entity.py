from dataclasses import dataclass, field
from typing import List
from src.constants import *

import uuid

import os
import time

BASE_FOLDER_NAME=f"artifacts/{time.time()}"



@dataclass
class DummyInterviewConfig:
    no_of_interviews: int = DEFAULT_NO_OF_INTERVIEWS
    fields: List[str] = field(default_factory=lambda: DEFAULT_FIELDS.copy())
    updated: bool = DEFAULT_UPDATED
    companiesName: List[str] = field(default_factory=lambda: DEFAULT_COMPANIES_NAME.copy())
    INTERVIEW_JSON_FILE_PATH: str = INTERVIEW_JSON_FILE_PATH


@dataclass
class InterviewPerformanceConfig:
    thread_id: str



from dataclasses import dataclass, field
from typing import List
from src.constants import *

@dataclass
class JobFetcherConfig:
    no_of_jobs: int = DEFAULT_NO_OF_JOBS
    web_driver_wait:int=WEB_DRIVER_WAIT
    target_url:str=LINKED_IN_TARGET_URL

    saved_jobs_file_path:str=SAVED_JOBS_FILE_PATH

    saved_cookie_path:str=DEFAULT_SAVE_COOKIE_PATH
    headless: bool = False








from dataclasses import dataclass
from src.constants import *
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








@dataclass
class DataIngestionConfig:
    input_file_path: str
    save_file_path: str = field(default=None)

    def __post_init__(self):
        if self.save_file_path is None:
            # Generate a random UUID for the ingested file name
            random_name = f"{uuid.uuid4()}.pdf"
            self.save_file_path = os.path.join(BASE_FOLDER_NAME, INGESTION_FOLDER_NAME, random_name)

@dataclass
class ContentEmbedderConfig:
    data_ingestion_configs:List[DataIngestionConfig]

@dataclass
class DataTransformationConfig:
    vector_store_path: str = field(default=None)

    def __post_init__(self):
        if self.vector_store_path is None:
            self.vector_store_path = os.path.join(BASE_FOLDER_NAME, "transformation", "vector_store")

@dataclass
class ContentTransformationConfig:
    data_transformation_configs: List[DataTransformationConfig]


@dataclass
class RetreiverConfig:
    vector_store_path: str = field(default=None)
    k: int = 5
    ensemble_weights: List[float] = field(default_factory=lambda: [0.7, 0.3])
    partition_strategy: str = "hi_res"
    max_characters: int = 3000
    new_after_n_chars: int = 2400
    combine_text_under_n_chars: int = 50

    def __post_init__(self):
        if self.vector_store_path is None:
            self.vector_store_path = os.path.join(BASE_FOLDER_NAME, "transformation", "vector_store")