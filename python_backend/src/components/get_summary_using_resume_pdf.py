import os
import sys
import logging
from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader
from src.utils.common_LLm import llm as summerizer_llm
from src.prompts import resumeSummary_prompts as ResumeSummaryPrompt
from src.exception import MyException

# ------------- Documents loader --------------
async def document_loader(file_path=""):
    logging.info(f"Entering document_loader with file_path: {file_path}")
    try:
        if not os.path.exists(file_path):
            logging.error(f"File not found: {file_path}")
            raise FileNotFoundError(f"file not found at location {file_path}")
        
        loader = PyPDFLoader(file_path=file_path)
        documents = loader.load()
        logging.info(f"Successfully loaded {len(documents)} document pages")
        return documents
    except Exception as e:
        raise MyException(e, sys)

async def get_summary(file_path):
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
        return res.content
    except Exception as e:
        raise MyException(e, sys)

if __name__ == "__main__":
    import asyncio
    async def main():
        logging.info("Running get_summary_using_resume_pdf.py main")
        try:
            # Example usage if needed
            # summary = await get_summary("path/to/resume.pdf")
            # print(summary)
            pass
        except Exception as e:
            logging.error(f"Error in main: {str(e)}")
    
    asyncio.run(main())
