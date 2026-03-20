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
from Agents.graphs.interview_graph_builder import load_conversation
from src.Agents.prompts import generateInterviewPerformance_prompts as GenerateInterviewPerformancePrompt
from Agents.llm.llm_loader import llm
from src.Agents.models.Performance_model import Performance
from src.Agents.prompts import interview_performance_prompt
from utils.asyncHandler import asyncHandler
from src.Agents.entity.artifact_entity import InterviewPerformanceArtifact
from src.Agents.entity.config_entity import InterviewPerformanceConfig
# ===================== SQLITE CHECKPOINTER =====================
# conn = sqlite3.connect("db.sqlite", check_same_thread=False)
# checkpointer = AsyncSqliteSaver(conn)

# ===================== LLM =====================



class InterviewPerformance:
    def __init__(self,interview_performance_config:InterviewPerformanceConfig):
        self.interview_performance_config=interview_performance_config
        self.llm_str=llm.with_structured_output(Performance)

    @asyncHandler
    async def get_performance(self,thread_id:str)->InterviewPerformanceArtifact:
        system_message=SystemMessage(content=interview_performance_prompt.format())

        conversations = await load_conversation(thread_id=thread_id)
        if not conversations:
            return None

        # Start with a human instruction message
        instruction = HumanMessage(
            content=GenerateInterviewPerformancePrompt.format()
        )

        # Combine messages
        messages_for_llm = [instruction] + conversations

        # Ensure last message is human
        if not messages_for_llm[-1].type == "human":
            messages_for_llm.append(HumanMessage(content="Please generate performance."))

        res = await self.llm_str.ainvoke(messages_for_llm)

        interview_performance_artifact=InterviewPerformanceArtifact(
            performance=res
        )
        return interview_performance_artifact

