import fastapi
from src.CodeRunAndModelTrain.pipelines.JobFetcherPipeline import JobFetcherPipeline
from exception import MyException
import pandas as pd
import sys
router=fastapi.APIRouter()

@router.post("/fetchJobs")
async def jobFetcher(jobtile: str="machine learning intern",updated:bool=False):
    try:
        job_fetcher_pipeline=JobFetcherPipeline()
        res=await job_fetcher_pipeline.initiate(jobtile=jobtile,updated=updated)
        data=pd.read_csv(res.saved_jobs_file_path)
        data = data.where(pd.notnull(data), None)
        return data.to_dict(orient="records")
    except Exception as e:
        raise MyException(e, sys)