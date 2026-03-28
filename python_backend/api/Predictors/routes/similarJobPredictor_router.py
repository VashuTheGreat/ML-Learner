import fastapi
from src.Predictors.pipelines.similarPrediction_pipeline import SimilarJobPipeline
import numpy as np
router=fastapi.APIRouter()

@router.post("/similarJobPredictor")
async def similarJobPredictor(jobDiscription:str,userDetails:str):
    try:
        res= await SimilarJobPipeline().initiate(jobDiscription,userDetails)
        res=float(np.mean(res))
        return {"data":res}
    except Exception as e:
        print(e)
        return {"data":str(e)}