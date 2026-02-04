import os
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from langchain_core.prompts import PromptTemplate
from langchain_aws import ChatBedrockConverse
from langgraph.graph import START, END, StateGraph
import asyncio
import vconsoleprint
from src.prompts.resumeGeneration_prompts import prompt as ResumeGenerationPrompt
from src.utils.common_LLm import llm

# ------------------- Schemas -------------------
class Project(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tech_stack: List[str] = Field(default_factory=list)

class Education(BaseModel):
    degree: Optional[str] = None
    institute: Optional[str] = None
    year: Optional[str] = None

class Experience(BaseModel):
    role: Optional[str] = None
    company: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None

class ResumeSchema(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    soft_skills: List[str] = Field(default_factory=list)
    languages: List[str] = Field(default_factory=list)
    education: List[Education] = Field(default_factory=list)
    experience: List[Experience] = Field(default_factory=list)
    projects: List[Project] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)
    someImportantUrls: Dict[str, str] = Field(default_factory=dict)

class ResumeState(BaseModel):
    userDetails: str
    ai_generated_schema: Optional[ResumeSchema] = None

# ------------------- LLM -------------------
llm =llm

# ------------------- Resume Generator Node -------------------
async def resume_maker(state: ResumeState):
    prompt_template = ResumeGenerationPrompt
    
    # Connect prompt to structured output with strict=False
    llm_with_schema = prompt_template | llm.with_structured_output(ResumeSchema, strict=False)
    
    # Invoke LLM
    result = await llm_with_schema.ainvoke({"userDetails": state.userDetails})
    
    print("DEBUG: AI Generated Schema:\n", result)  # debug check
    
    # Update state
    state.ai_generated_schema = result
    return state

# ------------------- Graph Setup -------------------
graph = StateGraph(state_schema=ResumeState)
graph.add_node("resume_maker", resume_maker)
graph.add_edge(START, "resume_maker")
graph.add_edge("resume_maker", END)
graph = graph.compile()

# ------------------- Main -------------------
async def create_resume_schema(userDetails: str):
    final_state = await graph.ainvoke({"userDetails": userDetails})
    return final_state

# ------------------- Run -------------------
if __name__ == "__main__":
    with open("./docs/vansh.txt", "r", encoding="utf-8") as f:
        userDetails = f.read()

    resume_state = create_resume_schema(userDetails=userDetails)
    print("FINAL STATE:\n", resume_state)
    print("\nAI GENERATED RESUME SCHEMA:\n", resume_state['ai_generated_schema'])
