
from src.exception import MyException
from src.utils.Abstract import Pipeline
from src.controllers.user_controller import uploadResume
from fastapi import UploadFile
import logging
import sys
class AboutUserPipeline(Pipeline):
    def __init__(self,resume_file:UploadFile):
        self.resume_file=resume_file
        
    async def initiate(self):
        try:
            logging.info("Entered in the initiate AboutUserPipeline method")
            res:str=await uploadResume(file=self.resume_file)
            logging.info("aboutUser generated")
            logging.info("Exiting from AboutUserPipeline method")
            return res
        except Exception as e:
            raise MyException(e,sys)