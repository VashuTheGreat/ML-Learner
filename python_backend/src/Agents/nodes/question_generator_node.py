
from utils.asyncHandler import asyncHandler
from src.Agents.prompts import QuestionGeneraterPrompt
from src.Agents.llm.llm_loader import llm

from src.Agents.tools.taivily_search_tool import Taivily_search

from src.Agents.models.interview_model import ChatState


taivily_search=Taivily_search()._tavily_search()

tools=[taivily_search]


@asyncHandler
async def generate_questions(state:ChatState):
    prompt = QuestionGeneraterPrompt.format(topic=state.topic)
    llm_with_tools = llm.bind_tools(tools=tools)
    res = llm_with_tools.invoke(prompt)

    return {'questions_generated':res.content}