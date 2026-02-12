

from src.exception import MyException
from src.utils.Abstract import Pipeline
from src.controllers.user_controller import create_schema
from src.models.userSchema_model import userDetails
import fastapi
from fastapi import Request,Depends
from src.controllers.interview_controller import interview,chat_interviewer,List,Query

import logging
import sys
class InterviewSchemaPipeline(Pipeline):
    def __init__(self,no_of_interviews,updated,fields,companiesName):
        self.no_of_interviews=no_of_interviews
        self.updated=updated
        self.fields=fields
        self.companiesName=companiesName
        
        
    async def initiate(self):
        try:
            logging.info("Entered in the initiate SchemaInterviewPipeline method")
            schema=await interview(no_of_interviews=self.no_of_interviews,updated=self.updated,fields=self.fields,companiesName=self.companiesName)
            logging.info("schema generated")
            logging.info("Exiting from schemaInterviewPipeline method")
            return schema
        except Exception as e:
            raise MyException(e,sys)    

    