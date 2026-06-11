from langchain_groq import ChatGroq
from src.constants import LLM_MODEL_ID
from config.app_config import app_config
import logging

llm = ChatGroq(model=LLM_MODEL_ID, api_key=app_config.groq_api_key)
logging.info(f"LLM initialized with Groq model={LLM_MODEL_ID}")