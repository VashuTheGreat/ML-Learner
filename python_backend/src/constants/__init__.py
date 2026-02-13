import os


# Application Configuration
APP_TITLE = "Interview Cracker"
APP_DESCRIPTION = "Interview Cracker Backend API"
APP_VERSION = "1.0.0"

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

# API Prefixes
USER_API_PREFIX = "/api/user"
CODING_API_PREFIX = "/api/coding"
INTERVIEW_API_PREFIX = "/api/interview"
PERFORMANCE_API_PREFIX = "/api/performance"
THREAD_API_PREFIX = "/api/thread"
HEALTH_API_PREFIX = "/api/health"

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
