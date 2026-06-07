from dataclasses import dataclass
from typing import Any
from src.Agents.constants import *
@dataclass
class DummyInterviewArtifact:
    interviews:Any # a json dict 


@dataclass
class InterviewPerformanceArtifact:
    performance:Any # a json dict     

@dataclass
class ResumeSummaryArtifact:
    summary:str    


from dataclasses import dataclass, field
from typing import List
from src.CodeRunAndModelTrain.constants import *

@dataclass
class JobFetcherArtifact:
    saved_jobs_file_path:str    




from dataclasses import dataclass


@dataclass
class JobSimilarityPridictionArtifact:
    pass



@dataclass
class JobSimilarityTrainingArtifact:
    pass


@dataclass
class JobSimilarityValidationArtifact:
    pass