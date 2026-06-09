from src.models.Resume_model import ResumeState, ResumeSchema
import logging
from src.llm.llm_loader import llm
from src.prompts import resumeGeneration_prompts as ResumeGenerationPrompt

from src.utils.asyncHandler import asyncHandler
from langsmith import traceable


@asyncHandler
@traceable(name="resume_builder", tags=["summary_generator"])
async def resume_maker(state: ResumeState):
    logging.info("Entering resume_maker node")
    logging.info(f"userDetails for LLM: {state.userDetails}")
    prompt_template = ResumeGenerationPrompt

    llm_with_schema = prompt_template | llm.with_structured_output(ResumeSchema, include_raw=True)

    logging.info("Invoking LLM for resume generation")
    full_result = await llm_with_schema.ainvoke({"userDetails": state.userDetails})

    parsed: ResumeSchema = full_result.get("parsed")
    logging.info("Exiting resume_maker node")
    return {"ai_generated_schema": parsed}
