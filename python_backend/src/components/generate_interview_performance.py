# ===================== IMPORTS =====================
import time
import sqlite3
from typing import List, Annotated, Optional

from pydantic import BaseModel

from langgraph.graph import StateGraph, START, END
# from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver
from langgraph.graph.message import add_messages

from langchain_aws import ChatBedrockConverse
from langchain.tools import tool
from langchain.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.messages import BaseMessage
from langchain_community.tools import DuckDuckGoSearchResults
from langchain_core.prompts import PromptTemplate
from pydantic import Field
from src.components.interview import load_conversation
from src.prompts.generateInterviewPerformance_prompts import prompt as GenerateInterviewPerformancePrompt
from src.utils.common_LLm import llm

# ===================== SQLITE CHECKPOINTER =====================
# conn = sqlite3.connect("db.sqlite", check_same_thread=False)
# checkpointer = AsyncSqliteSaver(conn)

# ===================== LLM =====================
llm = llm



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


prompt=PromptTemplate.from_template("You are given with user chat history with an intervier ai , generate performance")
    
llm_str=llm.with_structured_output(Performance)

system_message=SystemMessage(content=prompt.format())
async def get_performance(thread_id: str):
    conversations = await load_conversation(thread_id=thread_id)

    # Start with a human instruction message
    instruction = HumanMessage(
        content=GenerateInterviewPerformancePrompt.format()
    )

    # Combine messages
    messages_for_llm = [instruction] + conversations

    # Ensure last message is human
    if not messages_for_llm[-1].type == "human":
        messages_for_llm.append(HumanMessage(content="Please generate performance."))

    res = await llm_str.ainvoke(messages_for_llm)
    return res

