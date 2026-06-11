import json
import asyncio
import logging

from langchain_core.messages import HumanMessage, SystemMessage

from src.llm.llm_loader import llm
from src.tools import WebSearch
from src.utils.asyncHandler import asyncHandler

from src.entity.config_entity import RetreiverConfig
from src.retrievers.create_retreivers import Retreiver

from src.models.multi_rag_models import (
    State,
    Orchastrator_output,
    Query_generation_output,
    Relevance_output,
    WebSearchOutput
)

from src.prompts import (
    ORCHESTRATOR_PROMPT,
    QUERY_GENERATION_PROMPT,
    RELEVANCE_CHECKER_PROMPT,
    WEB_SEARCH_PROMPT,
    CHAT_PROMPT
)

web_search_tool = WebSearch()


@asyncHandler
async def orchastrator_node(state: State) -> dict:
    logging.info("Orchestrator node started")

    structured_llm = llm.with_structured_output(Orchastrator_output)

    messages = [
        SystemMessage(content=ORCHESTRATOR_PROMPT),
        *state.get("messages", [])
    ]

    result = structured_llm.invoke(messages)

    logging.info(
        f"Orchestrator routing decision: require_db_search={result.require_db_search}"
    )

    return {
        "require_db_search": result.require_db_search
    }


@asyncHandler
async def query_generation_node(state: State) -> dict:
    logging.info("Query generation node started")

    structured_llm = llm.with_structured_output(Query_generation_output)

    messages = [
        SystemMessage(content=QUERY_GENERATION_PROMPT),
        *state.get("messages", [])
    ]

    result = structured_llm.invoke(messages)

    logging.info(
        f"Generated {len(result.queries)} queries"
    )

    return {
        "queries": result.queries
    }


@asyncHandler
async def retreiver_node(state: State) -> dict:
    logging.info("Retriever node started")

    config = RetreiverConfig()
    retriever_obj = Retreiver(retreiver_config=config)

    paths = state.get("vector_store_file_paths", [])

    if not paths and state.get("vector_store_file_path"):
        paths = [state["vector_store_file_path"]]

    retriever_chain = await retriever_obj.merge_vector_stores(
        vector_store_paths=paths
    )

    if not retriever_chain:
        logging.warning("No retriever chain available")
        return {"retreived_results": []}

    queries = state.get("queries", [])

    if not queries:
        logging.warning("No queries available for retrieval")
        return {"retreived_results": []}

    tasks = [
        retriever_chain.ainvoke(query)
        for query in queries
    ]

    results_list = await asyncio.gather(*tasks)

    results = []
    seen_contents = set()

    for query_results in results_list:
        for doc in query_results:

            if doc.page_content in seen_contents:
                continue

            seen_contents.add(doc.page_content)

            if "relevance_score" in doc.metadata:
                doc.metadata["relevance_score"] = float(
                    doc.metadata["relevance_score"]
                )

            results.append(doc)

    logging.info(
        f"Retriever returned {len(results)} unique documents"
    )

    return {
        "retreived_results": results
    }


@asyncHandler
async def is_retreived_data_enough(state: State) -> dict:
    logging.info("Relevance checker node started")

    retrieved_docs = state.get("retreived_results", [])

    docs_content = [
        doc.page_content
        for doc in retrieved_docs
    ]

    user_query = state.get("messages", [])[-1].content

    prompt = RELEVANCE_CHECKER_PROMPT.format(
        user_query=user_query,
        retreived_docs_content=docs_content
    )

    structured_llm = llm.with_structured_output(
        Relevance_output
    )

    result = structured_llm.invoke(
        [
            SystemMessage(content=prompt)
        ]
    )

    logging.info(
        f"Relevance decision: {result.relevance}"
    )

    return {
        "relevance": result.relevance
    }


@asyncHandler
async def web_search_node(state: State) -> dict:
    logging.info("Web search node started")

    query = state.get("messages", [])[-1].content

    structured_llm = llm.with_structured_output(
        WebSearchOutput
    )

    generated_queries = structured_llm.invoke(
        [
            SystemMessage(
                content=WEB_SEARCH_PROMPT.format(
                    query=query
                )
            )
        ]
    )

    search_tasks = [
        web_search_tool.search.ainvoke(q)
        for q in generated_queries.queries
    ]

    raw_results = await asyncio.gather(*search_tasks)

    results = [
        item
        for sublist in raw_results
        for item in (sublist if isinstance(sublist, list) else [sublist])
    ]

    logging.info(
        f"Web search returned {len(results)} results"
    )

    return {
        "web_search_results": results
    }


@asyncHandler
async def document_refiner(state: State) -> dict:
    logging.info("Document refiner node started")

    return {
        "refined_results": state.get(
            "retreived_results",
            []
        )
    }


@asyncHandler
async def get_chat_node_content(state: State) -> dict:
    logging.info("Preparing multimodal context")

    query = state.get("messages", [])[-1].content

    chunks = state.get(
        "refined_results",
        state.get("retreived_results", [])
    )

    prompt_text = f"""
Based on the following documents answer the question.

Question:
{query}

CONTENT:
"""

    for index, chunk in enumerate(chunks):

        prompt_text += f"\n--- Document {index + 1} ---\n"

        if "original_content" not in chunk.metadata:
            prompt_text += chunk.page_content
            continue

        original_data = json.loads(
            chunk.metadata["original_content"]
        )

        raw_text = original_data.get(
            "raw_text",
            ""
        )

        if raw_text:
            prompt_text += f"\nTEXT:\n{raw_text}\n"

        tables = original_data.get(
            "tables_html",
            []
        )

        if tables:
            prompt_text += "\nTABLES:\n"

            for table in tables:
                prompt_text += f"{table}\n"

    web_results = state.get(
        "web_search_results",
        []
    )

    if web_results:
        prompt_text += "\nWEB SEARCH RESULTS:\n"

        for result in web_results:
            prompt_text += f"{result}\n"

    message_content = [
        {
            "type": "text",
            "text": prompt_text
        }
    ]

    for chunk in chunks:

        if "original_content" not in chunk.metadata:
            continue

        original_data = json.loads(
            chunk.metadata["original_content"]
        )

        images = original_data.get(
            "images_base64",
            []
        )

        for image in images:
            message_content.append(
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{image}"
                    }
                }
            )

    response = llm.invoke(
        [
            HumanMessage(content=message_content)
        ]
    )

    logging.info(
        "Document context prepared successfully"
    )

    return {
        "docs_feed_to_llm": response.content
    }


@asyncHandler
async def chat_node(state: State) -> dict:
    logging.info("Chat node started")

    prompt = [
        SystemMessage(content=CHAT_PROMPT),
        *state.get("messages", [])
    ]

    docs_context = state.get(
        "docs_feed_to_llm"
    )

    if docs_context:
        prompt.append(
            HumanMessage(
                content=f"Context:\n{docs_context}"
            )
        )

    response = await llm.ainvoke(prompt, config={"tags": ["chat_token"]})

    logging.info("Final response generated")

    return {
        "messages": [response],
        "ai_response": response.content
    }