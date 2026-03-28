
from utils.asyncHandler import asyncHandler
from src.Predictors.utils.Abstract import Pipeline
from src.Predictors.components.similarJobPrediction import SimilarJobPrediction
class SimilarJobPipeline(Pipeline):
    def __init__(self):
        self.similar_job_predictor=SimilarJobPrediction()
        pass

    @asyncHandler
    async def initiate(self,jobDiscription:str,userDetails:str):
        if not hasattr(self.similar_job_predictor.model, 'is_loaded') or not self.similar_job_predictor.model.is_loaded:
            await self.similar_job_predictor.model.load()
        return await self.similar_job_predictor.recommend(jobDiscription=jobDiscription,userDetails=userDetails)
        
