from sqlalchemy.engine import result
from transformers.models.canine.tokenization_canine import BOS
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from api.database import Coding, get_db
from api.middlewares.verifyuser_middleware import verify_jwt
from api.models.coding_models import UpdateCodingSchema
from src.pipelines.CodeRunPipeline import CodeRunPipeline
from api.models.coding_models import RunCode
from api.database import Question
from api.helper import code_runner
import subprocess
import json
import logging

router = APIRouter(tags=["Coding"])

@router.get("/fetch", dependencies=[Depends(verify_jwt)])
async def get_coding_schema(request: Request, db: Session = Depends(get_db)):
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(status_code=401, detail={"success": False, "message": "Unauthorized", "data": None})
    user_id = user.id

    coding = db.query(Coding).filter(Coding.user_id == user_id).first()

    if not coding:
        new_coding = Coding(user_id=user_id)
        db.add(new_coding)
        db.commit()
        db.refresh(new_coding)
        return JSONResponse(
            status_code=200,
            content={"success": True, "message": "coding schema created automatically", "data": [jsonable_encoder(new_coding)]}
        )

    return JSONResponse(
        status_code=200,
        content={"success": True, "message": "coding schema fetched", "data": [jsonable_encoder(coding)]}
    )

@router.put("/update", dependencies=[Depends(verify_jwt)])
async def update_coding_schema(request: Request, body: UpdateCodingSchema, db: Session = Depends(get_db)):
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(status_code=401, detail={"success": False, "message": "Unauthorized", "data": None})
    user_id = user.id

    coding = db.query(Coding).filter(Coding.user_id == user_id).first()
    if not coding:
        logging.info(f"Coding schema not found for user {user_id}, creating a new one")
        coding = Coding(user_id=user_id)
        db.add(coding)
        db.commit()
        db.refresh(coding)

    if body.recently_solved is not None: coding.recently_solved = body.recently_solved
    if body.recently_visited is not None: coding.recently_visited = body.recently_visited
    if body.all_questions_solved is not None: coding.all_questions_solved = body.all_questions_solved
    if body.easy is not None: coding.easy = body.easy
    if body.medium is not None: coding.medium = body.medium
    if body.hard is not None: coding.hard = body.hard

    db.commit()
    db.refresh(coding)

    return JSONResponse(
        status_code=200,
        content={"success": True, "message": "data updated successfully", "data": jsonable_encoder(coding)}
    )




# =========================== Run Code =========================================
@router.post("/run_code", dependencies=[Depends(verify_jwt)])
async def run_code(
    body: RunCode,
    db: Session = Depends(get_db)
):
    try:
        status, passed, total, results = await code_runner(body, db)
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Executed",
                "data": {
                    "status": status,
                    "passed": passed,
                    "total": total,
                    "results": results
                }
            }
        )
    except subprocess.TimeoutExpired:
        return JSONResponse(
            status_code=408,
            content={
                "success": False,
                "message": "Time Limit Exceeded",
                "data": None
            }
        )
    except RuntimeError as e:
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "message": "Runtime Error",
                "data": {
                    "stderr": str(e),
                    "stdout": ""
                }
            }
        )
    except Exception as e:
        logging.exception("Run code error")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "Internal Server Error",
                "data": str(e)
            }
        )


# =========================== Submit Code =========================================
@router.post("/submit_code", dependencies=[Depends(verify_jwt)])
async def submit_code(
    request: Request,
    body: RunCode,
    db: Session = Depends(get_db)
):
    try:
        status, passed, total, results = await code_runner(body, db)

        if passed == total:
            user = getattr(request.state, "user", None)
            if not user:
                raise HTTPException(
                    status_code=401,
                    detail={"success": False, "message": "Unauthorized", "data": None}
                )
            user_id = user.id

            coding = (
                db.query(Coding)
                .filter(Coding.user_id == user_id)
                .first()
            )
            if coding:
                if body.question_id not in coding.all_questions_solved:
                    coding.all_questions_solved = coding.all_questions_solved + [body.question_id]
                    
                    # Also update recently solved questions list (keep unique, newest first)
                    if not coding.recently_solved:
                        coding.recently_solved = []
                    if body.question_id in coding.recently_solved:
                        coding.recently_solved.remove(body.question_id)
                    coding.recently_solved = [body.question_id] + coding.recently_solved

                    # Query difficulty
                    question = db.query(Question).filter(Question.id == body.question_id).first()
                    if question:
                        if question.difficulty == "easy":
                            coding.easy += 1
                        elif question.difficulty == "medium":
                            coding.medium += 1
                        elif question.difficulty == "hard":
                            coding.hard += 1
                    db.commit()

        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Executed",
                "data": {
                    "status": status,
                    "passed": passed,
                    "total": total,
                    "results": results
                }
            }
        )
    except subprocess.TimeoutExpired:
        return JSONResponse(
            status_code=408,
            content={
                "success": False,
                "message": "Time Limit Exceeded",
                "data": None
            }
        )
    except RuntimeError as e:
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "message": "Runtime Error",
                "data": {
                    "stderr": str(e),
                    "stdout": ""
                }
            }
        )
    except Exception as e:
        logging.exception("Submit code error")
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "Internal Server Error",
                "data": str(e)
            }
        )
