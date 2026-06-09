from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from sqlalchemy import func
from api.database import Question, get_db
from api.models.question_models import QuestionCreate
import logging
from api.middlewares.verifyuser_middleware import verify_jwt

router = APIRouter(tags=["Question"],dependencies=[Depends(verify_jwt)])

@router.get("")
async def get_questions(
    question_id: Optional[int] = None,
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    db: Session = Depends(get_db)
):
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

@router.get("/categories")
async def get_available_categories(db: Session = Depends(get_db)):
    logging.info("Fetching available categories")
    categories = db.query(Question.category).distinct().all()
    categories_list = [c[0] for c in categories]
    return JSONResponse(
        status_code=200,
        content={"success": True, "message": "Categories fetched successfully", "data": categories_list}
    )

@router.post("/add")
async def add_questions(question_input: QuestionCreate, db: Session = Depends(get_db)):
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

