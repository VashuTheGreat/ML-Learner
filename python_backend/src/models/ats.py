from sklearn.feature_extraction.text import TfidfTransformer
from sklearn.metrics.pairwise import cosine_similarity
from langchain_community.document_loaders import PyPDFLoader
from typing import List
import os


def pdf_text_extractor(file_path="")->str:
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"file not found at location {file_path}")
    
    loader=PyPDFLoader(file_path=file_path)
    documents=loader.load()
    return documents.content

def extract_skills(text,SKILLS):
    text = text.lower()
    found = []
    for skill in SKILLS:
        if skill in text:
            found.append(skill)
    return found

def match_resume_jd(resume_txt:str,jd:str)->float:
    vectorizer=TfidfTransformer()
    vectors=vectorizer.fit_transform([resume_txt,jd])
    score=cosine_similarity(vectors[0],vectors[1])[0][0]

    return round(score*100,2)

def final_score(resume_file_path:str, jd_text,SKILLS:List[str]=["python", "java", "ml", "react", "docker", "aws"]):
    resume_text=pdf_text_extractor(file_path=resume_file_path)
    skills = extract_skills(resume_text,SKILLS=SKILLS)
    skill_score = len(skills) * 5   # har skill = 5 marks

    jd_score = match_resume_jd(resume_text, jd_text)

    total = min(skill_score + jd_score, 100)
    return total
