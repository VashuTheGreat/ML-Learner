import logging
import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse

from api.middlewares.verifyuser_middleware import verify_jwt
from src.models.model_train_models import Train as TrainSchema
from src.pipelines.ModelTrainPipeline import ModelTrainPipeline
from src.utils.main_utils import read_yaml_file_sync

router = APIRouter(tags=["Model Training"])


@router.post("/train", dependencies=[Depends(verify_jwt)])
async def train_model(sub: TrainSchema):
    logging.info("POST /train — entered")
    try:
        pipeline = ModelTrainPipeline()
        result = await pipeline.initiate(schema=sub)
        logging.info("Model training completed successfully")
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Model training completed successfully",
                "data": result,
            },
        )
    except Exception as e:
        logging.error(f"Error in train_model: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "message": f"Model training failed: {str(e)}",
                "data": None,
            },
        )


@router.get("/available_attributes", dependencies=[Depends(verify_jwt)])
async def get_attributes():
    logging.info("GET /available_attributes — entered")
    try:
        config_path = os.path.join("config", "model_train.yaml")
        config = read_yaml_file_sync(config_path)
        
        res = {
            "make_regression_params": {
                "n_samples": {"type": "int", "default": 100, "description": "Number of samples"},
                "n_features": {"type": "int", "default": 100, "description": "Number of total features"},
                "n_informative": {"type": "int", "default": 10, "description": "Number of informative features"},
                "n_targets": {"type": "int", "default": 1, "description": "Number of regression targets"},
                "bias": {"type": "float", "default": 0.0, "description": "The bias term in the underlying linear model"},
                "noise": {"type": "float", "default": 0.0, "description": "The standard deviation of the gaussian noise"},
                "shuffle": {"type": "bool", "default": True, "description": "Shuffle the samples and the features"},
                "random_state": {"type": "int", "default": None, "description": "Determines random number generation"}
            },
            "make_classification_params": {
                "n_samples": {"type": "int", "default": 100, "description": "Number of samples"},
                "n_features": {"type": "int", "default": 20, "description": "Number of total features"},
                "n_informative": {"type": "int", "default": 2, "description": "Number of informative features"},
                "n_redundant": {"type": "int", "default": 2, "description": "Number of redundant features"},
                "n_repeated": {"type": "int", "default": 0, "description": "Number of repeated features"},
                "n_classes": {"type": "int", "default": 2, "description": "Number of classes"},
                "n_clusters_per_class": {"type": "int", "default": 2, "description": "Number of clusters per class"},
                "flip_y": {"type": "float", "default": 0.01, "description": "Fraction of samples whose class is assigned randomly"},
                "class_sep": {"type": "float", "default": 1.0, "description": "The factor multiplying the hypercube size"},
                "shuffle": {"type": "bool", "default": True, "description": "Shuffle the samples and the features"},
                "random_state": {"type": "int", "default": None, "description": "Determines random number generation"}
            },
            "regression_models": list(config.get("regression_models", {}).keys()),
            "classification_models": list(config.get("classification_models", {}).keys()),
            "model_train_config": config
        }
        logging.info("Available attributes fetched successfully")
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Available attributes fetched successfully",
                "data": res,
            },
        )
    except Exception as e:
        logging.error(f"Error in get_available_attributes: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "message": f"Failed to fetch available attributes: {str(e)}",
                "data": None,
            },
        )

