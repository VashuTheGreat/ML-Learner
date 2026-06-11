


from src.components.data_transformation import DataTransformation
from src.entity.config_entity import ContentTransformationConfig
from src.entity.artifact_entity import ContentTransformedArtifact, ContentEmbedderArtifact, DataTransformationArtifact
from src.utils.asyncHandler import asyncHandler
import logging


from src.components.data_ingestion import DataIngestion
from src.entity.config_entity import ContentEmbedderConfig
from src.entity.artifact_entity import ContentEmbedderArtifact, DataIngestionArtifact
from src.utils.asyncHandler import asyncHandler
import logging
import os

from src.constants import ARTIFACT_DIR
class DataIngestionPipeline:
    def __init__(self, content_embedder_config: ContentEmbedderConfig):
        self.content_embedder_config = content_embedder_config

    @asyncHandler
    async def run_pipeline(self) -> ContentEmbedderArtifact:
        logging.info("Starting Data Ingestion Pipeline...")
        data_ingestion_artifacts = []

        for config in self.content_embedder_config.data_ingestion_configs:
            logging.info(f"Processing ingestion for: {config.input_file_path}")
            data_ingestion = DataIngestion(data_ingestion_config=config)
            artifact = await data_ingestion.ingest_data()
            data_ingestion_artifacts.append(artifact)
            logging.info(f"Ingestion completed for: {config.input_file_path}")

        logging.info("Data Ingestion Pipeline completed.")
        return ContentEmbedderArtifact(data_ingestion_artifacts=data_ingestion_artifacts)



class DataTransformationPipeline:
    def __init__(self, content_transformation_config: ContentTransformationConfig, content_embedder_artifact: ContentEmbedderArtifact):
        self.content_transformation_config = content_transformation_config
        self.content_embedder_artifact = content_embedder_artifact

    @asyncHandler
    async def run_pipeline(self) -> ContentTransformedArtifact:
        logging.info("Starting Data Transformation Pipeline...")
        data_transformation_artifacts = []

        for config, ingestion_artifact in zip(
            self.content_transformation_config.data_transformation_configs,
            self.content_embedder_artifact.data_ingestion_artifacts
        ):
            logging.info(f"Transforming artifact: {ingestion_artifact.ingested_file_path}")
            data_transformation = DataTransformation(
                data_transformation_config=config,
                data_ingestion_artifact=ingestion_artifact
            )
            artifact = await data_transformation.initiate_data_transformation()
            data_transformation_artifacts.append(artifact)
            logging.info(f"Transformation completed for: {ingestion_artifact.ingested_file_path}")

        logging.info("Data Transformation Pipeline completed.")
        return ContentTransformedArtifact(data_transformation_artifacts=data_transformation_artifacts)




class VectiorizerPipeline:
    def __init__(self, content_embedder_config: ContentEmbedderConfig,content_transformation_config: ContentTransformationConfig):
        self.content_embedder_config=content_embedder_config
        self.content_transformation_config=content_transformation_config
        

    @asyncHandler
    async def initiate(self,thread_id:str=None)->ContentTransformedArtifact:
        """Ingest Files"""
        if os.path.exists(os.path.join(ARTIFACT_DIR,thread_id)):
            logging.info(f"Vector store already exists for thread {thread_id} skipping ingestion and transformation")
            artifacts = []
            for config in self.content_transformation_config.data_transformation_configs:
                artifacts.append(DataTransformationArtifact(vector_store_path=config.vector_store_path))
            return ContentTransformedArtifact(data_transformation_artifacts=artifacts)

        data_ingestion_pipeline=DataIngestionPipeline(self.content_embedder_config)

        logging.info("Running data ingestion pipeline")
        content_embedder_artifact=await data_ingestion_pipeline.run_pipeline()
        data_transformation_pipeline=DataTransformationPipeline(self.content_transformation_config,content_embedder_artifact)

        logging.info("Running data transformation pipeline")
        content_transformed_artifact=await data_transformation_pipeline.run_pipeline()
        
        return content_transformed_artifact







        