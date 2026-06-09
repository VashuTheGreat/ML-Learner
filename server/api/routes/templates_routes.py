from typing import List, Any
import json
import logging
import os

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from langchain_core.documents import Document
from langchain_community.document_loaders import PyPDFLoader
from pypdf import PdfReader

from api.database import Template, get_db
from api.middlewares.verifyuser_middleware import verify_jwt
from api.middlewares.multer_middleware import multer_middleware
from src.models.Resume_model import ResumeState
from api.models.template_model import UpdateTemplateBody
from src.pipelines.ResumeSchemaGeneration_pipeline import ResumeSchemaGenerationPipeline

router = APIRouter()





# ============================= Helpers =============================
async def load_pdf_docs(pdf_path: str) -> List[Document]:
    loader = PyPDFLoader(pdf_path)
    langchain_docs = loader.load()

    reader = PdfReader(pdf_path)

    for page_num, doc in enumerate(langchain_docs):
        page_obj = reader.pages[page_num]
        extracted_links = []

        if "/Annots" in page_obj:
            annotations = page_obj["/Annots"]
            for annot in annotations:
                obj = annot.get_object()
                if obj.get("/Subtype") == "/Link" and "/A" in obj:
                    action = obj["/A"].get_object()
                    if "/URI" in action:
                        extracted_links.append({
                            "name": obj.get("/Contents", "Anchor Link"),
                            "url": action["/URI"]
                        })

        if extracted_links:
            doc.page_content = doc.page_content + " links " + json.dumps(extracted_links)

    return langchain_docs


async def load_doc_to_string(docs: List[Document]) -> str:
    content = ""
    for doc in docs:
        content += f" {doc.page_content}"
    return content


# ============================= Resume Template =============================
@router.post("/resume", dependencies=[Depends(verify_jwt)])
async def create_resume_template(
    request: Request,
    resume_file_path: str = Depends(multer_middleware),
    db: Session = Depends(get_db),
):
    user_id = request.state.user.id
    logging.info("POST /templates/resume — entered")

    try:
        docs = await load_pdf_docs(resume_file_path)
        logging.info(f"PDF loaded — {len(docs)} page(s)")

        content = await load_doc_to_string(docs)
        logging.debug(f"Extracted text length: {len(content)} chars")

        user_state = ResumeState(userDetails=content)

        pipeline = ResumeSchemaGenerationPipeline()
        schema = await pipeline.initiate(user_state)
        logging.info("ResumeSchemaGenerationPipeline completed")

        if schema is None:
            logging.error("Pipeline returned None schema")
            raise HTTPException(
                status_code=500,
                detail={"success": False, "message": "Schema generation failed", "data": None},
            )

        parsed = schema.get("ai_generated_schema") if isinstance(schema, dict) else schema
        logging.debug(f"Parsed schema type: {type(parsed)}")

        if parsed is None:
            logging.error("Pipeline parsed schema is None")
            raise HTTPException(
                status_code=500,
                detail={"success": False, "message": "Schema parsing failed", "data": None},
            )

        schema_dict = parsed.model_dump() if hasattr(parsed, "model_dump") else parsed


        new_template = Template(
            user_id=user_id,
            t_type="resume",
            content=schema_dict,
        )
        db.add(new_template)
        db.commit()
        db.refresh(new_template)
        logging.info(f"Template saved — id={new_template.id}")

        return JSONResponse(
            status_code=201,
            content={
                "success": True,
                "message": "Resume template created successfully",
                "data": {"id": new_template.id, "schema": schema_dict},
            },
        )

    finally:
        if os.path.exists(resume_file_path):
            os.remove(resume_file_path)
            logging.info(f"Temp file removed: {resume_file_path}")
        else:
            logging.warning(f"Temp file not found at cleanup: {resume_file_path}")


# ====================== Resume Template Update ===================================
@router.put("/resume", dependencies=[Depends(verify_jwt)])
async def update_resume_template(
    request: Request,
    body: UpdateTemplateBody,
    db: Session = Depends(get_db),
):
    user_id = request.state.user.id
    logging.info(f"PUT /templates/resume — entered")

    template = db.query(Template).filter(
        Template.user_id == user_id,
        Template.t_type == "resume",
    ).first()

    if not template:
        logging.warning(f"Resume template id= not found for user_id={user_id}")
        raise HTTPException(
            status_code=404,
            detail={"success": False, "message": "Template not found", "data": None},
        )

    template.content = body.content
    db.commit()
    db.refresh(template)
    logging.info(f"Template updated — id={template.id}")

    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": "Resume template updated successfully",
            "data": {"id": template.id, "content": template.content},
        },
    )


# ====================== Resume Template Get ===================================
@router.get("/resume", dependencies=[Depends(verify_jwt)])
async def get_resume_template(
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = request.state.user.id
    logging.info("GET /templates/resume — entered")

    template = db.query(Template).filter(
        Template.user_id == user_id,
        Template.t_type == "resume",
    ).first()

    if not template:
        logging.warning(f"No resume template found for user_id={user_id}")
        raise HTTPException(
            status_code=404,
            detail={"success": False, "message": "Resume template not found", "data": None},
        )

    logging.info(f"Resume template fetched — id={template.id}")
    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": "Resume template fetched successfully",
            "data": {"id": template.id, "content": template.content},
        },
    )


# ============================= Coding Template create and update =============================
@router.post("/coding", dependencies=[Depends(verify_jwt)])
async def create_coding_template(
    request: Request,
    body: UpdateTemplateBody,
    db: Session = Depends(get_db),
):

    user_id = request.state.user.id
    logging.info("POST /templates/coding — entered")

    new_template = Template(
        user_id=user_id,
        t_type="coding",
        content=body.content,
    )
    db.add(new_template)
    db.commit()
    db.refresh(new_template)
    logging.info(f"Coding template saved — id={new_template.id}")

    return JSONResponse(
        status_code=201,
        content={
            "success": True,
            "message": "Coding template created successfully",
            "data": {"id": new_template.id, "content": new_template.content},
        },
    )


# ====================== Coding Template Get ===================================
@router.get("/coding", dependencies=[Depends(verify_jwt)])
async def get_coding_template(
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = request.state.user.id
    logging.info("GET /templates/coding — entered")

    template = db.query(Template).filter(
        Template.user_id == user_id,
        Template.t_type == "coding",
    ).first()

    if not template:
        logging.warning(f"No coding template found for user_id={user_id}")
        raise HTTPException(
            status_code=404,
            detail={"success": False, "message": "Coding template not found", "data": None},
        )

    logging.info(f"Coding template fetched — id={template.id}")
    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": "Coding template fetched successfully",
            "data": {"id": template.id, "content": template.content},
        },
    )
