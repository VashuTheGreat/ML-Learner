
from src.utils.asyncHandler import asyncHandler
from src.data_acess.model_loader import Model
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from typing import List
class SimilarJobPrediction:
    def __init__(self):
        self.model=Model()
        pass
   
    @asyncHandler
    async def key_word_check(self, jobDiscription: str, userDetails: str):
        vectorizer = TfidfVectorizer(stop_words="english")

        vectors = vectorizer.fit_transform([
            jobDiscription,
            userDetails
        ])

        similarity = cosine_similarity(
            vectors[0:1],
            vectors[1:2]
        )[0][0]


        return similarity
    @asyncHandler
    async def recommend(self,jobDiscription:str,userDetails:str):
        model_score= await self.model.predict(job_discription=jobDiscription,userDetails=userDetails)
        keyword_score= await self.key_word_check(jobDiscription=jobDiscription,userDetails=userDetails)
        return (0.7*keyword_score+0.3*model_score)

