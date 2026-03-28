from dotenv import load_dotenv
load_dotenv()

import os
os.environ['LANGCHAIN_PROJECT']="ML_Learner"
from api.app import app
import uvicorn as uv
from logger import *


if __name__ == "__main__":
    uv.run("main:app", host="0.0.0.0", port=8000, reload=False)