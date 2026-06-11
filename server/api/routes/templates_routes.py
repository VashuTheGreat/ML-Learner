import logging
import os

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session


from db import Template, get_db
from api.middlewares.verifyuser_middleware import verify_jwt
from api.middlewares.multer_middleware import multer_middleware
from src.models.Resume_model import ResumeState
from api.models.template_model import UpdateTemplateBody
from src.pipelines.ResumeSchemaGeneration_pipeline import ResumeSchemaGenerationPipeline
from api.helper.resume_helper import load_pdf_docs, load_doc_to_string

router = APIRouter(
    tags=["Resume & Coding Templates"],
    responses={
        401: {
            "description": "Unauthorized access token or expired session.",
            "content": {"application/json": {"example": {"success": False, "message": "Unauthorized request", "data": None}}}
        }
    }
)




# ============================= Resume Template =============================
@router.post(
    "/resume", 
    dependencies=[Depends(verify_jwt)],
    summary="Create resume template from PDF upload",
    description="Accepts a multipart file upload of a user's resume PDF. Uses langchain document loaders and PDF readers to extract text, runs the ResumeSchemaGenerationPipeline LLM chain, generates a structured JSON schema, and persists it in the database.",
    responses={
        201: {
            "description": "Resume successfully parsed and schema generated.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Resume template created successfully",
                        "data": {
                            "id": 12,
                            "schema": {
                                "personal_info": {"name": "John Doe", "email": "john@example.com"},
                                "skills": ["Python", "SQL"]
                            }
                        }
                    }
                }
            }
        },
        500: {
            "description": "Schema generation or PDF parsing failed.",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "message": "Schema generation failed",
                        "data": None
                    }
                }
            }
        }
    }
)
async def create_resume_template(
    request: Request,
    resume_file_path: str = Depends(multer_middleware),
    db: Session = Depends(get_db),
):
    """
    Upload and parse a PDF resume to generate a template schema.
    """
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
@router.put(
    "/resume", 
    dependencies=[Depends(verify_jwt)],
    summary="Update existing resume template",
    description="Updates the JSON content of the user's parsed resume template directly.",
    responses={
        200: {
            "description": "Resume template successfully updated.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Resume template updated successfully",
                        "data": {"id": 12, "content": {}}
                    }
                }
            }
        },
        404: {
            "description": "User template not found.",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "message": "Template not found",
                        "data": None
                    }
                }
            }
        }
    }
)
async def update_resume_template(
    request: Request,
    body: UpdateTemplateBody,
    db: Session = Depends(get_db),
):
    """
    Directly update a user's resume template data.
    """
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
@router.get(
    "/resume", 
    dependencies=[Depends(verify_jwt)],
    summary="Get user resume template",
    description="Retrieves the generated/saved resume schema of the authenticated user.",
    responses={
        200: {
            "description": "Resume template successfully fetched.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Resume template fetched successfully",
                        "data": {"id": 12, "content": {"skills": ["Python"]}}
                    }
                }
            }
        },
        404: {
            "description": "User has not uploaded or generated a resume template yet.",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "message": "Resume template not found",
                        "data": None
                    }
                }
            }
        }
    }
)
async def get_resume_template(
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Get user's active resume template schema.
    """
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
@router.post(
    "/coding", 
    dependencies=[Depends(verify_jwt)],
    summary="Create coding workspace template settings",
    description="Saves custom coding workspace layout settings or compiler configurations for the user.",
    responses={
        201: {
            "description": "Coding template created successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Coding template created successfully",
                        "data": {"id": 13, "content": {}}
                    }
                }
            }
        }
    }
)
async def create_coding_template(
    request: Request,
    body: UpdateTemplateBody,
    db: Session = Depends(get_db),
):
    """
    Create custom coding template properties.
    """
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
@router.get(
    "/coding", 
    dependencies=[Depends(verify_jwt)],
    summary="Get user coding workspace template settings",
    description="Retrieves the user-specific IDE/coding workspace settings.",
    responses={
        200: {
            "description": "Coding template successfully fetched.",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Coding template fetched successfully",
                        "data": {"id": 13, "content": {}}
                    }
                }
            }
        },
        404: {
            "description": "No coding template configurations found.",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "message": "Coding template not found",
                        "data": None
                    }
                }
            }
        }
    }
)
async def get_coding_template(
    request: Request,
    db: Session = Depends(get_db),
):
    """
    Get user's coding workspace layout and compiler configs.
    """
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

