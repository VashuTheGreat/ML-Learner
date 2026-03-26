from dataclasses import dataclass, field
from typing import List
from src.CodeRunAndModelTrain.constants import *

@dataclass
class JobFetcherArtifact:
    saved_jobs_file_path:str