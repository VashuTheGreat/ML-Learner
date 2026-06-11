import logging
import csv
import os
import httpx
from src.utils.asyncHandler import asyncHandler
from src.entity.config_entity import JobFetcherConfig
from src.entity.artifact_entity import JobFetcherArtifact
from src.constants import RAPIDAPI_KEY

logger = logging.getLogger(__name__)

class JobFetcher:
    def __init__(self, job_fetcher_config: JobFetcherConfig):
        self.job_fetcher_config = job_fetcher_config
        logger.info("Initialized JobFetcher with JSearch API (RapidAPI)")

    @asyncHandler
    async def get_jobs(self, jobtile: str):
        logger.info(f"Starting job search for: {jobtile}")
        
        dirname = os.path.dirname(self.job_fetcher_config.saved_jobs_file_path)
        os.makedirs(dirname, exist_ok=True)
        
        self.job_fetcher_config.saved_jobs_file_path = os.path.join(dirname, jobtile + ".csv")
        
        api_key = RAPIDAPI_KEY
        
        headers = {
            "x-rapidapi-key": api_key,
            "x-rapidapi-host": "jsearch.p.rapidapi.com"
        }
        
        url = "https://jsearch.p.rapidapi.com/search"
        
        jobs_list = []
        page = 1
        max_pages = 3  # Allow up to 3 pages to fetch enough jobs (usually 10 jobs per page)
        
        logger.info(f"Fetching jobs from JSearch API...")
        async with httpx.AsyncClient(timeout=30.0) as client:
            while len(jobs_list) < self.job_fetcher_config.no_of_jobs and page <= max_pages:
                logger.info(f"Requesting page {page} for query: {jobtile}")
                params = {
                    "query": jobtile,
                    "page": str(page),
                    "num_pages": "1"
                }
                
                try:
                    response = await client.get(url, headers=headers, params=params)
                    response.raise_for_status()
                    result_data = response.json()
                    page_jobs = result_data.get("data", [])
                    if not page_jobs:
                        logger.info("No more jobs returned from API.")
                        break
                    jobs_list.extend(page_jobs)
                    page += 1
                except Exception as e:
                    logger.error(f"Error fetching page {page} from JSearch API: {e}")
                    break
        
        logger.info(f"Found {len(jobs_list)} potential jobs. Formatting and saving top {self.job_fetcher_config.no_of_jobs}.")
        
        with open(self.job_fetcher_config.saved_jobs_file_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["Title", "Company", "Job Link", "Apply Link", "Description", "img_link"])
            
            for idx, item in enumerate(jobs_list[:self.job_fetcher_config.no_of_jobs]):
                title = item.get("job_title", "N/A")
                company = item.get("employer_name", "N/A")
                
                # Apply Link is the direct application link
                apply_link = item.get("job_apply_link", "N/A")
                
                # Job Link is standard Google Jobs detail link if available, fallback to apply link
                job_link = item.get("job_google_link", apply_link)
                if not job_link:
                    job_link = "N/A"
                    
                description = item.get("job_description", "N/A")
                img_link = item.get("employer_logo", "N/A")
                if not img_link:
                    img_link = "N/A"
                
                writer.writerow([title, company, job_link, apply_link, description, img_link])
                
        logger.info(f"All jobs saved to {self.job_fetcher_config.saved_jobs_file_path}")
        return self.job_fetcher_config.saved_jobs_file_path

    @asyncHandler
    async def fetch(self, jobtile: str) -> JobFetcherArtifact:
        logger.info(f"Starting fetch pipeline for job title: {jobtile}")
        saved_job_cs = await self.get_jobs(jobtile=jobtile)
        return JobFetcherArtifact(saved_jobs_file_path=saved_job_cs)
