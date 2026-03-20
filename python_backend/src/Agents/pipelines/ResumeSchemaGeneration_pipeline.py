

from exception import MyException
from src.Agents.utils.Abstract import Pipeline
from src.Agents.models.userSchema_model import userDetails
from utils.asyncHandler import asyncHandler
from src.Agents.components.resume_schema_generator import ResumeSchemaGenerator

import logging
import sys

class ResumeSchemaGenerationPipeline(Pipeline):
    def __init__(self,):
        self.resume_schema_generator = ResumeSchemaGenerator()
        
    @asyncHandler
    async def initiate(self, userDetails: userDetails):
            logging.info("Entered in the initiate SchemaPipeline method")
            schema=await self.resume_schema_generator.generate_schema(userDetails=userDetails.userDetails)
            logging.info("schema generated")
            logging.info("Exiting from schemaPipeline method")
            return schema   

        

        
        