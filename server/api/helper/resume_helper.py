
from typing import List
import json
import logging

from langchain_community.document_loaders import PyPDFLoader
from pypdf import PdfReader
from langchain_core.documents import Document


async def load_pdf_docs(pdf_path: str) -> List[Document]:
    """
    Helper function to load a PDF file and extract page contents as Langchain Documents.
    """
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
    """
    Helper function to join multiple document page contents into a single string.
    """
    content = ""
    for doc in docs:
        content += f" {doc.page_content}"
    return content
