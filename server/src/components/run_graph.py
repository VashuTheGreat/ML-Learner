from src.graphs.multi_rag_graph_builder import graph
from src.utils.asyncHandler import asyncHandler
import logging

class RunGraph:
    def __init__(self):
        pass

    @asyncHandler
    async def run(self, state: dict, config: dict = None) -> dict:
        logging.info("Starting RunGraph component execution...")
        if config is None:
            config = {"configurable": {"thread_id": "default_thread"}}
        result = await graph.ainvoke(state, config=config)
        logging.info("RunGraph component execution completed.")
        return result