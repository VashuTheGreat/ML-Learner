from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from api.database import Coding, get_db
from api.middlewares.verifyuser_middleware import verify_jwt
from typing import Optional
import logging
from src.pipelines.CodeRunPipeline import CodeRunPipeline
from src.models.code_run_models import Submission

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/createCodingSchema")
async def create_coding_schema(request: Request, db: Session = Depends(get_db), user=Depends(verify_jwt)):
    logger.info("Entered in the create coding schema")
    
    # In Node.js, user is attached to req.user by verifyJWT
    # For now, let's assume user object is returned by verify_jwt or we mock it
    # Since verify_jwt returns True, we might need a real implementation later.
    # For now, let's use a dummy user_id if verify_jwt doesn't provide it.
    user_id = getattr(request.state, "user_id", None) 
    if not user_id:
        raise ApiError(400, "User not found")

    coding = db.query(Coding).filter(Coding.user_id == user_id).first()

    if coding:
        return ApiResponse(200, coding, "user already have coding schema")

    coding = Coding(user_id=user_id)
    db.add(coding)
    db.commit()
    db.refresh(coding)

    if not coding:
        raise ApiError(500, "Error while initialising coding")

    logger.info("Exited from the create coding schema")
    return ApiResponse(200, coding, "coding schema created")

@router.get("/getCodingSchema")
async def get_coding_schema(request: Request, db: Session = Depends(get_db), user=Depends(verify_jwt)):
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise ApiError(400, "User not found")

    coding = db.query(Coding).filter(Coding.user_id == user_id).first()

    if not coding:
        new_coding = Coding(user_id=user_id)
        db.add(new_coding)
        db.commit()
        db.refresh(new_coding)
        return ApiResponse(200, [new_coding], "coding schema created automatically")

    return ApiResponse(200, [coding], "coding schema fetched")

@router.post("/updateCodingSchema")
async def update_coding_schema(request: Request, db: Session = Depends(get_db), user=Depends(verify_jwt)):
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise ApiError(400, "User not found")

    body = await request.json()
    recently_solved = body.get("recently_solved")
    recently_visited = body.get("recently_visited")
    all_questions_solved = body.get("all_questions_solved")
    easy = body.get("easy")
    medium = body.get("medium")
    hard = body.get("hard")

    coding = db.query(Coding).filter(Coding.user_id == user_id).first()
    if not coding:
        raise ApiError(500, "Error while updating coding")

    if recently_solved is not None: coding.recently_solved = recently_solved
    if recently_visited is not None: coding.recently_visited = recently_visited
    if all_questions_solved is not None: coding.all_questions_solved = all_questions_solved
    if easy is not None: coding.easy = easy
    if medium is not None: coding.medium = medium
    if hard is not None: coding.hard = hard

    db.commit()
    db.refresh(coding)

    return ApiResponse(200, coding, "data updated successfully")





# =========================== Run Code =========================================

@router.post("/submit")
async def submit_code(sub: Submission):
    logging.info("Entering submit route (async)")
    pipeline = CodeRunPipeline()
    result = await pipeline.initiate(sub)
    logging.info("Code execution completed")
    return {"data": result}
