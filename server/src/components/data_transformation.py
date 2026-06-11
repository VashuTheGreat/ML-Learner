from src.utils.asyncHandler import asyncHandler
import logging
from src.entity.config_entity import DataTransformationConfig, RetreiverConfig
from src.entity.artifact_entity import DataTransformationArtifact, DataIngestionArtifact
from src.retrievers.create_retreivers import Retreiver

class DataTransformation:
    def __init__(self, data_transformation_config: DataTransformationConfig, data_ingestion_artifact: DataIngestionArtifact):
        self.data_ingestion_artifact = data_ingestion_artifact
        self.data_transformation_config = data_transformation_config
        
        retreiver_config = RetreiverConfig(
            vector_store_path=self.data_transformation_config.vector_store_path
        )
        self.retreiver = Retreiver(retreiver_config=retreiver_config)

    @asyncHandler
    async def initiate_data_transformation(self) -> DataTransformationArtifact:
        logging.info("Initiating data transformation...")
        
        elements = await self.retreiver.partition_document(
            self.data_ingestion_artifact.ingested_file_path
        )
        
        chunks = await self.retreiver.create_chunks_by_title(elements)
        
        documents = await self.retreiver.get_documents(
            chunks, 
            ingested_file_path=self.data_ingestion_artifact.ingested_file_path
        )
        
        vector_store_path = await self.retreiver.save_to_vector_store(documents)
        
        logging.info("Data transformation completed successfully.")
        return DataTransformationArtifact(vector_store_path=vector_store_path)
