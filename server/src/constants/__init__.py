import os


# Application Configuration

# Server Configuration
SERVER_HOST = "0.0.0.0"
SERVER_PORT = os.getenv("PORT") if os.getenv("PORT")!=None else 8000
RELOAD = True
RELOAD_EXCLUDES = ["temp/*"]

# LLM Configuration
LLM_MODEL_ID = "llama-3.3-70b-versatile"

# Storage Configuration
ARTIFACT_DIR = "artifact"
DOCS_DIR = "docs"
LOGS_DIR = "logs"
DB_PATH = "db.sqlite"
INTERVIEW_JSON_FILE_PATH = os.path.join(ARTIFACT_DIR, "interview.json")

os.makedirs(ARTIFACT_DIR, exist_ok=True)
os.makedirs(DOCS_DIR, exist_ok=True)
os.makedirs(LOGS_DIR, exist_ok=True)



# Default Values
DEFAULT_INTERVIEW_FIELDS = ["AI/ML", "Backend", "Data Science"]
DEFAULT_COMPANIES = ["Google", "Amazon", "Microsoft", "Apple", "Meta", "Netflix"]
DEFAULT_USER_DETAILS = """
NAME: John Doe
TITLE: Backend Developer
LOCATION: Bangalore, India
SKILLS: Python, Django, REST APIs, PostgreSQL
SUMMARY: Backend developer with experience building scalable APIs and database-driven applications.
"""
MODEL_TRAIN_API_PREFIX="/api/train"






# --------------------- DummyInterview ------------------
DEFAULT_NO_OF_INTERVIEWS=3
DEFAULT_FIELDS=None
DEFAULT_UPDATED=False
DEFAULT_COMPANIES_NAME=['Google',"Amazon","Microsoft","Apple","Meta","Netflix"]






# ============================= Code Runner and model ==================

import os
# ---------------- config ----------------------------------------------

MODEL_TRAIN_CONFIG = os.path.join("config", "model_train.yaml")



# --------------------- JOB FETCHER -------------------------
DEFAULT_NO_OF_JOBS=30
WEB_DRIVER_WAIT=20
LINKED_IN_TARGET_URL="https://www.linkedin.com/"

DEFAULT_SAVE_COOKIE_PATH=os.path.join("artifact","cookies","cookies.pkl")

LINKED_IN_USER_NAME=os.getenv("LINKED_IN_USER_EMAIL")
LINKED_IN_USER_PASSWORD=os.getenv("LINKED_IN_USER_PASSWORD")
RAPIDAPI_KEY=os.getenv("RAPIDAPI_KEY")


SAVED_JOBS_FILE_PATH=os.path.join("artifact","jobs","jobs.csv")




import os

import torch
# ----------- JOb Similar -------------------------
MLFLOW_TRACKING_URI=os.getenv('ML_FLOW_TRACKING_URI')
MLFLOW_TRACKING_USERNAME=os.getenv("MLFLOW_TRACKING_USERNAME")
MLFLOW_TRACKING_PASSWORD=os.getenv("MLFLOW_TRACKING_PASSWORD")
MLFLOW_MODEL_URI= "models:/JobSimilarity/2"
MLFLOW_DOWNLOADED_MODEL_PATH:str=os.path.join("artifact","JobSimilarityModel","JobSimilarity.pth")
DEVICE=torch.device("cuda" if torch.cuda.is_available() else "cpu")

PUBLIC_TEMP_DIR = os.path.join("public", "temp")
