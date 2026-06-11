import sys
import json
import asyncio
import logging
import fastapi
from typing import List
from fastapi import Query, Path, Depends, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse
from sqlalchemy.orm import Session


from src.graphs.interview_graph_builder import chat_interviewer_stream, deleteThread
from src.constants import DEFAULT_INTERVIEW_FIELDS, DEFAULT_COMPANIES
from api.middlewares.verifyuser_middleware import verify_jwt
from api.models.interview_models import ChatInterviewBody

from db import Interview, get_db
from exception import MyException

router = fastapi.APIRouter(
    tags=["Interview Practice"],
    responses={
        401: {
            "description": "Unauthorized access token or expired session.",
            "content": {"application/json": {"example": {"success": False, "message": "Unauthorized request", "data": None}}}
        }
    }
)

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
@router.post(
    "/stream_chat", 
    dependencies=[Depends(verify_jwt)],
    summary="SSE chat with AI interviewer",
    description="Initiates or continues an interactive AI mock interview. Streams generated interview questions and evaluations as Server-Sent Events (SSE). Automatically saves performance reviews to the database once the interview completes.",
    response_class=StreamingResponse,
    responses={
        200: {
            "description": "Server-Sent Events connection successfully opened. Streams JSON event nodes.",
            "content": {
                "text/event-stream": {
                    "example": "data: {\"type\": \"chat\", \"content\": \"Hello, let's start the interview.\"}\n\ndata: {\"type\": \"performance\", \"content\": {\"score\": 85, \"feedback\": \"Good...\"}}"
                }
            }
        }
    }
)
async def chat_interviewer_stream_route(
    request: Request,
    body: ChatInterviewBody,
    db: Session = Depends(get_db)
):
    """
    Establish an SSE stream with the AI mock interviewer.
    """
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

                # Yield the database interview ID so the client can redirect to the correct ID
                yield f"data: {json.dumps({'type': 'interview_id', 'content': new_interview.id})}\n\n"

                await deleteThread(thread_id=body.thread_id)
                logging.info(f"Thread {body.thread_id} deleted after interview completion")

            logging.info(f"SSE stream complete for thread_id: {body.thread_id}")
        except Exception as e:
            logging.error(f"SSE stream error for thread_id: {body.thread_id}: {e}")
            yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")




# =============================== Get Interview ==================================
@router.get(
    "/interviews", 
    dependencies=[Depends(verify_jwt)],
    summary="Get user interviews list",
    description="Retrieves a paginated list of all past mock interview sessions completed by the authenticated user.",
    responses={
        200: {
            "description": "Interviews list successfully fetched.",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Interviews fetched successfully",
                        "data": [
                            {
                                "id": 1,
                                "topic": "Machine Learning",
                                "companyName": "Google",
                                "performance": {"score": 85},
                                "createdAt": "2026-06-11T12:00:00"
                            }
                        ]
                    }
                }
            }
        }
    }
)
async def get_user_interviews(
    request: Request,
    skip: int = Query(0, description="Number of items to skip for pagination."),
    limit: int = Query(10, description="Maximum number of items to return."),
    db: Session = Depends(get_db)
):
    """
    Fetch all mock interviews associated with the authenticated user profile.
    """
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
@router.get(
    "/interviews/{interview_id}", 
    dependencies=[Depends(verify_jwt)],
    summary="Get interview detail by ID",
    description="Retrieves the detailed performance assessment report and feedback of a single past interview using its unique ID.",
    responses={
        200: {
            "description": "Interview feedback retrieved successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Interview fetched successfully",
                        "data": {
                            "id": 1,
                            "topic": "Machine Learning",
                            "companyName": "Google",
                            "performance": {"score": 85, "strengths": ["Fast API coding"], "improvements": []},
                            "createdAt": "2026-06-11T12:00:00"
                        }
                    }
                }
            }
        },
        404: {
            "description": "Mock interview record not found or does not belong to the user.",
            "content": {"application/json": {"example": "Interview not found"}}
        }
    }
)

async def get_interview_detail(
    request: Request,
    interview_id: str = Path(..., description="Unique database identifier of the mock interview."),
    db: Session = Depends(get_db)
):
    """
    Fetch a single mock interview by its ID.
    """
    user_id = request.state.user.id
    
    try:
        int_id = int(interview_id)
        interview = db.query(Interview).filter(Interview.id == int_id, Interview.user_id == user_id).first()
    except ValueError:
        interview = None
    
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





