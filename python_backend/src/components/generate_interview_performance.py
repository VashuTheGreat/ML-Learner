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
from src.prompts import generateInterviewPerformance_prompts as GenerateInterviewPerformancePrompt
from src.utils.common_LLm import llm
from src.models.Performance_model import Performance
# ===================== SQLITE CHECKPOINTER =====================
# conn = sqlite3.connect("db.sqlite", check_same_thread=False)
# checkpointer = AsyncSqliteSaver(conn)

# ===================== LLM =====================
llm = llm




prompt=PromptTemplate.from_template("You are given with user chat history with an intervier ai , generate performance")
    
llm_str=llm.with_structured_output(Performance)

system_message=SystemMessage(content=prompt.format())
async def get_performance(thread_id: str):
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

    res = await llm_str.ainvoke(messages_for_llm)
    return res

