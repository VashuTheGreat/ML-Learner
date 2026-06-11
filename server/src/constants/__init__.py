import os
import torch

from config.app_config import app_config

# ====== Server =========================================================
SERVER_HOST = "0.0.0.0"
SERVER_PORT = app_config.port
RELOAD = True
RELOAD_EXCLUDES = ["temp/*"]

# ====== LLM =============================================================
LLM_MODEL_ID = "llama-3.3-70b-versatile"

# ====== Storage / Directories ==========================================
ARTIFACT_DIR = "artifact"
DOCS_DIR = "docs"
LOGS_DIR = "logs"
DB_PATH = "db.sqlite"
INTERVIEW_JSON_FILE_PATH = os.path.join(ARTIFACT_DIR, "interview.json")

os.makedirs(ARTIFACT_DIR, exist_ok=True)
os.makedirs(DOCS_DIR, exist_ok=True)
os.makedirs(LOGS_DIR, exist_ok=True)

# ================== API Prefixes ==============================================
MODEL_TRAIN_API_PREFIX = "/api/train"

# =========== Default Interview Values ===============================================
DEFAULT_INTERVIEW_FIELDS = ["AI/ML", "Backend", "Data Science"]
DEFAULT_COMPANIES = ["Google", "Amazon", "Microsoft", "Apple", "Meta", "Netflix"]
DEFAULT_USER_DETAILS = """
NAME: John Doe
TITLE: Backend Developer
LOCATION: Bangalore, India
SKILLS: Python, Django, REST APIs, PostgreSQL
SUMMARY: Backend developer with experience building scalable APIs and database-driven applications.
"""

# ========= DummyInterview Defaults =================================
DEFAULT_NO_OF_INTERVIEWS = 3
DEFAULT_FIELDS = None
DEFAULT_UPDATED = False
DEFAULT_COMPANIES_NAME = ["Google", "Amazon", "Microsoft", "Apple", "Meta", "Netflix"]

# ================ Model Training Config =========================================
MODEL_TRAIN_CONFIG = os.path.join("config", "model_train.yaml")

# =========== Job Fetcher ===============================
DEFAULT_NO_OF_JOBS = 30
WEB_DRIVER_WAIT = 20
LINKED_IN_TARGET_URL = "https://www.linkedin.com/"
DEFAULT_SAVE_COOKIE_PATH = os.path.join("artifact", "cookies", "cookies.pkl")
SAVED_JOBS_FILE_PATH = os.path.join("artifact", "jobs", "jobs.csv")

# ============ Credentials AppConfig ============================
LINKED_IN_USER_NAME = app_config.linked_in_user_email
LINKED_IN_USER_PASSWORD = app_config.linked_in_user_password
RAPIDAPI_KEY = app_config.rapidapi_key

# ========== MLFlow / Job Similarity =============================
MLFLOW_TRACKING_URI = app_config.ml_flow_tracking_uri
MLFLOW_TRACKING_USERNAME = app_config.mlflow_tracking_username
MLFLOW_TRACKING_PASSWORD = app_config.mlflow_tracking_password
MLFLOW_MODEL_URI = "models:/JobSimilarity/2"
MLFLOW_DOWNLOADED_MODEL_PATH: str = os.path.join("artifact", "JobSimilarityModel", "JobSimilarity.pth")
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# =============== Public Temp Dir ===============================
PUBLIC_TEMP_DIR = os.path.join("public", "temp")
