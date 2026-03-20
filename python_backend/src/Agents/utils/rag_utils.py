
import logging
from exception import MyException
import sys
import os
from langchain_community.document_loaders import PyPDFLoader
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