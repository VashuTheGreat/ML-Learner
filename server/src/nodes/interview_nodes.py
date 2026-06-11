import logging

from langsmith import traceable
from langchain_core.messages import AIMessage, SystemMessage

from src.utils.asyncHandler import asyncHandler
from src.models.interview_model import InterviewState, Performance
from src.prompts import QuestionGeneraterPrompt, interview_prompts2, generateInterviewPerformance_prompts
from src.llm.llm_loader import llm
from src.tools.taivily_search_tool import tavily_search


tools = [tavily_search]


@asyncHandler
@traceable(name="question_Generator", tags=["interview:question_generator"])
async def generate_questions(state: InterviewState):
    prompt = QuestionGeneraterPrompt.format(topic=state.topic)
    llm_with_tools = llm.bind_tools(tools=tools)
    res = await llm_with_tools.ainvoke(prompt)
    return {
        "questions_generated": True,
        "questions": res.content
    }


@asyncHandler
@traceable(name="performance_generation_node", tags=["interview:performance"])
async def performance_generation_node(state: InterviewState):
    prompt = generateInterviewPerformance_prompts.format()
    llm_structured = llm.with_structured_output(Performance)
    res = await llm_structured.ainvoke([prompt,*state.message])
    logging.info(res)
    return {"performance": res}


@asyncHandler
@traceable(name="Chat_node", tags=["interview:chat"])
async def chat(state: InterviewState):
    llm_chat = interview_prompts2 | llm

    messages = state.messages

    if not state.questions_generated:
        if not state.topic:
            raise ValueError("Topic must be provided to start the interview")

        questions = state.questions

        return {
            "questions_generated": True,
            "messages": messages + [
                AIMessage(
                    content=(
                        f"📝 Interview Topic: **{state.topic}**\n\n"
                        f"Here are your interview questions:\n\n{questions}\n\n"
                        "Let's start.\n\nQuestion 1:"
                    )
                )
            ]
        }

    if state.time_remaining <= 0:
        return {
            "messages": messages + [
                AIMessage(content="⏰ Time's up! The interview has ended. Thank you for participating.")
            ]
        }

    response = await llm_chat.ainvoke(
        state.messages + [SystemMessage(content=f"Time remaining: {state.time_remaining} seconds")]
    )

    return {
        "messages": messages + [AIMessage(content=response.content)]
    }
