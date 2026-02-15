import sys
import logging
from src.models.model_train_models import Train
from src.controllers.modelTrain_controller import TrainController
from src.exception import MyException

async def Train_model(sub: Train):
    logging.info("Entering Train_model component (async)")
    try:
        controller = TrainController()
        result = await controller.train(sub)
        logging.info("Train_model execution completed")
        return result
    except Exception as e:
        raise MyException(e, sys)