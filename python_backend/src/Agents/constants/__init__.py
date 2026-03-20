import os


# Application Configuration

# Server Configuration
SERVER_HOST = "0.0.0.0"
SERVER_PORT = os.getenv("PORT") if os.getenv("PORT")!=None else 8000
RELOAD = True
RELOAD_EXCLUDES = ["temp/*"]

# LLM Configuration
LLM_MODEL_ID = "us.meta.llama3-3-70b-instruct-v1:0"
LLM_REGION = "us-east-1"

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