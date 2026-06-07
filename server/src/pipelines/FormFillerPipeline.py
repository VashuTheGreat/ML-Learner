from exception import MyException
from utils.Abstract import Pipeline
from components.FormFiller import FormFiller
from models.FormFiller_model import FormFillerModel
import logging
import sys


class FormFillerPipeline(Pipeline):
    def __init__(self):
        self.ai_form_filler = FormFiller()

    async def initiate(self, formFields: str, userDetails: str) -> FormFillerModel:
        try:
            logging.info("Entered in the initiate FormFillerPipeline method")

            response = await self.ai_form_filler.fill_form(
                input_field=formFields,
                userDetails=userDetails
            )

            logging.info("Response generated successfully")
            logging.debug(f"Response: {response}")

            logging.info("Exiting from FormFillerPipeline method")
            return response

        except Exception as e:
            logging.error(f"Error in FormFillerPipeline: {e}")
            raise MyException(e, sys)