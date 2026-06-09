import json
import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from api.database import get_db, Question

router = APIRouter()

@router.get("/health")
async def _health():
    logging.info("Health check requested")
    return {"status": "ok", "message": "Agents API is healthy"}


@router.get("/fit_questions")
async def _fit_questions(db: Session = Depends(get_db)):
    logging.info("Inserting questions in the database")
    try:
        with open("problems.json", "r") as f:
            data = json.load(f)
    except FileNotFoundError:
        logging.error("problems.json not found")
        return {"status": "error", "message": "problems.json not found"}
    except json.JSONDecodeError:
        logging.error("Failed to decode JSON from problems.json")
        return {"status": "error", "message": "Failed to decode JSON"}

    inserted_count = 0
    for q in data:
        existing = db.query(Question).filter(Question.id == q.get("id")).first()
        if existing:
            continue
        new_question = Question(
            id=q.get("id"),
            title=q.get("title"),
            difficulty=q.get("difficulty"),
            category=q.get("category"),
            problem_description=q.get("problem_description"),
            starter_code=q.get("starter_code"),
            example_input=q.get("example_input"),
            example_output=q.get("example_output"),
            example_reasoning=q.get("example_reasoning"),
            learn_content=q.get("learn_content"),
            solution_code=q.get("solution_code"),
            test_cases=q.get("test_cases"),
            function_name=q.get("function_name"),
        )
        db.add(new_question)
        inserted_count += 1

    if inserted_count > 0:
        db.commit()

    return {"status": "ok", "message": f"Questions inserted: {inserted_count}"}