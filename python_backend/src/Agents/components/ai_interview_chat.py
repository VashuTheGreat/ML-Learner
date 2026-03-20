import sys
import logging
from exception import MyException

from src.Agents.graphs.interview_graph_builder import chat_interviewer
class AiInterviewChat:
    def __init__(self):
        pass

    

    async def chat_interviewer_ai(self, thread_id: str='1', time_remain: int=1, topic: str='machine learning', user_input: str='hello sir'):
        logging.info(f"Entering chat_interviewer controller for thread_id: {thread_id}")
        try:
            res = await chat_interviewer(thread_id=thread_id, time_remain=time_remain, topic=topic, user_input=user_input)
            logging.info("AI response received")
            return res['messages'][-1].content
        except Exception as e:
            raise MyException(e, sys)