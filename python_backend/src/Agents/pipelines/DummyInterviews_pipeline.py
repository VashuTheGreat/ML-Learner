

from exception import MyException
from src.Agents.utils.Abstract import Pipeline
from src.Agents.entity.config_entity import DummyInterviewConfig
from src.Agents.components.dummyInterviews import DummyInterview
import logging
import sys


class DummyInterviewsPipeline(Pipeline):
    def __init__(self,no_of_interviews,updated,fields,companiesName):
        
        self.dummy_interviewConfig=DummyInterviewConfig(
            no_of_interviews=no_of_interviews,
            fields=fields,
            companiesName=companiesName,
            updated=updated
        )


        self.dummy_interview=DummyInterview(
            dummy_interview_config=self.dummy_interviewConfig
        )
        
        
    async def initiate(self):
        try:
            logging.info("Entered in the initiate SchemaInterviewPipeline method")
            schema=await self.dummy_interview.generate_interview_schema()
            logging.info("schema generated")
            logging.info("Exiting from schemaInterviewPipeline method")
            return schema
        except Exception as e:
            raise MyException(e,sys)    

    