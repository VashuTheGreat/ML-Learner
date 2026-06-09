from pydantic import BaseModel
from typing import List, Annotated, Optional
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage


from pydantic import BaseModel, Field
from typing import List, Optional

class Skill(BaseModel):
    score: Optional[int] = Field(None, ge=0, le=10)
    feedback: Optional[str]

class Performance(BaseModel):
    overallScore: int = Field(..., ge=0, le=10, description="Overall performance score")
    verdict: str = Field(..., description="Hire decision", pattern="^(hire|maybe|reject)$")
    summaryFeedback: str

    skills: Optional[dict] = Field(
        default_factory=lambda: {
            "technical": Skill(),
            "dsa": Skill(),
            "problemSolving": Skill(),
            "communication": Skill(),
            "systemDesign": Skill(),
            "projects": Skill(),
            "behaviour": Skill(),
        }
    )

    strengths: Optional[List[str]] = []
    weaknesses: Optional[List[str]] = []
    practiceRecommendations: Optional[List[str]] = []
    studyRecommendations: Optional[List[str]] = []
    lowPriorityOrAvoid: Optional[List[str]] = []

    confidenceLevel: Optional[int] = Field(None, ge=0, le=10)



class InterviewState(BaseModel):
    messages: Annotated[List[BaseMessage], add_messages]
    topic: Optional[str] = None
    time_remaining: int  # in seconds
    questions_generated: bool = False
    questions: Optional[str] = None

    performance: Optional[Performance] = None