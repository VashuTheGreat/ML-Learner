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