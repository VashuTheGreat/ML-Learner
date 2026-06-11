import logging
from src.utils.asyncHandler import asyncHandler
from langchain_tavily import TavilySearch
from src.constants import SEARCH_MAX_RESULT, SEARCH_TOPIC
from langchain.tools import tool
from config.app_config import app_config

@tool
async def web_search(query: str):
    """Use this tool to search the web for relevant information. Input should be a search query string."""
    logging.info(f"Performing web search for query: {query}")
    tavily_client = TavilySearch(
        tavily_api_key=app_config.tavily_api_key,
        max_results=SEARCH_MAX_RESULT,
        topic=SEARCH_TOPIC
    )
    results = await tavily_client.ainvoke(query)
    return results

class WebSearch:
    def __init__(self):
        self.search = web_search