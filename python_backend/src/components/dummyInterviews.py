import os
import sys
import logging
from pydantic import BaseModel, Field
from datetime import datetime, timezone, timedelta
from typing import List
from langchain_aws import ChatBedrockConverse
import json
from src.prompts import dummyInterview_prompts as interview_generater_Prompt
from src.utils.common_LLm import llm
from src.constants import INTERVIEW_JSON_FILE_PATH
from src.models.dummyInterview_model import InterviewResponse
from src.exception import MyException

llm = llm

llm_structured = llm.with_structured_output(InterviewResponse)

async def generate_interview_schema(no_of_interviews: int = 3, fields: List[str] = None,updated:bool=False,companiesName:List[str]=['Google',"Amazon","Microsoft","Apple","Meta","Netflix"]):
    logging.info("Entering generate_interview_schema")
    try:
        if fields is None:
            fields = []
            
        if not updated and os.path.exists(INTERVIEW_JSON_FILE_PATH):
            logging.info(f"Loading cached interviews from {INTERVIEW_JSON_FILE_PATH}")
            with open(INTERVIEW_JSON_FILE_PATH, "r") as f:
                res = json.load(f)
            return res
        
        logging.info(f"Cache missing or update requested. Proceeding to generation.")

        logging.info("Generating new interview schema using LLM")
        current_time = datetime.now(timezone.utc)
        min_date = (current_time + timedelta(days=2)).strftime("%Y-%m-%dT%H:%M:%SZ")
        max_date = (current_time + timedelta(days=7)).strftime("%Y-%m-%dT%H:%M:%SZ")

        prompt = interview_generater_Prompt.format(
            no_of_interviews=no_of_interviews,
            fields=fields,
            companiesName=companiesName,
            min_date=min_date,
            max_date=max_date,
        )

        result = await llm_structured.ainvoke(prompt)
        logging.debug(f"LLM raw structured result: {result}")

        interviews = []
        res_list = []
        if isinstance(result, dict):
            res_list = result.get("result", [])
        elif result:
            res_list = getattr(result, "result", [])

        if isinstance(res_list, str):
            try:
                res_list = json.loads(res_list)
            except Exception as e:
                logging.warning(f"Failed to parse stringified result list: {e}")
                res_list = []

        if res_list:
            for item in res_list:
                if isinstance(item, dict):
                    interviews.append({
                        "companyName": item.get("companyName", "Unknown"),
                        "topic": item.get("topic", "Unknown"),
                        "job_Role": item.get("job_Role", "Unknown"),
                        "time": item.get("time", current_time.isoformat()),
                        "status": "pending"
                    })
                else:
                    interviews.append({
                        "companyName": getattr(item, "companyName", "Unknown"),
                        "topic": getattr(item, "topic", "Unknown"),
                        "job_Role": getattr(item, "job_Role", "Unknown"),
                        "time": getattr(item, "time", current_time.isoformat()),
                        "status": "pending"
                    })
        
        logging.info(f"Saving {len(interviews)} generated interviews to {INTERVIEW_JSON_FILE_PATH}")
        with open(INTERVIEW_JSON_FILE_PATH, "w") as f:
            json.dump(interviews, f, indent=4)    

        logging.info("Exiting generate_interview_schema")
        return interviews
    except Exception as e:
        raise MyException(e, sys)
