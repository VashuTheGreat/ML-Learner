from langchain_groq import ChatGroq
from src.constants import LLM_MODEL_ID
import logging

llm = ChatGroq(model=LLM_MODEL_ID)
logging.info(f"LLM initialized with Groq model={LLM_MODEL_ID}")