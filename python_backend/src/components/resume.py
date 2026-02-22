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
        logging.info(f"userDetails for LLM: {state.userDetails}")
        prompt_template = ResumeGenerationPrompt
        
        # Connect prompt to structured output with include_raw=True
        llm_with_schema = prompt_template | llm.with_structured_output(ResumeSchema, include_raw=True)
        
        # Invoke LLM
        logging.info("Invoking LLM for resume generation")
        full_result = await llm_with_schema.ainvoke({"userDetails": state.userDetails})
        
        result = full_result.get("parsed")
        raw_output = full_result.get("raw")
        
        logging.info(f"LLM parsed result: {result}")
        
        # Fallback parsing logic if the LLM returned text instead of a formal tool call
        if result is None and raw_output and hasattr(raw_output, 'content'):
            logging.info("Attempting fallback parsing for LLM content")
            content = raw_output.content
            if isinstance(content, list):
                content = " ".join([c.get('text', '') if isinstance(c, dict) else str(c) for c in content])
            
            try:
                import json
                import re
                
                # Try to extract JSON from the text
                # It might be a direct JSON or inside a "parameters" block of a pseudo-tool-call
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    json_str = json_match.group(0)
                    data = json.loads(json_str)
                    
                    # If it looks like a tool call wrapper (e.g., {"type": "function", "parameters": {...}})
                    if "parameters" in data:
                        data = data["parameters"]
                    
                    # Clean up "null" strings that should be actual None
                    def clean_nulls(d):
                        if isinstance(d, dict):
                            return {k: clean_nulls(v) for k, v in d.items()}
                        elif isinstance(d, list):
                            return [clean_nulls(v) for v in d]
                        elif d == "null":
                            return None
                        return d
                    
                    data = clean_nulls(data)
                    result = ResumeSchema(**data)
                    logging.info("Successfully extracted ResumeSchema via fallback parser")
            except Exception as parse_err:
                logging.error(f"Fallback parsing failed: {str(parse_err)}")
        
        if result is None:
            logging.error(f"LLM raw output (could not be parsed): {raw_output}")
        
        # Update state - return a dict of updates
        logging.info("Exiting resume_maker node")
        return {"ai_generated_schema": result}
    except Exception as e:
        logging.error(f"Error in resume_maker: {str(e)}")
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
