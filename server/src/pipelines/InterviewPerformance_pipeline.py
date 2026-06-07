

from exception import MyException
from utils.Abstract import Pipeline
from components.generate_interview_performance import InterviewPerformance
from entity.config_entity import InterviewPerformanceConfig
import logging
import sys
class InterviewPerformancePipeline(Pipeline):
    def __init__(self,):
        self.interview_performance=InterviewPerformance(
            interview_performance_config=InterviewPerformanceConfig
        )
        
        
    async def initiate(self,thread_id:str):
        try:
            logging.info("Entered in the initiate PerformancePipeline method")
            performance=await self.interview_performance.get_performance(thread_id=thread_id)
            logging.info("performance generated")
            logging.info("Exiting from PerformancePipeline method")
            return performance
        except Exception as e:
            raise MyException(e,sys)    

        

        
        