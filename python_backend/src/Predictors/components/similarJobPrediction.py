
from utils.asyncHandler import asyncHandler
from src.Predictors.data_acess.model_loader import Model
from typing import List
class SimilarJobPrediction:
    def __init__(self):
        self.model=Model()
        pass
    

    @asyncHandler
    async def recommend(self,jobDiscription:str,userDetails:str):
        return await self.model.predict(job_discription=jobDiscription,userDetails=userDetails)

