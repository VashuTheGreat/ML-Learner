import fastapi
from fastapi import Body
import json
import sys

from exception import MyException
from src.Agents.pipelines.FormFillerPipeline import FormFillerPipeline

router = fastapi.APIRouter()

@router.post("/fill")
async def formfiller(
    formFields: str = Body(default="""
[
        {
            "id": "field-01",
            "name": "full_name",
            "placeholder": "Enter your full name",
            "type": "text",
            "label_text": "Full Name"
        },
        {
            "id": "field-02",
            "name": "email",
            "placeholder": "Enter your email",
            "type": "email",
            "label_text": "Email Address"
        },
        {
            "id": "field-03",
            "name": "phone",
            "placeholder": "Enter phone number",
            "type": "text",
            "label_text": "Phone Number"
        },
        {
            "id": "field-04",
            "name": "address",
            "placeholder": "Enter address",
            "type": "text",
            "label_text": "Shipping Address"
        }
    ]
"""),
    userDetails: str = Body(default="""
    Name: Vansh Sharma
    Email: vanshsharma123@gmail.com
    Phone: 9876543210
    Location: Ghaziabad, Uttar Pradesh, India
    Skills: Python, Machine Learning, Node.js
""")
):
    try:
        form_filler_pipeline = FormFillerPipeline()

        res = await form_filler_pipeline.initiate(
            formFields=formFields,
            userDetails=userDetails
        )

        form_fields_list = json.loads(formFields)

        if len(res.output) != len(form_fields_list):
            raise MyException("Mismatch between response and form fields", sys)

        final_ans = []

        for r, f in zip(res.output, form_fields_list):
            d = {}
            d['value'] = getattr(r, "value", None)  
            d['id'] = f.get('id')  
            final_ans.append(d)

        return final_ans

    except Exception as e:
        raise MyException(str(e), sys)