import logging

from langgraph.graph import StateGraph, START, END
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

from src.checkpointer import get_checkpointer, _checkpointer
from src.nodes.interview_nodes import generate_questions, chat, performance_generation_node
from src.models.interview_model import InterviewState


builder = StateGraph(InterviewState)
builder.add_node("chat", chat)
builder.add_node("question_generator", generate_questions)
builder.add_node("performance", performance_generation_node)

builder.add_edge(START, "question_generator")
builder.add_conditional_edges(
    "question_generator",
    lambda x: "performance" if x.time_remaining <= 0 else "chat",
    {"performance": "performance", "chat": "chat"}
)
builder.add_edge("performance", "chat")

builder.add_edge("chat", END)


_compiled_graph = None


async def get_graph():
    global _compiled_graph
    if _compiled_graph is None:
        cp = await get_checkpointer()
        _compiled_graph = builder.compile(checkpointer=cp)
        with open("interview_graph.png", "wb") as f:
            f.write(_compiled_graph.get_graph().draw_mermaid_png())
    return _compiled_graph


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


async def chat_interviewer_stream(thread_id: str, time_remain: int, topic: str, user_input: str):
    graph = await get_graph()
    final_state = {}
    async for event in graph.astream_events(
        {
            "messages": [HumanMessage(content=user_input)],
            "topic": topic,
            "time_remaining": time_remain
        },
        config={"configurable": {"thread_id": thread_id}},
        version="v2"
    ):
        kind = event.get("event")
        if kind == "on_chat_model_stream":
            if "chat_token" in event.get("tags", []):
                chunk = event["data"]["chunk"]
                token = chunk.content if hasattr(chunk, "content") else ""
                if token:
                    yield {"type": "token", "content": token}
        elif kind == "on_chain_end" and event.get("name") == "LangGraph":
            final_state = event["data"].get("output", {})

    performance = final_state.get("performance")
    if performance:
        perf_dict = performance.model_dump() if hasattr(performance, "model_dump") else performance
        logging.info(f"Performance generated for thread_id: {thread_id}")
        yield {"type": "performance", "content": perf_dict}
    else:
        yield {"type": "done", "content": None}


async def load_conversation(thread_id: str):
    graph = await get_graph()
    state = await graph.aget_state(config={"configurable": {"thread_id": thread_id}})
    return state.values.get("messages", [])


async def deleteThread(thread_id: str):
    try:
        cp = await get_checkpointer()
        state = await cp.aget_tuple(config={"configurable": {"thread_id": thread_id}})
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
