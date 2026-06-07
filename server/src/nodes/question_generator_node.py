
from utils.asyncHandler import asyncHandler
from prompts import QuestionGeneraterPrompt
from llm.llm_loader import llm

from tools.taivily_search_tool import Taivily_search

from models.interview_model import ChatState
from langsmith import traceable

taivily_search=Taivily_search()._tavily_search()

tools=[taivily_search]


@asyncHandler
@traceable(name="question_Generator",tags=["interview:question_generator"])
async def generate_questions(state:ChatState):
    prompt = QuestionGeneraterPrompt.format(topic=state.topic)
    llm_with_tools = llm.bind_tools(tools=tools)
    res = llm_with_tools.invoke(prompt)

    return {'questions_generated':res.content}