from dataclasses import dataclass
from typing import Any
from src.constants import *
@dataclass
class DummyInterviewArtifact:
    interviews:Any # a json dict 


@dataclass
class InterviewPerformanceArtifact:
    performance:Any # a json dict     

@dataclass
class ResumeSummaryArtifact:
    summary:str    



@dataclass
class JobFetcherArtifact:
    saved_jobs_file_path:str    






@dataclass
class JobSimilarityPridictionArtifact:
    pass



@dataclass
class JobSimilarityTrainingArtifact:
    pass


@dataclass
class JobSimilarityValidationArtifact:
    pass







@dataclass
class RetrievalArtifact:
    retreivar: object

@dataclass
class DataIngestionArtifact:
    ingested_file_path:str

@dataclass
class DataTransformationArtifact:
    vector_store_path: str

@dataclass
class ContentEmbedderArtifact:
    data_ingestion_artifacts: list[DataIngestionArtifact]

@dataclass
class ContentTransformedArtifact:
    data_transformation_artifacts: list[DataTransformationArtifact]
    
