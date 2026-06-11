from sqlalchemy.engine import result
from transformers.models.canine.tokenization_canine import BOS
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from db import Coding, get_db
from api.middlewares.verifyuser_middleware import verify_jwt
from api.models.coding_models import UpdateCodingSchema
from api.models.coding_models import RunCode
from db import Question

from api.helper import code_runner
import subprocess
import json
import logging

router = APIRouter(
    tags=["Coding Problems"],
    responses={
        401: {
            "description": "Unauthorized access token or expired session.",
            "content": {"application/json": {"example": {"success": False, "message": "Unauthorized request", "data": None}}}
        }
    }
)

@router.get(
    "/fetch", 
    dependencies=[Depends(verify_jwt)],
    summary="Fetch coding progress schema",
    description="Retrieves the authenticated user's coding metrics, statistics (easy, medium, hard counts), and lists of recently solved or visited question IDs. Automatically initializes a record if none exists.",
    responses={
        200: {
            "description": "Coding progress statistics fetched successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "coding schema fetched",
                        "data": [{
                            "id": 1,
                            "user_id": 10,
                            "easy": 5,
                            "medium": 2,
                            "hard": 0,
                            "recently_solved": [101, 102],
                            "recently_visited": [101, 102, 103],
                            "all_questions_solved": [101, 102]
                        }]
                    }
                }
            }
        }
    }
)
async def get_coding_schema(request: Request, db: Session = Depends(get_db)):
    """
    Get the authenticated user's coding progress database schema.
    """
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

    # Auto-heal: de-duplicate array fields and recalculate difficulty counts
    modified = False
    
    if coding.recently_solved:
        seen = set()
        deduped = [x for x in coding.recently_solved if not (x in seen or seen.add(x))]
        if len(deduped) != len(coding.recently_solved):
            coding.recently_solved = deduped
            modified = True
            
    if coding.recently_visited:
        seen = set()
        deduped = [x for x in coding.recently_visited if not (x in seen or seen.add(x))][:5]
        if len(deduped) != len(coding.recently_visited) or len(coding.recently_visited) > 5:
            coding.recently_visited = deduped
            modified = True
            
    if coding.all_questions_solved:
        seen = set()
        deduped = [x for x in coding.all_questions_solved if not (x in seen or seen.add(x))]
        if len(deduped) != len(coding.all_questions_solved):
            coding.all_questions_solved = deduped
            modified = True

    # Recalculate easy, medium, hard counts based on actual solved questions
    solved_ids = coding.all_questions_solved or []
    if solved_ids:
        solved_questions = db.query(Question).filter(Question.id.in_(solved_ids)).all()
        easy_count = sum(1 for q in solved_questions if q.difficulty == "easy")
        medium_count = sum(1 for q in solved_questions if q.difficulty == "medium")
        hard_count = sum(1 for q in solved_questions if q.difficulty == "hard")
    else:
        easy_count = 0
        medium_count = 0
        hard_count = 0

    if coding.easy != easy_count or coding.medium != medium_count or coding.hard != hard_count:
        coding.easy = easy_count
        coding.medium = medium_count
        coding.hard = hard_count
        modified = True

    if modified:
        db.commit()
        db.refresh(coding)

    return JSONResponse(
        status_code=200,
        content={"success": True, "message": "coding schema fetched", "data": [jsonable_encoder(coding)]}
    )

@router.put(
    "/update", 
    dependencies=[Depends(verify_jwt)],
    summary="Update coding progress schema",
    description="Updates the user's solved question history counters (easy, medium, hard counts) or recently solved lists manually.",
    responses={
        200: {
            "description": "Coding statistics updated successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "data updated successfully",
                        "data": {
                            "id": 1,
                            "user_id": 10,
                            "easy": 6,
                            "medium": 2,
                            "hard": 0
                        }
                    }
                }
            }
        }
    }
)
async def update_coding_schema(request: Request, body: UpdateCodingSchema, db: Session = Depends(get_db)):
    """
    Updates the fields of the user's coding record.
    """
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

    if body.recently_solved is not None:
        seen = set()
        coding.recently_solved = [x for x in body.recently_solved if not (x in seen or seen.add(x))]
    if body.recently_visited is not None:
        seen = set()
        coding.recently_visited = [x for x in body.recently_visited if not (x in seen or seen.add(x))][:5]
    if body.all_questions_solved is not None:
        seen = set()
        coding.all_questions_solved = [x for x in body.all_questions_solved if not (x in seen or seen.add(x))]
        
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
@router.post(
    "/run_code", 
    dependencies=[Depends(verify_jwt)],
    summary="Run code against sample test cases",
    description="Compiles and executes the user's code inside a python execution sandbox. Evaluates it against all sample test cases configured for the given question ID. Does not save coding progress in database.",
    responses={
        200: {
            "description": "Code completed execution. Returns count of passed test cases and test details.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Executed",
                        "data": {
                            "status": "passed",
                            "passed": 3,
                            "total": 3,
                            "results": [{"input": [1, 2], "expected": 3, "actual": 3, "passed": True}]
                        }
                    }
                }
            }
        },
        400: {
            "description": "Syntax or Runtime Error in user-submitted code.",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "message": "Runtime Error",
                        "data": {
                            "stderr": "NameError: name 'x' is not defined",
                            "stdout": ""
                        }
                    }
                }
            }
        },
        408: {
            "description": "Code took too long to run (Execution timeout).",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "message": "Time Limit Exceeded",
                        "data": None
                    }
                }
            }
        }
    }
)
async def run_code(
    body: RunCode,
    db: Session = Depends(get_db)
):
    """
    Executes user's python code on test cases without persisting progress.
    """
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
@router.post(
    "/submit_code", 
    dependencies=[Depends(verify_jwt)],
    summary="Submit final coding solution",
    description="Runs the user's code against all test cases. If all test cases pass, the question ID is marked as solved, and the user's counts (easy, medium, hard) are incremented in the database accordingly.",
    responses={
        200: {
            "description": "Code evaluated. If fully passed, progress is updated in DB.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Executed",
                        "data": {
                            "status": "passed",
                            "passed": 5,
                            "total": 5,
                            "results": [{"input": [1, 2], "expected": 3, "actual": 3, "passed": True}]
                        }
                    }
                }
            }
        },
        400: {
            "description": "Syntax or Runtime Error in user-submitted code.",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "message": "Runtime Error",
                        "data": {
                            "stderr": "ZeroDivisionError: division by zero",
                            "stdout": ""
                        }
                    }
                }
            }
        },
        408: {
            "description": "Execution timeout.",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "message": "Time Limit Exceeded",
                        "data": None
                    }
                }
            }
        }
    }
)
async def submit_code(
    request: Request,
    body: RunCode,
    db: Session = Depends(get_db)
):
    """
    Submits and evaluates code, committing question solve status to the database.
    """
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

