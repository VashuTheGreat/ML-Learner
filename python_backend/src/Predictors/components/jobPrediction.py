
from typing import Any
from utils.asyncHandler import asyncHandler
import logging
class JobPrediction:
    def __init__(self):
        pass
    

    @asyncHandler
    async def predict(self,userSummary:str)->Any:
        logging.info("Entered in a prediction JObFinder")
        
