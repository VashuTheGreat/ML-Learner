import logging
from src.utils.asyncHandler import asyncHandler
from src.MultiRag.constants import EXCEPTED_FILE_TYPE
from src.utils.ingestion_utils import create_vector_store
from src.MultiRag.entity.ingestion_config import IngestionConfig
from src.MultiRag.entity.artifacts import IngestionArtifact
import os

class Ingestion:
    def __init__(self,ingestion_config:IngestionConfig):
        self.ingestion_config=ingestion_config
    @asyncHandler
    async def ingest_data(self):
        logging.info(f"Starting data ingestion... DB path: {self.ingestion_config.db_path}, Docs path: {self.ingestion_config.docs_path}")
        vector_db = await create_vector_store(path=self.ingestion_config.db_path, docs=self.ingestion_config.docs_path)
        logging.info("Vector store loaded/created successfully.")
        ingestion_artifact=IngestionArtifact(vector_db=vector_db)
        return ingestion_artifact
        


