from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from api.Agents.routes.user_router import router as UserRouter
from api.CodeRunAndModelTrain.routes.coding_router import router as CodingRouter
from api.routes.interview_router import router as InterviewRouter
from api.routes.performance_router import router as PerformanceRouter
from api.routes.thread_router import router as DeleteThreadRouter
from api.routes.health_router import router as HealthRouter
from graphs.interview_graph_builder import close_checkpointer
from api.routes.modelTraining_router import router as ModelTrainRouter
from api.routes.modelTrainConfig_router import router as ModelTrainConfigRouter
from api.routes.faceFind_routes import router as FaceDetetorRouter
from api.middlewares.form_to_json import FormToJSONMiddleware
from api.routes.jobFetcher_router import router as JobFetcherRouter
from api.routes.FormFiller_router import router as FormFillerRouter
from api.routes.similarJobPredictor_router import router as SimilarJobPredictorRouter
from api.routes.jobmodelDownloader_router import router as JobModelDownloaderRouter
from fastapi.exceptions import RequestValidationoError



models.Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic can go here if needed
    yield
    # Shutdown logic
    await close_checkpointer()


@app.exception_handler(RequestValidationEror)
async def validation_exception_handler(request,exe):

    errors={}

    for err in exe.errors():
        print(f"The error is:{error}")

        errors[err['loc'][-1]]=err['msg']  
    return JSONResponse(
        status_code=422,
        content={"message":"Validation Error","errors":errors}
    )



app = FastAPI(
    title="Interview Cracker API",
    description="API for Interview Cracker",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*","https://www.mlearner.tech","www.mlearner.tech"], 
    allow_credentials=False,
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
app.include_router(FormFillerRouter,prefix="/api/form")
app.include_router(SimilarJobPredictorRouter,prefix="/api/similarJobPredictor")
app.include_router(JobModelDownloaderRouter,prefix="/api/download_model")

@app.get("/")
async def root():
    return {"message": "Welcome to Interview Cracker API"}
