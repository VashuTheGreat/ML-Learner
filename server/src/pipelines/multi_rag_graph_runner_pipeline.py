from src.utils.asyncHandler import asyncHandler
from src.components.run_graph import RunGraph
import logging

class RunGraphPipeline:
    def __init__(self):
        pass
    
    @asyncHandler
    async def run_graph(self, state: dict, config: dict = None) -> dict:
        logging.info("Running graph pipeline...")
        runner = RunGraph()
        response = await runner.run(state, config=config)
        logging.info("Graph pipeline completed.")
        return response
