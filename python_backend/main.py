from src.app import app
import uvicorn as uv
from src.logger import *
from src.constants import SERVER_HOST, SERVER_PORT, RELOAD, RELOAD_EXCLUDES
from dotenv import load_dotenv
load_dotenv()

if __name__ == "__main__":
    uv.run("main:app", host=SERVER_HOST, port=SERVER_PORT, reload=RELOAD, reload_excludes=RELOAD_EXCLUDES)