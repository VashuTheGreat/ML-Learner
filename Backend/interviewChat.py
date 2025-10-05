import io
import soundfile as sf
import sounddevice as sd
from groq import Groq
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
import pydantic
import os
import base64
from collections import defaultdict

print("🚀 Starting script...")
load_dotenv()

api_key = os.environ.get("GROQ_API_KEY")
if not api_key:
    print("❌ Error: GROQ_API_KEY not found!")

client = Groq(api_key=api_key)

prompt = PromptTemplate(
    template="""
You are an interviewer specialized in Machine Learning, Deep Learning, and AI.
Your role is to conduct a technical interview for a candidate applying for an AI/ML role.

Rules:
- Do NOT answer the candidate’s questions.
- ONLY ask questions related to ML, DL, and AI.
- Try to confuse the candidate.
- Questions should gradually increase in difficulty.
- Keep the interview flow natural.

Previous 5 chats history:
{history}

Candidate says:
{user_input}

Interviewer:
""",
    input_variables=['user_input', 'history']
)

llm = ChatGroq(model='llama-3.3-70b-versatile')


class History(pydantic.BaseModel):
    hist: list = []


def HistoryMaker(state: History, aiSaid, userSaid) -> History:
    state.hist.append({"User": userSaid, "AI": aiSaid})
    while len(state.hist) > 5:
        state.hist.pop(0)
    return state


def format_history(state: History) -> str:
    return "\n".join([f"User: {entry['User']}\nAI: {entry['AI']}" for entry in state.hist])


def response(state: History, chain, userInput) -> History:
    try:
        formatted_history = format_history(state)
        prompt_text = prompt.format(history=formatted_history, user_input=userInput)
        airesponse = chain.invoke(prompt_text)
        airesponse = airesponse.content
        if not isinstance(airesponse, str):
            airesponse = str(airesponse)
        HistoryMaker(state, airesponse, userInput)
    except Exception as e:
        print(f"❌ Error in response: {e}")
        airesponse = "Sorry, there was an error generating the response."
        HistoryMaker(state, airesponse, userInput)
    return state


def speak(text: str, model: str = "playai-tts", voice: str = "Fritz-PlayAI", response_format="wav"):
    if not text.strip():
        return None
    print("🗣️ Generating speech...")
    try:
        response = client.audio.speech.create(
            model=model,
            voice=voice,
            input=text,
            response_format=response_format
        )
        audio_bytes = response.read() if hasattr(response, "read") else response
        return audio_bytes
    except Exception as e:
        print(f"❌ Exception occurred in speak: {e}")
        return None


# 🔥 Global memory per user
user_histories = defaultdict(History)


def interview_flow(user_id, userInput, voice):
    # Assign allowed voices
    if voice.lower() == "boy":
        voice = "Fritz-PlayAI"
    else:
        voice = "Aaliyah-PlayAI"

    # Get existing history
    state = user_histories[user_id]

    userInput = userInput.strip()
    if not userInput:
        return {"airesponse": "", "audio_data": ""}

    try:
        state_updated = response(state, llm, userInput)
        user_histories[user_id] = state_updated  # update memory

        last_ai_response = state_updated.hist[-1]["AI"]
        audio_data = speak(last_ai_response, voice=voice)

        if audio_data:
            audio_b64 = base64.b64encode(audio_data).decode("utf-8")
            return {"airesponse": last_ai_response, "audio_data": audio_b64}
        return {"airesponse": last_ai_response, "audio_data": ""}
    except Exception as e:
        print(f"❌ Error in interview_flow loop: {e}")
        return {"airesponse": "", "audio_data": ""}
