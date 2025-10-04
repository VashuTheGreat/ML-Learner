import os
import sounddevice as sd
import numpy as np
from groq import Groq
from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
import pydantic
import io
import soundfile as sf

print("🚀 Starting script...")
load_dotenv()

api_key = os.environ.get("GROQ_API_KEY")
if not api_key:
    print("❌ Error: GROQ_API_KEY not found in environment!")

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
- You may request clarifications or examples if needed.
- Keep the interview flow natural.

Previous 5 chats history:
{history}

Candidate says:
{user_input}

Interviewer:
""",
    input_variables=['user_input','history']
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
        airesponse=airesponse.content
        if not isinstance(airesponse, str):
            airesponse = str(airesponse)
        HistoryMaker(state, airesponse, userInput)
    except Exception as e:
        print(f"❌ Error in response: {e}")
        airesponse = "Sorry, there was an error generating the response."
        HistoryMaker(state, airesponse, userInput)
    return state




def toSpoken(audio_bytes):
    try:
        audio_io = io.BytesIO(audio_bytes)
        data, samplerate = sf.read(audio_io)
        print("🔊 Playing audio...")
        sd.play(data, samplerate)
        sd.wait()
        print("✅ Finished speaking!")
    except Exception as e:
        print(f"❌ Error in toSpoken: {e}")
        input()

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


# def interview_flow():
#     state = History()
#     print("Interview started. Say 'exit' to end.\n")
#     while True:
#         userInput = input("Candidate: ").strip()
#         if not userInput:
#             continue
#         if userInput.lower() == "exit":
#             break
#         try:
#             state_updated = response(state, llm, userInput)
#             last_ai_response = state_updated.hist[-1]["AI"]

#             print(f"Interviewer: {last_ai_response}\n")
#             audio_data = speak(last_ai_response)
#             if audio_data:
#                 toSpoken(audio_data)
#         except Exception as e:
#             print(f"❌ Error in interview_flow loop: {e}")


if __name__ == "__main__":
    interview_flow()
    input("Press Enter to exit...")
