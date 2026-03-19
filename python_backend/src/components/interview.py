# ===================== IMPORTS =====================
import time
import sqlite3
from typing import List, Annotated, Optional
import logging
from pydantic import BaseModel

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.sqlite import SqliteSaver
from langgraph.graph.message import add_messages

from langchain_aws import ChatBedrockConverse
from langchain.tools import tool
from langchain.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.messages import BaseMessage
from langchain_community.tools import DuckDuckGoSearchResults
from langchain_core.prompts import PromptTemplate
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver

import asyncio
import aiosqlite
from src.prompts import interview_prompts1 as QuestionGeneraterPrompt,interview_prompts2 as Chat_prompt
from src.utils.common_LLm import llm
# ===================== SQLITE CHECKPOINTER =====================
_checkpointer = None

async def get_checkpointer():
    global _checkpointer
    if _checkpointer is None:
        conn = await aiosqlite.connect("db.sqlite")
        _checkpointer = AsyncSqliteSaver(conn)
    return _checkpointer

from src.models.interview_model import ChatState

# ===================== LLM =====================
llm = llm

# ===================== STATE =====================


# ===================== TOOL =====================
@tool
def google_search(query: str):
    """Search the web for interview-related info"""
    return DuckDuckGoSearchResults(query=query)

tools = [google_search]

# ===================== QUESTION GENERATOR =====================
def generate_questions(topic: str) -> str:
    prompt = QuestionGeneraterPrompt.format(topic=topic)
    res = llm.invoke(prompt)
    return res.content

# ===================== CHAT PROMPT =====================
prompt_template = Chat_prompt
llm_chat = prompt_template | llm

# ===================== CHAT NODE =====================
async def chat(state: ChatState):
    messages = state.messages

    # Generate questions only once
    if not state.questions_generated:
        if not state.topic:
            raise ValueError("Topic must be provided to start the interview")

        questions = generate_questions(state.topic)

        # Return the generated questions to be stored in the state, but don't show them to the user
        return {
            "questions_generated": True,
            "questions": questions,
            "messages": messages + [
                AIMessage(
                    content=(
                        f"📝 Interview Topic: **{state.topic}**\n\n"
                        "I have prepared your interview questions and I am ready to begin. "
                        "What would you like to start with, or should I ask the first question?"
                    )
                )
            ]
        }

    # Normal interview flow
    # Pass the stored questions in a SystemMessage so the LLM knows what to ask
    system_messages = [
        SystemMessage(content=f"Time remaining: {state.time_remaining} seconds"),
    ]
    
    if state.questions:
        system_messages.append(
            SystemMessage(content=f"Reference questions provided to you (ASK ONLY ONE AT A TIME): {state.questions}")
        )

    response = await llm_chat.ainvoke(state.messages + system_messages)

    # If time is 0, end politely
    if state.time_remaining <= 0:
        return {
            "messages": messages + [
                AIMessage(content="⏰ Time's up! The interview has ended. Thank you for participating.")
            ]
        }

    return {
        "messages": messages + [AIMessage(content=response.content)]
    }

# ===================== GRAPH =====================
builder = StateGraph(ChatState)
builder.add_node("chat", chat)
builder.add_edge(START, "chat")
builder.add_edge("chat", END)

_compiled_graph = None

async def get_graph():
    global _compiled_graph
    if _compiled_graph is None:
        cp = await get_checkpointer()
        _compiled_graph = builder.compile(checkpointer=cp)
    return _compiled_graph

# ===================== Chat Interviewer FUNCTION =====================
async def chat_interviewer(thread_id: str, time_remain: int, topic: str, user_input: str):
    graph = await get_graph()
    result = await graph.ainvoke(
        {
            "messages": [HumanMessage(content=user_input)],
            "topic": topic,
            "time_remaining": time_remain
        },
        config={"configurable": {"thread_id": thread_id}}
    )
    return result


async def load_conversation(thread_id: str):
    graph = await get_graph()
    state = await graph.aget_state(config={'configurable': {'thread_id': thread_id}})
    return state.values.get('messages', [])

async def deleteThread(thread_id: str):
    try:
        cp = await get_checkpointer()
        # Check if thread exists first
        state = await cp.aget_tuple(config={'configurable': {'thread_id': thread_id}})
        if state is None:
            logging.info(f"Thread {thread_id} not found, nothing to delete.")
            return False
            
        await cp.adelete_thread(thread_id=thread_id)
        logging.info(f"Thread {thread_id} deleted successfully.")
        return True
    except Exception as e:
        logging.error(f"Error deleting thread {thread_id}: {e}")
        return False

async def close_checkpointer():
    global _checkpointer
    if _checkpointer is not None:
        try:
            logging.info("Closing checkpointer database connection...")
            # AsyncSqliteSaver has a 'conn' attribute which is an aiosqlite connection
            if hasattr(_checkpointer, 'conn') and _checkpointer.conn:
                await _checkpointer.conn.close()
            _checkpointer = None
            logging.info("Checkpointer connection closed.")
        except Exception as e:
            logging.error(f"Error closing checkpointer: {e}")
