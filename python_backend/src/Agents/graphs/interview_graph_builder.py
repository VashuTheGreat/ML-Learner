# ===================== IMPORTS =====================

import logging

from langgraph.graph import StateGraph, START, END


from langchain.messages import HumanMessage, AIMessage, SystemMessage
from src.Agents.checkpointer import get_checkpointer,_checkpointer

from src.Agents.nodes.question_generator_node import generate_questions
from src.Agents.nodes.chat_node import chat
from src.Agents.models.interview_model import ChatState





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
        with open("interview_graph.png","wb") as f:
            f.write(_compiled_graph.get_graph().draw_mermaid_png())
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
