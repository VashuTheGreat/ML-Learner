import json
import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db import get_db, Question

router = APIRouter(tags=["System & Utilities"])

@router.get(
    "/health",
    summary="Health check endpoint",
    description="Returns the operational status of the server and API services. Useful for deployment probes.",
    responses={
        200: {
            "description": "API is online and functioning properly.",
            "content": {
                "application/json": {
                    "example": {"status": "ok", "message": "Agents API is healthy"}
                }
            }
        }
    }
)
async def _health():
    """
    Returns the current health status of the API application.
    """
    logging.info("Health check requested")
    return {"status": "ok", "message": "Agents API is healthy"}


@router.get(
    "/fit_questions",
    summary="Seed/fit coding problems",
    description="Parses the `problems.json` file in the project root and populates the database with default coding questions if they do not exist.",
    responses={
        200: {
            "description": "Db seeding finished successfully.",
            "content": {
                "application/json": {
                    "example": {"status": "ok", "message": "Questions inserted: 5"}
                }
            }
        }
    }
)
async def _fit_questions(db: Session = Depends(get_db)):
    """
    Reads `problems.json` and inserts any missing coding questions into the database.
    """
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


@router.get(
    "/interview_options",
    summary="Get configuration options for scheduling interviews",
    description="Returns list of supported companies, positions, and interview durations for the scheduler."
)
async def get_interview_options():
    return {
        "status": "ok",
        "data": {
            "companies": ["Google", "Amazon", "Apple", "Microsoft", "Netflix", "Meta"],
            "positions": [
                "Frontend Developer",
                "Backend Developer",
                "Full Stack Developer",
                "Data Scientist",
                "Machine Learning Engineer",
                "AI Engineer"
            ],
            "durations": ["3 min", "5 min", "10 min"]
        }
    }


@router.get(
    "/multirag_options",
    summary="Get configuration options for Multi-RAG sessions",
    description="Returns session durations and descriptions for setting up Multi-RAG sessions."
)
async def get_multirag_options():
    return {
        "status": "ok",
        "data": {
            "options": [
                {"seconds": 300, "label": "5 Minutes", "desc": "Perfect for quick testing and small files", "icon": "⏱"},
                {"seconds": 900, "label": "15 Minutes", "desc": "Standard session for simple documents", "icon": "🕒"},
                {"seconds": 3600, "label": "1 Hour", "desc": "Extended session for deep, multi-file research", "icon": "⏳"}
            ]
        }
    }