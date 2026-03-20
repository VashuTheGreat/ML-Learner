import sys
import logging
from langgraph.graph import START, END, StateGraph
from exception import MyException

# ------------------- Schemas -------------------
from src.Agents.models.Resume_model import ResumeState
# ------------------- LLM -------------------
from src.Agents.nodes.resume_builder import resume_maker
graph = StateGraph(state_schema=ResumeState)
graph.add_node("resume_maker", resume_maker)
graph.add_edge(START, "resume_maker")
graph.add_edge("resume_maker", END)
graph = graph.compile()


with open("resume_graph.png","wb") as f:
    f.write(graph.get_graph().draw_mermaid_png())

# ------------------- Main -------------------
async def create_resume_schema(userDetails: str):
    logging.info("Entering create_resume_schema")
    try:
        final_state = await graph.ainvoke({"userDetails": userDetails})
        logging.info("Exiting create_resume_schema")
        return final_state
    except Exception as e:
        raise MyException(e, sys)

