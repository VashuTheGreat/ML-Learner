


from src.Agents.models.interview_model import ChatState
from utils.asyncHandler import asyncHandler
from langchain_core.messages import AIMessage,SystemMessage
from src.Agents.prompts import interview_prompts2
from src.Agents.llm.llm_loader import llm

# ===================== CHAT NODE =====================

@asyncHandler
async def chat(state: ChatState):
    llm_chat = interview_prompts2 | llm

    messages = state.messages

    # Generate questions only once
    if not state.questions_generated:
        if not state.topic:
            raise ValueError("Topic must be provided to start the interview")

        questions = state.questions_generated

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

    # Normal interview flow with remaining time
    response = await llm_chat.ainvoke(
        state.messages + [SystemMessage(content=f"Time remaining: {state.time_remaining} seconds")]
    )

    # If time is 0, end politely
    if state.time_remaining <= 0:
        return {
            "messages": messages + [
                AIMessage(content="⏰ Time's up! The interview has ended. Thank you for participating.")
            ]
        }

    return {
        "messages": messages + [AIMessage(content=response.content)]
    }
