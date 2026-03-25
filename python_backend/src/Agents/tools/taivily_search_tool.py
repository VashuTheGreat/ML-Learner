import logging
import sys
from typing import List
from langchain_community.tools.tavily_search import TavilySearchResults
from exception import MyException
from utils.asyncHandler import asyncHandler
from langchain.tools import tool
# from langsmith import traceable

class Taivily_search:
    def __init__(self):
        pass

    @asyncHandler
    @tool
    async def _tavily_search(self, query: str, max_results: int = 5) -> List[dict]:
        """Use this tool to search over the internet"""
        logging.info(f"Using Tavily to search for: {query}")
        try:
            tool = TavilySearchResults(max_results=max_results)
            results = await tool.ainvoke({"query": query})

            normalized: List[dict] = []
            for r in results or []:
                normalized.append(
                    {
                        "title": r.get("title") or "",
                        "url": r.get("url") or "",
                        "snippet": r.get("content") or r.get("snippet") or "",
                        "published_at": r.get("published_date") or r.get("published_at"),
                        "source": r.get("source"),
                    }
                )
            logging.debug(f"Tavily search returned {len(normalized)} results")
            return normalized
        except Exception as e:
            logging.error(f"Error in Tavily_search: {str(e)}")
            raise MyException(e, sys)