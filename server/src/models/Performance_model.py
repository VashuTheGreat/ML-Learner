from pydantic import BaseModel, Field
from typing import List, Optional

class Skill(BaseModel):
    score: int = Field(..., ge=0, le=10, description="Score between 0 and 10")
    feedback: str = Field(..., description="Short justification/feedback for this score")

class SkillsBreakdown(BaseModel):
    technicalKnowledge: Skill = Field(..., description="Technical knowledge evaluation")
    communicationSkills: Skill = Field(..., description="Communication skills evaluation")
    problemSolvingAbility: Skill = Field(..., description="Problem solving ability evaluation")
    confidence: Skill = Field(..., description="Confidence evaluation")
    clarityOfExplanation: Skill = Field(..., description="Clarity of explanation evaluation")

class Performance(BaseModel):
    overallScore: int = Field(..., ge=0, le=10, description="Overall performance score")
    verdict: str = Field(..., description="Hire decision", pattern="^(hire|maybe|reject)$")
    summaryFeedback: str
    skills: SkillsBreakdown = Field(..., description="Detailed breakdown of candidate skills")
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    practiceRecommendations: List[str] = Field(default_factory=list)
    studyRecommendations: List[str] = Field(default_factory=list)
    lowPriorityOrAvoid: List[str] = Field(default_factory=list)
    confidenceLevel: int = Field(..., ge=0, le=10, description="Overall confidence level")
