from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager

from api.routes.user_router import router as UserRouter
from api.routes.coding_routes import router as CodingRouter
from api.routes.question_routes import router as QuestionRouter
from api.routes.common_routes import router as CommonRouter
from api.routes.modelTraining_router import router as ModelTrainRouter
from api.routes.faceFind_routes import router as FaceDetetorRouter
from api.routes.job_routes import router as JobFetcherRouter
from api.routes.templates_routes import router as TemplateRouter
from api.routes.interview_routes import router as InterviewRouter
from api.routes.stream_routes import router as StreamRouter

from src.graphs.interview_graph_builder import close_checkpointer
from db import Base, engine


# Create database tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic can go here if needed
    yield
    # Shutdown logic
    await close_checkpointer()

tags_metadata = [
    {
        "name": "Authentication & Users",
        "description": "User registry, logins, HTTP-only secure cookie session handlers, profile updates, and Cloudinary avatar asset management.",
    },
    {
        "name": "Resume & Coding Templates",
        "description": "Endpoints to upload PDF resumes, parse templates via langchain pipelines, and save user IDE workspace configs.",
    },
    {
        "name": "Coding Problems",
        "description": "Database queries for LeetCode-style questions and evaluation execution engines to run code in secure environments.",
    },
    {
        "name": "Interview Practice",
        "description": "Server-Sent Events (SSE) mock interview conversation streams connected to LangGraph chat agents and evaluation persistency.",
    },
    {
        "name": "Model Training",
        "description": "Machine learning pipelines mapping custom datasets and scikit-learn training settings.",
    },
    {
        "name": "Jobs Board",
        "description": "Web scrapers searching recent opportunities matching ML search keywords and ATS Resume similarity scorers.",
    },
    {
        "name": "Face Detection",
        "description": "WebSocket handlers accepting binary camera frames to run computer vision face tracking workflows.",
    },
    {
        "name": "System & Utilities",
        "description": "General system configuration metrics, health indicators, and database seeding functions.",
    }
]

app = FastAPI(
    title="ML Learner / Interview Cracker Core API",
    description=(
        "**Welcome to the ML Learner API docs!**\n\n"
        "This is the comprehensive backend documentation designed for frontend developers. "
        "Here you can try out live endpoints, inspect Pydantic query models, read request schemas, "
        "and configure authentication tokens.\n\n"
        "### Key Features:\n"
        "- **Mock Interview Streams**: Live SSE chat loops mimicking technical interviews.\n"
        "- **Code Execution Sandbox**: Run and submit Python code for evaluation.\n"
        "- **ML Pipeline Engine**: Trigger classification & regression model training configurations dynamically.\n"
        "- **ATS Scoring & Job Board**: Match parsed resumes against job descriptions."
    ),
    version="1.0.0",
    contact={
        "name": "Developer Support Team",
        "url": "https://www.mlearner.tech",
        "email": "support@mlearner.tech",
    },
    openapi_tags=tags_metadata,
    lifespan=lifespan
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    errors = {}
    for err in exc.errors():
        # Using the last part of the location as the field name
        field = err['loc'][-1] if err['loc'] else 'unknown'
        errors[field] = err['msg']
    
    return JSONResponse(
        status_code=422,
        content={"message": "Validation Error", "errors": errors}
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:8081", "http://localhost:5174", "https://www.mlearner.tech", "www.mlearner.tech"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(CommonRouter,prefix="")
app.include_router(CommonRouter,prefix="/api/v1")
app.include_router(UserRouter, prefix="/api/v1/user")
app.include_router(TemplateRouter, prefix="/api/v1/template")
app.include_router(QuestionRouter, prefix="/api/v1/question")
app.include_router(CodingRouter, prefix="/api/v1/coding")
app.include_router(InterviewRouter, prefix="/api/v1/interview")
app.include_router(ModelTrainRouter, prefix="/api/v1/modelTraining")
app.include_router(FaceDetetorRouter, prefix="/api/v1/face")
app.include_router(JobFetcherRouter, prefix="/api/v1/job")
app.include_router(StreamRouter, prefix="/api/v1/stream")

@app.get("/")
async def root():
    return {"message": "Welcome to Interview Cracker API"}

