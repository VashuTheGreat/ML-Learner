from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File, Form
from sqlalchemy.orm import Session
from api.database import Template, get_db
from api.utils.api_response import ApiResponse
from api.utils.api_error import ApiError
from api.utils.jinja_helper import render_html
from api.middlewares.verifyuser_middleware import verify_jwt
import json
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/templates")
async def create_template(
    title: str = Form(...),
    temp_data: str = Form(None),
    template: UploadFile = File(...),
    temp_data_file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    template_content = (await template.read()).decode("utf-8")
    
    parsed_temp_data = None
    if temp_data_file:
        try:
            content = (await temp_data_file.read()).decode("utf-8")
            parsed_temp_data = json.loads(content)
        except json.JSONDecodeError:
            raise ApiError(400, "Invalid JSON in temp_data file")
    elif temp_data:
        try:
            parsed_temp_data = json.loads(temp_data)
        except json.JSONDecodeError:
            raise ApiError(400, "Invalid JSON in temp_data body")
            
    if not parsed_temp_data:
        raise ApiError(400, "Please provide temp_data as a file or in the request body.")

    template_data = Template(
        template=template_content,
        temp_data=parsed_temp_data,
        title=title
    )
    db.add(template_data)
    db.commit()
    db.refresh(template_data)

    return ApiResponse(200, template_data, "Template uploaded successfully")

@router.get("/get_template/{id}")
async def get_template(id: int, db: Session = Depends(get_db)):
    logger.info(f"Fetching template by ID: {id}")
    template_data = db.query(Template).filter(Template.id == id).first()
    
    if not template_data:
        raise ApiError(404, "Template not found")
        
    return ApiResponse(200, template_data, "Template fetched successfully")

@router.get("/getAlltemplates")
async def get_all_templates(db: Session = Depends(get_db)):
    logger.info("getAllTemplates called")
    template_data = db.query(Template).all()
    
    if not template_data:
        return ApiResponse(200, [], "Templates fetched successfully (empty)")
        
    final_response = []
    for template in template_data:
        try:
            rendered = render_html(template.template, template.temp_data)
            # Convert to dict since we want to add to_render
            t_dict = {
                "id": template.id,
                "title": template.title,
                "template": template.template,
                "temp_data": template.temp_data,
                "to_render": rendered
            }
            final_response.append(t_dict)
        except Exception as e:
            logger.error(f"Error rendering template {template.title}: {e}")
            
    return ApiResponse(200, final_response, "Templates fetched successfully")

@router.post("/getTemplateByData")
async def get_template_by_data(request: Request, db: Session = Depends(get_db), user=Depends(verify_jwt)):
    body = await request.json()
    id = body.get("template_id")
    temp_data = body.get("temp_data")
    
    if not id:
        raise ApiError(400, "Invalid template id")
        
    template_data = db.query(Template).filter(Template.id == id).first()
    if not template_data:
        raise ApiError(404, "Template not found")
        
    if not temp_data:
        raise ApiError(400, "temp data is undefined")
        
    parsed_temp_data = temp_data
    if isinstance(temp_data, str):
        try:
            parsed_temp_data = json.loads(temp_data)
        except json.JSONDecodeError:
            raise ApiError(400, "Invalid JSON in temp_data body")
            
    # In Node.js: parsedTempData={...parsedTempData,avatar:userAvatar}
    # For now we skip avatar as we don't have it yet.
    
    rendered = render_html(template_data.template, parsed_temp_data)
    return ApiResponse(200, {"to_render": rendered}, "Template fetched successfully")
