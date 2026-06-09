from dataclasses import dataclass, field
from typing import List
from src.constants import *

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
