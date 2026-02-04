# ===================== IMPORTS =====================
import time
import sqlite3
from typing import List, Annotated, Optional

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
from src.prompts.interview_prompts import prompt as QuestionGeneraterPrompt,prompt2 as Chat_prompt
from src.utils.common_LLm import llm
# ===================== SQLITE CHECKPOINTER =====================
conn = sqlite3.connect("db.sqlite", check_same_thread=False)
# checkpointer = SqliteSaver(conn)

# checkpointer=None
async def init_checkpointer():
    conn = await aiosqlite.connect("db.sqlite")
    checkpointer = AsyncSqliteSaver(conn)
    return checkpointer

checkpointer=None
# checkpointer=asyncio.run(init_checkpointer())


# ===================== LLM =====================
llm = llm

# ===================== STATE =====================
class ChatState(BaseModel):
    messages: Annotated[List[BaseMessage], add_messages]
    topic: Optional[str] = None
    time_remaining: int  # in seconds
    questions_generated: bool = False

# ===================== TOOL =====================
@tool
def google_search(query: str):
    """Search the web for interview-related info"""
    return DuckDuckGoSearchResults(query=query)

tools = [google_search]

# ===================== QUESTION GENERATOR =====================
def generate_questions(topic: str) -> str:
    prompt = QuestionGeneraterPrompt.format(topic=topic)
    llm_with_tools = llm.bind_tools(tools=tools)
    res = llm_with_tools.invoke(prompt)
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

        return {
            "questions_generated": True,
            "messages": messages + [
                AIMessage(
                    content=(
                        f"📝 Interview Topic: **{state.topic}**\n\n"
                        f"Here are your interview questions:\n\n{questions}\n\n"
                        "Let's start.\n\nQuestion 1:"
                    )
                )
            ]
        }

    # Normal interview flow with remaining time
    response = await llm_chat.ainvoke(
        state.messages + [SystemMessage(content=f"Time remaining: {state.time_remaining} seconds")]
    )

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
graph = StateGraph(ChatState)
graph.add_node("chat", chat)
graph.add_edge(START, "chat")
graph.add_edge("chat", END)
graph = graph.compile(checkpointer=checkpointer)

# ===================== HELPER FUNCTION =====================
async def chat_interviewer(thread_id: str, time_remain: int, topic: str, user_input: str):
    result = await graph.ainvoke(
        {
            "messages": [HumanMessage(content=user_input)],
            "topic": topic,
            "time_remaining": time_remain
        },
        config={"configurable": {"thread_id": thread_id}}
    )
    return result


async def load_conversation(thread_id:str):
    state = await graph.aget_state(config={'configurable': {'thread_id': thread_id}})
    return state.values.get('messages', [])

async def deleteThread(thread_id: str):
    try:
        # If checkpointer is async
        await checkpointer.adelete_thread(thread_id=thread_id)
        return True
    except Exception as e:
        print("Error deleting thread:", e)
        return False
