from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from api.Agents.routes.user_router import router as UserRouter
from api.CodeRunAndModelTrain.routes.coding_router import router as CodingRouter
from api.Agents.routes.interview_router import router as InterviewRouter
from api.Agents.routes.performance_router import router as PerformanceRouter
from api.Agents.routes.thread_router import router as DeleteThreadRouter
from api.Agents.routes.health_router import router as HealthRouter
from src.Agents.graphs.interview_graph_builder import close_checkpointer
from api.CodeRunAndModelTrain.routes.modelTraining_router import router as ModelTrainRouter
from api.CodeRunAndModelTrain.routes.modelTrainConfig_router import router as ModelTrainConfigRouter
from api.Predictors.routes.faceFind_routes import router as FaceDetetorRouter
from api.middlewares.form_to_json import FormToJSONMiddleware
from api.CodeRunAndModelTrain.routes.jobFetcher_router import router as JobFetcherRouter

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic can go here if needed
    yield
    # Shutdown logic
    await close_checkpointer()

app = FastAPI(
    title="Interview Cracker API",
    description="API for Interview Cracker",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

# app.add_middleware(FormToJSONMiddleware)

app.include_router(UserRouter, prefix="/api/user")
app.include_router(CodingRouter, prefix="/api/coding")
app.include_router(InterviewRouter, prefix="/api/interview")
app.include_router(PerformanceRouter, prefix="/api/performance")
app.include_router(DeleteThreadRouter, prefix="/api/thread")
app.include_router(HealthRouter, prefix="/api/health")
app.include_router(ModelTrainRouter, prefix="/api/modelTraining")
app.include_router(ModelTrainConfigRouter, prefix="/api/modelTrainingConfig")

app.include_router(FaceDetetorRouter,prefix="/api/face")
app.include_router(JobFetcherRouter,prefix="/api/jobFetcher")

@app.get("/")
async def root():
    return {"message": "Welcome to Interview Cracker API"}
