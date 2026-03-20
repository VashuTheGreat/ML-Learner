
from utils.asyncHandler import asyncHandler
from src.Predictors.utils.Abstract import Pipeline
from src.Predictors.components.face_finder import FaceFinder
class FaceFinderPipeline(Pipeline):
    def __init__(self):
        self.face_finder=FaceFinder()
        pass

    @asyncHandler
    async def initiate(self,img):
        return await self.face_finder.find(img=img)
        
