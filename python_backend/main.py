from src.app import app
import uvicorn as uv

if __name__=="__main__":
    uv.run("main:app", host="127.0.0.1", port=8000, reload=True, reload_excludes=["temp/*"])