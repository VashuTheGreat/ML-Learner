
from exception import MyException
from src.Agents.utils.Abstract import Pipeline
from src.Agents.components.ai_interview_chat import AiInterviewChat
import logging
import sys
class ChatInterviewerPipeline(Pipeline):
    def __init__(self,):


        self.ai_interview_chat=AiInterviewChat()
        
        
    async def initiate(self,thread_id,time_remain,topic,user_input):
        try:
            logging.info("Entered in the initiate ChatInterviewerPipeline method")
            response=await self.ai_interview_chat.chat_interviewer_ai(thread_id,time_remain,topic,user_input)

            logging.info("response generated")
            logging.info("Exiting from ChatInterviewerPipeline method")
            return response
        except Exception as e:
            raise MyException(e,sys)