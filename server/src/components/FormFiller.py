from src.utils.asyncHandler import asyncHandler
from src.llm.llm_loader import llm
from src.models.FormFiller_model import FormFillerModel
import logging
from langchain_core.messages import SystemMessage
from src.prompts import FORMFILLER_LLM_PROMPT


class FormFiller:
    def __init__(self):
        self.logger = logging.getLogger("FormFiller")
        self.llm = llm.with_structured_output(FormFillerModel)

    @asyncHandler
    async def fill_form(self, input_field: str, userDetails: str) -> FormFillerModel:
        self.logger.info("Starting form filling process")

        prompt = FORMFILLER_LLM_PROMPT.format(
            inputFormFields=input_field,
            userdetails=userDetails
        )

        self.logger.debug(f"Formatted prompt: {prompt}")

        res = self.llm.invoke(
            [SystemMessage(content=prompt)]
        )

        self.logger.info("Form filling completed successfully")
        self.logger.debug(f"LLM response: {res}")

        return res