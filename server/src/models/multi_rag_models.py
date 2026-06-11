from typing import Any, List, Literal

from langgraph.graph.message import MessagesState
from pydantic import BaseModel


class State(MessagesState):
    vector_store_file_paths: List[str]

    require_db_search: bool

    queries: List[str]

    retreived_results: List[Any]

    refined_results: List[Any]

    relevance: Literal[
        "CORRECT",
        "AMBIGUOUS",
        "INCORRECT"
    ]

    web_search_results: List[Any]

    docs_feed_to_llm: str

    ai_response: str


class Orchastrator_output(BaseModel):
    require_db_search: bool


class Query_generation_output(BaseModel):
    queries: List[str]


class Relevance_output(BaseModel):
    relevance: Literal[
        "CORRECT",
        "AMBIGUOUS",
        "INCORRECT"
    ]


class WebSearchOutput(BaseModel):
    queries: List[str]