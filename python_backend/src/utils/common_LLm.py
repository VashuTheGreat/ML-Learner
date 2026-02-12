from langchain_aws import ChatBedrockConverse
from src.constants import LLM_MODEL_ID, LLM_REGION

llm = ChatBedrockConverse(
    model_id=LLM_MODEL_ID,
    region_name=LLM_REGION
)