from dataclasses import dataclass, field
from typing import List
from src.Agents.constants import *

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