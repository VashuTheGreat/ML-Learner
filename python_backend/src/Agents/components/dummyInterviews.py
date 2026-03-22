import os
import sys
import logging
from pydantic import BaseModel, Field
from datetime import datetime, timezone, timedelta
from typing import List
from langchain_aws import ChatBedrockConverse
import json
from src.Agents.prompts import dummyInterview_prompts as interview_generater_Prompt
from src.Agents.llm.llm_loader import llm
from src.Agents.models.dummyInterview_model import InterviewResponse
from exception import MyException
from utils.asyncHandler import asyncHandler
from src.Agents.entity.config_entity import DummyInterviewConfig
from src.Agents.entity.artifact_entity import DummyInterviewArtifact
llm = llm

llm_structured = llm.with_structured_output(InterviewResponse)


class DummyInterview:
    def __init__(self, dummy_interview_config: DummyInterviewConfig):
        self.dummy_interview_config = dummy_interview_config

    @asyncHandler
    async def generate_interview_schema(self) -> DummyInterviewArtifact:
        logging.info("Entering generate_interview_schema")

        if not self.dummy_interview_config.updated and os.path.exists(
            self.dummy_interview_config.INTERVIEW_JSON_FILE_PATH
        ):
            logging.info(
                f"Loading cached interviews from {self.dummy_interview_config.INTERVIEW_JSON_FILE_PATH}"
            )
            with open(self.dummy_interview_config.INTERVIEW_JSON_FILE_PATH, "r") as f:
                res = json.load(f)
            return DummyInterviewArtifact(interviews=res)

        logging.info(
            "Cache missing or update requested. Proceeding to generation."
        )
        logging.info("Generating new interview schema using LLM")
        base_date = datetime.now(timezone.utc)
        min_date = (base_date + timedelta(days=2)).strftime("%Y-%m-%dT%H:%M:%SZ")
        max_date = (base_date + timedelta(days=7)).strftime("%Y-%m-%dT%H:%M:%SZ")
        prompt = interview_generater_Prompt.format(
            no_of_interviews=self.dummy_interview_config.no_of_interviews,
            fields=self.dummy_interview_config.fields,
            companiesName=self.dummy_interview_config.companiesName,
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
                    time_value = item.get("time", base_date.isoformat())
                    interviews.append(
                        {
                            "companyName": item.get("companyName", "Unknown"),
                            "topic": item.get("topic", "Unknown"),
                            "job_Role": item.get("job_Role", "Unknown"),
                            "time": time_value,
                            "status": "pending",
                        }
                    )
                else:
                    time_value = getattr(item, "time", base_date.isoformat())
                    interviews.append(
                        {
                            "companyName": getattr(item, "companyName", "Unknown"),
                            "topic": getattr(item, "topic", "Unknown"),
                            "job_Role": getattr(item, "job_Role", "Unknown"),
                            "time": time_value,
                            "status": "pending",
                        }
                    )

        logging.info(
            f"Saving {len(interviews)} generated interviews to {self.dummy_interview_config.INTERVIEW_JSON_FILE_PATH}"
        )
        with open(self.dummy_interview_config.INTERVIEW_JSON_FILE_PATH, "w") as f:
            json.dump(interviews, f, indent=4)
        logging.info("Exiting generate_interview_schema")

        dummy_interview_artifact = DummyInterviewArtifact(interviews=interviews)
        return dummy_interview_artifact

