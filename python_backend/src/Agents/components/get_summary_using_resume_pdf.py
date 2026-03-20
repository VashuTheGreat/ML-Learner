import os
import sys
import logging
from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader
from Agents.llm.llm_loader import llm as summerizer_llm
from src.Agents.prompts import resumeSummary_prompts as ResumeSummaryPrompt
from exception import MyException
from src.Agents.utils.rag_utils import document_loader
from src.Agents.entity.artifact_entity import ResumeSummaryArtifact

# ------------- Documents loader --------------

class ResumeSummary:
    def __init__(self):
        pass

    
    async def get_summary(self,file_path)->ResumeSummaryArtifact:
        logging.info(f"Entering get_summary with file_path: {file_path}")
        try:
            docs = await document_loader(file_path=file_path)
            if not docs:
                logging.warning("No documents loaded for summary")
                return ""
                
            prompt = ResumeSummaryPrompt.format(
                resume_content=docs[0].page_content
            )
            
            logging.info("Invoking LLM for resume summary")
            res = await summerizer_llm.ainvoke(prompt)
            
            logging.debug(f"LLM Response: {res}")
            logging.info("Exiting get_summary")


            resume_artifact:ResumeSummaryArtifact=ResumeSummaryArtifact(
                summary=res.content
            )
            return resume_artifact
        except Exception as e:
            raise MyException(e, sys)
