

import os
import sys

sys.path.append(os.getcwd())

from logger import *


import asyncio
from src.Predictors.pipelines.faceFinder_pipeline import FaceFinderPipeline

from PIL import Image


async def main():
    face_finder_pipeline=FaceFinderPipeline()
    img=Image.open("test_content/test1.jpg")

    res=await face_finder_pipeline.initiate(img=img)
    print(res)



asyncio.run(main())
