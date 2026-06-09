
import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

import logger
from api.app import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)