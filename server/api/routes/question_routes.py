from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import func
from api.database import Question, get_db
from api.utils.api_response import ApiResponse
from api.utils.api_error import ApiError
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/fetch_question/id/{question_id}")
async def fetch_question_by_id(question_id: int, db: Session = Depends(get_db)):
    logger.info(f"Fetching question by ID: {question_id}")
    question = db.query(Question).filter(Question.id == question_id).first()
    return ApiResponse(200, question)

@router.get("/fetch_question/category/{category}")
async def fetch_question_by_category(category: str, db: Session = Depends(get_db)):
    logger.info(f"Fetching questions by category: {category}")
    questions = db.query(Question).filter(func.lower(Question.category) == category.lower()).all()
    return ApiResponse(200, questions)

@router.get("/fetch_question/difficulty/{difficulty}")
async def fetch_question_by_difficulty(difficulty: str, db: Session = Depends(get_db)):
    logger.info(f"Fetching questions by difficulty: {difficulty}")
    questions = db.query(Question).filter(func.lower(Question.difficulty) == difficulty.lower()).all()
    return ApiResponse(200, questions)

@router.get("/fetch_question/all")
async def fetch_all_questions(db: Session = Depends(get_db)):
    logger.info("Fetching all questions")
    questions = db.query(Question).all()
    return ApiResponse(200, questions)

@router.get("/question_categories")
async def get_available_categories(db: Session = Depends(get_db)):
    logger.info("Fetching available categories")
    categories = db.query(Question.category).distinct().all()
    return ApiResponse(200, [c[0] for c in categories])

@router.post("/add_questions")
async def add_questions(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    logger.info(f"Adding question: {body.get('title')}")
    
    question = Question(
        id=body.get("id"),
        title=body.get("title"),
        difficulty=body.get("difficulty"),
        category=body.get("category"),
        problem_description=body.get("problem_description"),
        starter_code=body.get("starter_code"),
        example_input=body.get("example_input"),
        example_output=body.get("example_output"),
        example_reasoning=body.get("example_reasoning"),
        learn_content=body.get("learn_content"),
        solution_code=body.get("solution_code"),
        test_cases=body.get("test_cases"),
        function_name=body.get("function_name")
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    
    return ApiResponse(200, question)
