
from src.utils.asyncHandler import asyncHandler
import logging
from src.entity.config_entity import DataIngestionConfig
from src.utils.ingestion_utils import text_to_pdf,image_to_pdf,docs_to_pdf
from src.entity.artifact_entity import DataIngestionArtifact
import shutil
import os


class DataIngestion:
    def __init__(self,data_ingestion_config:DataIngestionConfig):
        self.data_ingestion_config=data_ingestion_config
        
    
    @asyncHandler
    async def ingest_data(self)->DataIngestionArtifact:
        logging.info(f"Ensuring directory exists for: {self.data_ingestion_config.save_file_path}")
        os.makedirs(os.path.dirname(self.data_ingestion_config.save_file_path), exist_ok=True)

        match (self.data_ingestion_config.input_file_path.split(".")[-1]):
            
            case "docx":
                await docs_to_pdf(docs_path=self.data_ingestion_config.input_file_path,output_pdf_path=self.data_ingestion_config.save_file_path)

            case "txt":
                await text_to_pdf(file_path=self.data_ingestion_config.input_file_path,output_file_path=self.data_ingestion_config.save_file_path)

            case "png":
                await image_to_pdf(imge_path=self.data_ingestion_config.input_file_path,output_pdf_path=self.data_ingestion_config.save_file_path)
            case "jpg":
                await image_to_pdf(imge_path=self.data_ingestion_config.input_file_path,output_pdf_path=self.data_ingestion_config.save_file_path)
            case "webp":
                await image_to_pdf(imge_path=self.data_ingestion_config.input_file_path,output_pdf_path=self.data_ingestion_config.save_file_path)
            
            case "pdf":
                shutil.copy(src=self.data_ingestion_config.input_file_path, dst=self.data_ingestion_config.save_file_path)

        return  DataIngestionArtifact(ingested_file_path=self.data_ingestion_config.save_file_path)        








