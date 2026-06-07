from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from api.database import Performance, Interview, get_db
from api.utils.api_response import ApiResponse
from api.utils.api_error import ApiError
from api.middlewares.verifyuser_middleware import verify_jwt
from typing import Optional
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/create")
async def create_performance(request: Request, db: Session = Depends(get_db), user=Depends(verify_jwt)):
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise ApiError(400, "user required")

    body = await request.json()
    interview_id = body.get("interview_id")
    overallScore = body.get("overallScore")
    verdict = body.get("verdict")
    summaryFeedback = body.get("summaryFeedback")
    skills = body.get("skills")
    strengths = body.get("strengths")
    weaknesses = body.get("weaknesses")
    practiceRecommendations = body.get("practiceRecommendations")
    studyRecommendations = body.get("studyRecommendations")
    lowPriorityOrAvoid = body.get("lowPriorityOrAvoid")
    confidenceLevel = body.get("confidenceLevel")

    if not all([interview_id, overallScore is not None, verdict, summaryFeedback]):
        raise ApiError(400, "Required fields are missing")

    logger.info(f"Creating performance for interview: {interview_id}")

    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise ApiError(404, "Interview not found")

    existing_performance = db.query(Performance).filter(Performance.interview_id == interview_id).first()
    if existing_performance:
        logger.info(f"Performance already exists for interview: {interview_id}")
        return ApiResponse(200, existing_performance, "Performance already exists")

    performance = Performance(
        interview_id=interview_id,
        user_id=user_id,
        overallScore=overallScore,
        verdict=verdict,
        summaryFeedback=summaryFeedback,
        skills=skills,
        strengths=strengths,
        weaknesses=weaknesses,
        practiceRecommendations=practiceRecommendations,
        studyRecommendations=studyRecommendations,
        lowPriorityOrAvoid=lowPriorityOrAvoid,
        confidenceLevel=confidenceLevel
    )
    db.add(performance)
    db.commit()
    db.refresh(performance)

    if not performance:
        raise ApiError(500, "Failed to create performance")

    logger.info(f"Performance created successfully: {performance.id}")
    return ApiResponse(201, performance, "Performance created successfully")

@router.post("/fetchPerformance")
async def fetch_performance(request: Request, db: Session = Depends(get_db), user=Depends(verify_jwt)):
    body = await request.json()
    interview_id = body.get("interview_id")

    if not interview_id:
        raise ApiError(400, "Required fields are missing")

    logger.info(f"Fetching performance for interview: {interview_id}")

    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise ApiError(404, "Interview not found")

    existing_performance = db.query(Performance).filter(Performance.interview_id == interview_id).first()
    if not existing_performance:
        raise ApiError(404, "interview performance not found")

    return ApiResponse(200, existing_performance, "Performance fetched")
