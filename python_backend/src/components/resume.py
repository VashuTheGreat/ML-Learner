import os
import sys
import logging
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from langchain_core.prompts import PromptTemplate
from langchain_aws import ChatBedrockConverse
from langgraph.graph import START, END, StateGraph
import asyncio
from src.prompts import resumeGeneration_prompts as ResumeGenerationPrompt
from src.utils.common_LLm import llm
from src.exception import MyException

# ------------------- Schemas -------------------
from src.models.Resume_model import ResumeSchema, ResumeState
# ------------------- LLM -------------------
llm = llm

# ------------------- Resume Generator Node -------------------
async def resume_maker(state: ResumeState):
    logging.info("Entering resume_maker node")
    try:
        prompt_template = ResumeGenerationPrompt
        
        # Connect prompt to structured output with strict=False
        llm_with_schema = prompt_template | llm.with_structured_output(ResumeSchema, strict=False)
        
        # Invoke LLM
        logging.info("Invoking LLM for resume generation")
        result = await llm_with_schema.ainvoke({"userDetails": state.userDetails})
        
        logging.debug(f"AI Generated Schema: {result}")
        
        # Update state
        state.ai_generated_schema = result
        logging.info("Exiting resume_maker node")
        return state
    except Exception as e:
        raise MyException(e, sys)

# ------------------- Graph Setup -------------------
graph = StateGraph(state_schema=ResumeState)
graph.add_node("resume_maker", resume_maker)
graph.add_edge(START, "resume_maker")
graph.add_edge("resume_maker", END)
graph = graph.compile()

# ------------------- Main -------------------
async def create_resume_schema(userDetails: str):
    logging.info("Entering create_resume_schema")
    try:
        final_state = await graph.ainvoke({"userDetails": userDetails})
        logging.info("Exiting create_resume_schema")
        return final_state
    except Exception as e:
        raise MyException(e, sys)

# ------------------- Run -------------------
if __name__ == "__main__":
    async def main():
        logging.info("Starting resume.py main process")
        try:
            with open("./docs/vansh.txt", "r", encoding="utf-8") as f:
                userDetails = f.read()

            resume_state = await create_resume_schema(userDetails=userDetails)
            print("FINAL STATE:\n", resume_state)
            print("\nAI GENERATED RESUME SCHEMA:\n", resume_state['ai_generated_schema'])
        except Exception as e:
            logging.error(f"Error in main: {str(e)}")
            
    asyncio.run(main())
