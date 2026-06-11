from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from sqlalchemy import func
from db import Question, get_db
from api.models.question_models import QuestionCreate
import logging
from api.middlewares.verifyuser_middleware import verify_jwt

router = APIRouter(
    tags=["Coding Problems"],
    dependencies=[Depends(verify_jwt)],
    responses={
        401: {
            "description": "Unauthorized access token or expired session.",
            "content": {"application/json": {"example": {"success": False, "message": "Token has expired", "data": None}}}
        }
    }
)

@router.get(
    "",
    summary="Get coding questions",
    description="Queries the list of available coding questions. Allows filtering by specific Question ID, Category, or Difficulty level.",
    responses={
        200: {
            "description": "Questions matching query criteria successfully returned.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Questions fetched successfully",
                        "data": [
                            {
                                "id": 1,
                                "title": "Two Sum",
                                "difficulty": "easy",
                                "category": "Arrays",
                                "problem_description": "...",
                                "starter_code": "...",
                                "example_input": "...",
                                "example_output": "...",
                                "example_reasoning": "...",
                                "learn_content": "...",
                                "solution_code": "...",
                                "test_cases": {},
                                "function_name": "twoSum"
                            }
                        ]
                    }
                }
            }
        },
        404: {
            "description": "Question ID requested was not found.",
            "content": {"application/json": {"example": {"success": False, "message": "Question not found", "data": None}}}
        }
    }
)
async def get_questions(
    question_id: Optional[int] = Query(None, description="Database ID of a single coding problem to retrieve."),
    category: Optional[str] = Query(None, description="Filter problems by category category (case-insensitive)."),
    difficulty: Optional[str] = Query(None, description="Filter problems by difficulty (easy, medium, hard)."),
    db: Session = Depends(get_db)
):
    """
    Retrieve one or more coding questions based on filter parameters.
    """
    query = db.query(Question)
    
    if question_id is not None:
        logging.info(f"Fetching question by ID: {question_id}")
        question = query.filter(Question.id == question_id).first()
        if not question:
            logging.warning(f"Question with ID {question_id} not found")
            raise HTTPException(status_code=404, detail={"success": False, "message": "Question not found", "data": None})
        return JSONResponse(
            status_code=200,
            content={"success": True, "message": "Question fetched successfully", "data": jsonable_encoder(question)}
        )
        
    if category is not None:
        logging.info(f"Fetching questions by category: {category}")
        query = query.filter(func.lower(Question.category) == category.lower())
        
    if difficulty is not None:
        logging.info(f"Fetching questions by difficulty: {difficulty}")
        query = query.filter(func.lower(Question.difficulty) == difficulty.lower())
        
    questions = query.all()
    return JSONResponse(
        status_code=200,
        content={"success": True, "message": "Questions fetched successfully", "data": jsonable_encoder(questions)}
    )

@router.get(
    "/categories",
    summary="Get all available question categories",
    description="Returns a unique list of all categories that are populated in the database questions.",
    responses={
        200: {
            "description": "Unique categories fetched successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Categories fetched successfully",
                        "data": ["Arrays", "Strings", "Trees", "Sorting"]
                    }
                }
            }
        }
    }
)
async def get_available_categories(db: Session = Depends(get_db)):
    """
    Retrieve distinct categories present in the current Question table.
    """
    logging.info("Fetching available categories")
    categories = db.query(Question.category).distinct().all()
    categories_list = [c[0] for c in categories]
    return JSONResponse(
        status_code=200,
        content={"success": True, "message": "Categories fetched successfully", "data": categories_list}
    )

@router.post(
    "/add",
    summary="Add a new coding problem",
    description="Registers a new coding problem in the system database. Fails if the question ID is already taken.",
    responses={
        200: {
            "description": "Question created successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Question added successfully",
                        "data": {"id": 42, "title": "New Question", "difficulty": "easy"}
                    }
                }
            }
        },
        400: {
            "description": "Question ID already exists in the database.",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "message": "Question with ID 42 already exists",
                        "data": None
                    }
                }
            }
        }
    }
)
async def add_questions(question_input: QuestionCreate, db: Session = Depends(get_db)):
    """
    Inserts a custom question into the database.
    """
    logging.info(f"Adding question: {question_input.title}")
    
    if question_input.id is not None:
        existing = db.query(Question).filter(Question.id == question_input.id).first()
        if existing:
            raise HTTPException(status_code=400, detail={"success": False, "message": f"Question with ID {question_input.id} already exists", "data": None})
            
    question = Question(
        id=question_input.id,
        title=question_input.title,
        difficulty=question_input.difficulty,
        category=question_input.category,
        problem_description=question_input.problem_description,
        starter_code=question_input.starter_code,
        example_input=question_input.example_input,
        example_output=question_input.example_output,
        example_reasoning=question_input.example_reasoning,
        learn_content=question_input.learn_content,
        solution_code=question_input.solution_code,
        test_cases=question_input.test_cases,
        function_name=question_input.function_name
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    
    return JSONResponse(
        status_code=200,
        content={"success": True, "message": "Question added successfully", "data": jsonable_encoder(question)}
    )


