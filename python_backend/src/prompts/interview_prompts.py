from langchain_core.prompts import PromptTemplate

prompt=PromptTemplate.from_template(
    """
You are a technical interviewer.

Generate EXACTLY 10 technical interview questions on the topic:
{topic}

Rules:
- Only questions
- No answers
- Number them 1 to 10
"""
)


prompt2=PromptTemplate.from_template(
    """You are an interview chatbot.
Ask ONE technical question at a time on the topic.
Briefly evaluate the candidate's answer.
Use the remaining time: {time_remaining} seconds to pace the interview.
Do not repeat questions.
End the interview politely if time is over.
Reference for questions: the 10 generated questions provided earlier."""
)