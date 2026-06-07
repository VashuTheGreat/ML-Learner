from fastapi import APIRouter, Depends, HTTPException, Request, Query
from sqlalchemy.orm import Session
from api.database import Interview, get_db
from api.utils.api_response import ApiResponse
from api.utils.api_error import ApiError
from api.middlewares.verifyuser_middleware import verify_jwt
from typing import Optional
import logging
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/sheduleInterview")
async def schedule_interview(request: Request, db: Session = Depends(get_db), user=Depends(verify_jwt)):
    body = await request.json()
    companyName = body.get("companyName")
    topic = body.get("topic")
    job_Role = body.get("job_Role")
    time_str = body.get("time")
    status = body.get("status")

    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise ApiError(400, "user required")

    logger.info(f"Scheduling interview for user {user_id} at {companyName}")

    if not all([companyName, topic, job_Role, time_str, status]):
        raise ApiError(400, "All fields are required")

    time = datetime.fromisoformat(time_str.replace(" ", "T"))

    interview = db.query(Interview).filter(
        Interview.user_id == user_id,
        Interview.companyName == companyName,
        Interview.topic == topic,
        Interview.job_Role == job_Role,
        Interview.time == time
    ).first()

    if interview:
        logger.info("Interview already exists")
        return ApiResponse(200, interview, "Interview already exists")

    new_interview = Interview(
        user_id=user_id,
        companyName=companyName,
        topic=topic,
        job_Role=job_Role,
        time=time,
        status=status
    )
    db.add(new_interview)
    db.commit()
    db.refresh(new_interview)

    logger.info(f"Interview created successfully: {new_interview.id}")
    return ApiResponse(201, new_interview, "Interview created successfully")

@router.put("/updateInterviewStatus")
async def update_interview_status(request: Request, db: Session = Depends(get_db), user=Depends(verify_jwt)):
    body = await request.json()
    id = body.get("id")
    status = body.get("status")

    logger.info(f"Updating interview {id} status to {status}")

    if not id or not status:
        raise ApiError(400, "All fields are required")

    interview = db.query(Interview).filter(Interview.id == id).first()
    if not interview:
        raise ApiError(404, "Interview not found")

    interview.status = status
    db.commit()
    db.refresh(interview)

    return ApiResponse(200, interview, "Interview updated successfully")

@router.get("/fetch_interviews")
async def fetch_interviews(request: Request, db: Session = Depends(get_db), user=Depends(verify_jwt)):
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise ApiError(400, "user required")

    logger.info(f"Fetching interviews for user: {user_id}")

    interviews = db.query(Interview).filter(Interview.user_id == user_id).all()
    if interviews is None:
        raise ApiError(404, "Interviews not found")

    return ApiResponse(200, interviews, "Interview fetched successfully")

@router.get("/getInterviewById")
async def get_interview_by_id(id: int = Query(...), db: Session = Depends(get_db), user=Depends(verify_jwt)):
    logger.info(f"Fetching interview by id: {id}")

    if not id:
        raise ApiError(400, "All fields are required")

    interview = db.query(Interview).filter(Interview.id == id).first()
    if not interview:
        raise ApiError(404, "Interview not found")

    return ApiResponse(200, interview, "Interview fetched successfully")

@router.delete("/deleteInterview/{id}")
async def delete_interview(id: int, request: Request, db: Session = Depends(get_db), user=Depends(verify_jwt)):
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise ApiError(400, "user required")

    logger.info(f"Deleting interview {id} for user {user_id}")

    interview = db.query(Interview).filter(Interview.id == id, Interview.user_id == user_id).first()
    if not interview:
        raise ApiError(404, "Interview not found or unauthorized")

    db.delete(interview)
    db.commit()

    return ApiResponse(200, None, "Interview deleted successfully")
