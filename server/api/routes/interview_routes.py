import sys
import json
import asyncio
import logging
import fastapi
from typing import List
from fastapi import Query, Depends, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.orm import Session

from src.pipelines.DummyInterviews_pipeline import DummyInterviewsPipeline
from src.graphs.interview_graph_builder import chat_interviewer_stream, deleteThread
from src.constants import DEFAULT_INTERVIEW_FIELDS, DEFAULT_COMPANIES
from api.middlewares.verifyuser_middleware import verify_jwt
from api.models.interview_models import ChatInterviewBody
from api.database import Interview, get_db
from exception import MyException

router = fastapi.APIRouter()

# @router.post("/generate_interview_schemas")
# async def generate_interview_schemas(
#     no_of_interviews: int = 3,
#     updated: bool = False,
#     fields: List[str] = Query(default=DEFAULT_INTERVIEW_FIELDS),
#     companiesName: List[str] = Query(default=DEFAULT_COMPANIES)
# ):
#     logging.info("Entering generate_interview_schemas route (async)")
#     try:
#         pipeline = DummyInterviewsPipeline(
#             no_of_interviews=no_of_interviews, 
#             updated=updated, 
#             fields=fields, 
#             companiesName=companiesName
#         )
#         return await pipeline.initiate()
#     except Exception as e:
#         raise MyException(e, sys)





# ============================== Chat and Interview ============================
@router.post("/stream_chat", dependencies=[Depends(verify_jwt)])
async def chat_interviewer_stream_route(
    request: Request,
    body: ChatInterviewBody,
    db: Session = Depends(get_db)
):
    logging.info(f"Entering chat/stream route for thread_id: {body.thread_id}")
    user_id = request.state.user.id

    async def event_generator():
        performance_payload = None
        try:
            logging.info(f"SSE stream started for thread_id: {body.thread_id}, topic='{body.topic}'")
            async for event in chat_interviewer_stream(
                thread_id=body.thread_id,
                time_remain=body.time_remain,
                topic=body.topic,
                user_input=body.user_input
            ):
                logging.debug(f"SSE event type='{event['type']}' for thread_id: {body.thread_id}")
                yield f"data: {json.dumps(event)}\n\n"
                await asyncio.sleep(0)

                if event.get("type") == "performance":
                    performance_payload = event["content"]

            if performance_payload is not None:
                logging.info(f"Interview complete for thread_id: {body.thread_id}, saving to DB")
                new_interview = Interview(
                    user_id=user_id,
                    topic=body.topic,
                    companyName=body.companyName,
                    performance=performance_payload,
                )
                db.add(new_interview)
                db.commit()
                db.refresh(new_interview)
                logging.info(f"Interview saved — id={new_interview.id} for user_id={user_id}")

                await deleteThread(thread_id=body.thread_id)
                logging.info(f"Thread {body.thread_id} deleted after interview completion")

            logging.info(f"SSE stream complete for thread_id: {body.thread_id}")
        except Exception as e:
            logging.error(f"SSE stream error for thread_id: {body.thread_id}: {e}")
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")




# =============================== Get Interview ==================================
@router.get("/interviews", dependencies=[Depends(verify_jwt)])
async def get_user_interviews(
    request: Request,
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    user_id = request.state.user.id
    
    interviews = db.query(Interview)\
        .filter(Interview.user_id == user_id)\
        .order_by(Interview.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    

    data=[
        {
            "id": interview.id,
            "topic": interview.topic,
            "companyName": interview.companyName,
            "performance": interview.performance,
            "createdAt": interview.created_at.isoformat() if interview.created_at else None
        }
        for interview in interviews
    ]
    return JSONResponse(status_code=200,content={
        "message":"Interviews fetched successfully",
        "data":data
    })


# ====================== Get Interview ========================================
@router.get("/interviews/{interview_id}", dependencies=[Depends(verify_jwt)])
async def get_interview_detail(
    request: Request,
    interview_id: int,
    db: Session = Depends(get_db)
):
    user_id = request.state.user.id
    
    interview = db.query(Interview).filter(Interview.id == interview_id, Interview.user_id == user_id).first()
    
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    data={
        "id": interview.id,
        "topic": interview.topic,
        "companyName": interview.companyName,
        "performance": interview.performance,
        "createdAt": interview.created_at.isoformat() if interview.created_at else None
    }
    return JSONResponse(status_code=200,content={
        "message":"Interview fetched successfully",
        "data":data
    })
