

from src.exception import MyException
from src.utils.Abstract import Pipeline
from src.controllers.performance_controller import get_performance

import logging
import sys
class PerformancePipeline(Pipeline):
    def __init__(self,thread_id:str):
        self.thread_id=thread_id
        
        
    async def initiate(self):
        try:
            logging.info("Entered in the initiate PerformancePipeline method")
            performance=await get_performance(thread_id=self.thread_id)
            logging.info("performance generated")
            logging.info("Exiting from PerformancePipeline method")
            return performance
        except Exception as e:
            raise MyException(e,sys)    

        

        
        