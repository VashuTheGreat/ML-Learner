

from src.exception import MyException
from src.utils.Abstract import Pipeline
from src.controllers.user_controller import create_schema
from src.models.userSchema_model import userDetails

import logging
import sys
class SchemaPipeline(Pipeline):
    def __init__(self, userDetails: userDetails):
        self.userDetails = userDetails
        
        
    async def initiate(self):
        try:
            logging.info("Entered in the initiate SchemaPipeline method")
            schema=await create_schema(userDetails=self.userDetails)
            logging.info("schema generated")
            logging.info("Exiting from schemaPipeline method")
            return schema
        except Exception as e:
            raise MyException(e,sys)    

        

        
        