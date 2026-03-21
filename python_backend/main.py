from api.app import app
import uvicorn as uv
from logger import *
from dotenv import load_dotenv
load_dotenv()

if __name__ == "__main__":
    uv.run(app, host="0.0.0.0", port=7860, reload=False)