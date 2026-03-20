from utils.asyncHandler import asyncHandler

from src.Agents.graphs.resume_graph_builder import create_resume_schema
from src.Agents.models.Resume_model import ResumeSchema
import logging
class ResumeSchemaGenerator:
    def __init__(self):
        pass
    

    @asyncHandler
    async def generate_schema(self,userDetails:str)->ResumeSchema:
        logging.info("Entered in the Generate Schema Componenet")
        final_state=await create_resume_schema(userDetails=userDetails)
        logging.info("Exited from the Generate Schema Componenet")
        return final_state["ai_generated_schema"]