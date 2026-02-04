from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


from src.routes.user_routes import router as UserRouter

from src.routes.coding_routes import router as CodingRouter
from src.routes.interviewSchema_routes import router as InterviewRouter
from src.routes.performance_routes import router as PerformanceRouter
from src.routes.deleteThread_routes import router as DeleteThreadRouter
from src.routes.health_routes import router as HealthRouter

# from interview import AsyncSqliteSaver,aiosqlite
# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     global checkpointer
#     conn = await aiosqlite.connect("db.sqlite")
#     checkpointer = AsyncSqliteSaver(conn)
#     yield
#     await checkpointer.conn.close()
app = FastAPI(  title="Interview Cracker",
    description="Interview Cracker Backend API",
    version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)



app.include_router(UserRouter,prefix="/api/user")
app.include_router(CodingRouter,prefix="/api/coding")
app.include_router(InterviewRouter,prefix="/api/interview")
app.include_router(PerformanceRouter,prefix="/api/performance")
app.include_router(DeleteThreadRouter,prefix="/api/thread")
app.include_router(HealthRouter,prefix="/api/health")

@app.get("/")
async def root():
    return {"message": "Hello World"}



