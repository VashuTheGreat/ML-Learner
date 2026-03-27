import os
import sys

sys.path.append(os.getcwd())

from dotenv import load_dotenv
load_dotenv()

from logger import *
import logging
import asyncio
from src.Agents.pipelines.FormFillerPipeline import FormFillerPipeline


async def main():
    form_filler_pipeline = FormFillerPipeline()

    formFields = [
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

    userDetails = """
    Name: Vansh Sharma
    Email: vanshsharma123@gmail.com
    Phone: 9876543210
    Location: Ghaziabad, Uttar Pradesh, India
    Skills: Python, Machine Learning, Node.js
    """

    res = await form_filler_pipeline.initiate(
        formFields=formFields,
        userDetails=userDetails
    )

    logging.info(f"Final Response: {res}")


asyncio.run(main())