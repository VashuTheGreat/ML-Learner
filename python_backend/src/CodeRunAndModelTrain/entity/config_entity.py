from dataclasses import dataclass, field
from typing import List
from src.CodeRunAndModelTrain.constants import *

@dataclass
class JobFetcherConfig:
    no_of_jobs: int = DEFAULT_NO_OF_JOBS
    web_driver_wait:int=WEB_DRIVER_WAIT
    target_url:str=LINKED_IN_TARGET_URL

    saved_jobs_file_path:str=SAVED_JOBS_FILE_PATH

    saved_cookie_path:str=DEFAULT_SAVE_COOKIE_PATH
    headless: bool = False