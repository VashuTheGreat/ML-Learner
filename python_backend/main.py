import os
from dotenv import load_dotenv
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path)

import os
os.environ['LANGCHAIN_PROJECT']="ML_Learner"
os.environ["MLFLOW_TRACKING_USERNAME"] = "vanshsharma7832"

from api.app import app
import uvicorn as uv
from logger import *


if __name__ == "__main__":
    uv.run("main:app", host="0.0.0.0", port=8000, reload=False)