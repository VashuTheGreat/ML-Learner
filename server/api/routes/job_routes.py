import logging
import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from api.models.job_models import  ATS_SCORE
from src.pipelines.JobFetcherPipeline import JobFetcherPipeline
from src.pipelines.model_download_pipeline import ModelDownloadPipeline
from src.pipelines.similarPrediction_pipeline import SimilarJobPipeline

router = APIRouter(tags=["Jobs"])


@router.get("")
async def fetch_jobs(jobtile: str = "machine learning intern", updated: bool = False):
    logging.info(f"GET / — entered with jobtile={jobtile}, updated={updated}")
    try:
        job_fetcher_pipeline = JobFetcherPipeline()
        jobtile = jobtile.lower()
        res = await job_fetcher_pipeline.initiate(jobtile=jobtile, updated=updated)
        data = pd.read_csv(res.saved_jobs_file_path)
        data = data.where(pd.notnull(data), None)
        records = data.to_dict(orient="records")
        logging.info("Jobs fetched and parsed successfully")
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Jobs fetched successfully",
                "data": records,
            },
        )
    except Exception as e:
        logging.error(f"Error in fetch_jobs: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "message": f"Failed to fetch jobs: {str(e)}",
                "data": None,
            },
        )


async def download_model():
    logging.info("GET /downloadModel — entered")
    try:
        model_downloader_pipeline = ModelDownloadPipeline()
        await model_downloader_pipeline.initiate()
        logging.info("Model downloaded successfully")
    except Exception as e:
        logging.error(f"Error in download_model: {str(e)}")


@router.post("/ats")
async def similar_job_predictor(body: ATS_SCORE):
    logging.info("POST /ats — entered")
    try:
        await download_model()
        res = await SimilarJobPipeline().initiate(body.jobDiscription, body.userDetails)
        avg_similarity = float(np.mean(res))
        logging.info(f"Similarity score calculated successfully: {avg_similarity}")
        return JSONResponse(
            status_code=200,
            content={
                "success": True,
                "message": "Job similarity calculated successfully",
                "data": avg_similarity,
            },
        )
    except Exception as e:
        logging.error(f"Error in similar_job_predictor: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail={
                "success": False,
                "message": f"Failed to predict job similarity: {str(e)}",
                "data": None,
            },
        )