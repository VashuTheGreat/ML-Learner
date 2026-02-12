
from src.exception import MyException
from src.utils.Abstract import Pipeline
from src.controllers.interview_controller import chat_interviewer

import logging
import sys
class ChatInterviewerPipeline(Pipeline):
    def __init__(self,thread_id,time_remain,topic,user_input):
        self.thread_id=thread_id
        self.time_remain=time_remain
        self.topic=topic
        self.user_input=user_input
        
        
    async def initiate(self):
        try:
            logging.info("Entered in the initiate ChatInterviewerPipeline method")
            response=await chat_interviewer(thread_id=self.thread_id,time_remain=self.time_remain,topic=self.topic,user_input=self.user_input)
            logging.info("response generated")
            logging.info("Exiting from ChatInterviewerPipeline method")
            return response
        except Exception as e:
            raise MyException(e,sys)