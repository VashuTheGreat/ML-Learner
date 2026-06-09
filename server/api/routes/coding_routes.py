from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from api.database import Coding, get_db
from api.middlewares.verifyuser_middleware import verify_jwt
from api.models.coding_models import UpdateCodingSchema
from src.pipelines.CodeRunPipeline import CodeRunPipeline
from src.models.code_run_models import Submission
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

@router.post("/submit")
async def submit_code(sub: Submission):
    logging.info("Entering submit route (async)")
    pipeline = CodeRunPipeline()
    result = await pipeline.initiate(sub)
    logging.info("Code execution completed")
    return JSONResponse(
        status_code=200,
        content={"success": True, "message": "Code executed successfully", "data": jsonable_encoder(result)}
    )

