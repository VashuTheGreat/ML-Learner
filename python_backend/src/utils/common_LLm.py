from langchain_aws import ChatBedrockConverse
from src.constants import LLM_MODEL_ID, LLM_REGION

import logging
llm = ChatBedrockConverse(
    model_id=LLM_MODEL_ID,
    region_name=LLM_REGION
)
logging.info(f"LLM initialized with model_id={LLM_MODEL_ID}, region_name={LLM_REGION}")