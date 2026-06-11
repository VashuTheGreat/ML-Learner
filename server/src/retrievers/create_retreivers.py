import os
import logging
from typing import List
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from src.utils.asyncHandler import asyncHandler
from src.constants import EMBEDDING_MODEL
from langchain_classic.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever
from langchain_classic.retrievers.contextual_compression import ContextualCompressionRetriever
from langchain_community.document_compressors import FlashrankRerank
from unstructured.partition.pdf import partition_pdf
from unstructured.chunking.title import chunk_by_title
from langchain_core.documents import Document
from src.entity.config_entity import RetreiverConfig

class CompatibleEmbeddings(HuggingFaceEmbeddings):
    def __call__(self, text: str):
        return self.embed_query(text)

embedding_model = CompatibleEmbeddings(model=EMBEDDING_MODEL)

class Retreiver:
    def __init__(self, retreiver_config: RetreiverConfig):
        self.retreiver_config = retreiver_config

    @asyncHandler
    async def partition_document(self, file_path: str):
        logging.info(f"Partitioning document: {file_path}")
        
        elements = partition_pdf(
            filename=file_path,
            strategy=self.retreiver_config.partition_strategy,
            infer_table_structure=True,
            extract_image_block_types=["Image"],
            extract_image_block_to_payload=True
        )
        
        logging.info(f"Extracted {len(elements)} elements")
        return elements
    
    @asyncHandler
    async def create_chunks_by_title(self, elements):
        logging.info("Creating smart chunks...")
        
        chunks = chunk_by_title(
            elements,
            max_characters=self.retreiver_config.max_characters,
            new_after_n_chars=self.retreiver_config.new_after_n_chars,
            combine_text_under_n_chars=self.retreiver_config.combine_text_under_n_chars
        )
        
        if not chunks and elements:
            logging.warning("chunk_by_title returned 0 chunks, falling back to raw elements.")
            chunks = elements
            
        logging.info(f"Created {len(chunks)} chunks")
        return chunks

    @asyncHandler
    async def separate_content_types(self, chunk):
        extracted_text = chunk.text if hasattr(chunk, 'text') and chunk.text is not None else ""
        if not extracted_text and chunk is not None:
            try:
                temp_text = str(chunk)
                if temp_text is not None:
                    extracted_text = temp_text
            except TypeError:
                pass

        content_data = {
            'text': extracted_text,
            'tables': [],
            'images': [],
            'types': ['text']
        }
        
        elements_to_process = []
        if hasattr(chunk, 'metadata') and hasattr(chunk.metadata, 'orig_elements') and chunk.metadata.orig_elements is not None:
            elements_to_process = chunk.metadata.orig_elements
        else:
            elements_to_process = [chunk]
            
        for element in elements_to_process:
            element_type = type(element).__name__
            
            if element_type == 'Table':
                content_data['types'].append('table')
                table_html = getattr(element.metadata, 'text_as_html', element.text) if hasattr(element, 'metadata') else element.text
                content_data['tables'].append(table_html)
            
            elif element_type == 'Image':
                if hasattr(element, 'metadata') and hasattr(element.metadata, 'image_base64'):
                    content_data['types'].append('image')
                    content_data['images'].append(element.metadata.image_base64)
        
        content_data['types'] = list(set(content_data['types']))
        return content_data

    @asyncHandler
    async def get_documents(self, chunks, ingested_file_path: str):
        documents = []
        for chunk in chunks:
            content_data = await self.separate_content_types(chunk)
            doc = Document(
                page_content=content_data['text'],
                metadata={
                    'types': content_data['types'],
                    'tables': content_data['tables'],
                    'images': content_data['images'],
                    'has_images': len(content_data['images']) > 0,
                    'source': ingested_file_path
                }
            )
            documents.append(doc)
        return documents
    
    @asyncHandler
    async def save_to_vector_store(self, documents):
        if not documents:
            logging.warning("No documents provided to save to vector store. Skipping FAISS creation.")
            return None
            
        logging.info(f"Saving {len(documents)} documents to FAISS at {self.retreiver_config.vector_store_path}")
        os.makedirs(os.path.dirname(self.retreiver_config.vector_store_path), exist_ok=True)
        
        vector_store = FAISS.from_documents(documents, embedding_model)
        vector_store.save_local(self.retreiver_config.vector_store_path)
        return self.retreiver_config.vector_store_path
    
  

    @asyncHandler
    async def create_retreiver(self, vectorstore):
        logging.info("Extracting documents from vectorstore for BM25...")
        documents = list(vectorstore.docstore._dict.values())
        base_k = max(self.retreiver_config.k * 2, 20)
        vector_retriever = vectorstore.as_retriever(search_kwargs={"k": base_k})
        valid_documents = [doc for doc in documents if doc.page_content and doc.page_content.strip()]
        if not valid_documents:
            logging.info("No documents with text content found in vectorstore docstore. Returning vector retriever.")
            return vector_retriever
        bm25_retriever = BM25Retriever.from_documents(valid_documents)
        bm25_retriever.k = base_k
        hybrid_retriever = EnsembleRetriever(
            retrievers=[vector_retriever, bm25_retriever],
            weights=self.retreiver_config.ensemble_weights
        )
        return hybrid_retriever

    
    @asyncHandler
    async def get_all_documents(self, vector_store_paths: List[str]):
        documents = []
        for path in vector_store_paths:
            if os.path.exists(path):
                vectorstore = FAISS.load_local(
                    path, 
                    embedding_model, 
                    allow_dangerous_deserialization=True
                )
                for doc in vectorstore.docstore._dict.values():
                    documents.append({
                        "page_content": doc.page_content,
                        "metadata": doc.metadata
                    })
        return documents

    @asyncHandler
    async def merge_vector_stores(self, vector_store_paths: List[str]):
        logging.info(f"Merging {len(vector_store_paths)} vector stores")
        
        individual_retrievers = []
        for path in vector_store_paths:
            if os.path.exists(path):
                vectorstore = FAISS.load_local(
                    path, 
                    embedding_model, 
                    allow_dangerous_deserialization=True
                )
                retriever = await self.create_retreiver(vectorstore)
                individual_retrievers.append(retriever)
        
        if not individual_retrievers:
            logging.warning("No valid vector stores found to merge")
            return None
            
        weights = [1.0 / len(individual_retrievers)] * len(individual_retrievers)
        
        hybrid_retriever = EnsembleRetriever(
            retrievers=individual_retrievers,
            weights=weights
        )


        compressor = FlashrankRerank(top_n=self.retreiver_config.k)

        compression_retriever = ContextualCompressionRetriever(
            base_compressor=compressor,
            base_retriever=hybrid_retriever
        )

        return compression_retriever
        
