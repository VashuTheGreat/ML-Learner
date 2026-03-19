from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .constants import (
    APP_TITLE, APP_DESCRIPTION, APP_VERSION,
    USER_API_PREFIX, CODING_API_PREFIX, INTERVIEW_API_PREFIX,
    PERFORMANCE_API_PREFIX, THREAD_API_PREFIX, HEALTH_API_PREFIX,
    MODEL_TRAIN_API_PREFIX
)

from .routes.user_router import router as UserRouter
from .routes.coding_router import router as CodingRouter
from .routes.interviewSchema_router import router as InterviewRouter
from .routes.performance_router import router as PerformanceRouter
from .routes.deleteThread_router import router as DeleteThreadRouter
from .routes.health_router import router as HealthRouter
from .components.interview import close_checkpointer
from .routes.modelTraining_router import router as ModelTrainRouter
from .routes.ModelTrainConfig_router import router as ModelTrainConfigRouter

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic can go here if needed
    yield
    # Shutdown logic
    await close_checkpointer()

app = FastAPI(
    title=APP_TITLE,
    description=APP_DESCRIPTION,
    version=APP_VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000", "http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

app.include_router(UserRouter, prefix=USER_API_PREFIX)
app.include_router(CodingRouter, prefix=CODING_API_PREFIX)
app.include_router(InterviewRouter, prefix=INTERVIEW_API_PREFIX)
app.include_router(PerformanceRouter, prefix=PERFORMANCE_API_PREFIX)
app.include_router(DeleteThreadRouter, prefix=THREAD_API_PREFIX)
app.include_router(HealthRouter, prefix=HEALTH_API_PREFIX)
app.include_router(ModelTrainRouter, prefix=MODEL_TRAIN_API_PREFIX)
app.include_router(ModelTrainConfigRouter, prefix=MODEL_TRAIN_API_PREFIX)

@app.get("/")
async def root():
    return {"message": "Welcome to Interview Cracker API"}
