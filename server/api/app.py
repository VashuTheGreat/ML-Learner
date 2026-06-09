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
from api.routes.modelTrainConfig_router import router as ModelTrainConfigRouter
from api.routes.faceFind_routes import router as FaceDetetorRouter
from api.routes.jobFetcher_router import router as JobFetcherRouter
from api.routes.FormFiller_router import router as FormFillerRouter
from api.routes.similarJobPredictor_router import router as SimilarJobPredictorRouter
from api.routes.jobmodelDownloader_router import router as JobModelDownloaderRouter
from api.routes.templates_routes import router as TemplateRouter
from api.routes.interview_routes import router as InterviewRouter

from src.graphs.interview_graph_builder import close_checkpointer
from api.database import Base, engine

# Create database tables
Base.metadata.create_all(bind=engine)

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
    allow_origins=["*", "https://www.mlearner.tech", "www.mlearner.tech"], 
    allow_credentials=False,
    allow_methods=["*"], 
    allow_headers=["*"],
)


app.include_router(CommonRouter,prefix="")
app.include_router(UserRouter, prefix="/api/v1/user")
app.include_router(TemplateRouter, prefix="/api/v1/template")
app.include_router(QuestionRouter, prefix="/api/v1/question")
app.include_router(CodingRouter, prefix="/api/v1/coding")
app.include_router(InterviewRouter, prefix="/api/v1/interview")
app.include_router(ModelTrainRouter, prefix="/api/v1/modelTraining")
app.include_router(ModelTrainConfigRouter, prefix="/api/v1/modelTrainingConfig")
app.include_router(FaceDetetorRouter, prefix="/api/v1/face")
app.include_router(JobFetcherRouter, prefix="/api/v1/jobFetcher")
app.include_router(FormFillerRouter, prefix="/api/v1/form")
app.include_router(SimilarJobPredictorRouter, prefix="/api/v1/similarJobPredictor")
app.include_router(JobModelDownloaderRouter, prefix="/api/v1/download_model")

@app.get("/")
async def root():
    return {"message": "Welcome to Interview Cracker API"}
