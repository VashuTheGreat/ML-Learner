import os
from config.app_config import getAppConfig
appconfig=getAppConfig()
import os
os.environ['LANGCHAIN_PROJECT']="ML_Learner"
os.environ["MLFLOW_TRACKING_USERNAME"] = "vanshsharma7832"

from api.app import app
from logger import *


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)