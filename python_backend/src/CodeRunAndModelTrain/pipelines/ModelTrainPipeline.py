

from src.CodeRunAndModelTrain.components.modelTrain import TrainController

from src.CodeRunAndModelTrain.models.model_train_models import Train as TrainSchema
from utils.asyncHandler import asyncHandler
from src.CodeRunAndModelTrain.utils.Abstract import Pipeline
class ModelTrainPipeline(Pipeline):
    def __init__(self):
        self.train_controller=TrainController()
        pass
    

    @asyncHandler
    async def initiate(self,schema:TrainSchema):
        res=await self.train_controller.train(schema=schema)
        return res
