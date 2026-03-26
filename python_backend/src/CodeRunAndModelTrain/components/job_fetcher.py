import logging
import sys
from utils.asyncHandler import asyncHandler

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from src.CodeRunAndModelTrain.constants import LINKED_IN_USER_NAME, LINKED_IN_USER_PASSWORD
from src.CodeRunAndModelTrain.entity.config_entity import JobFetcherConfig
from src.CodeRunAndModelTrain.entity.artifact_entity import JobFetcherArtifact
from exception import MyException

import pickle
import time
import csv
import os

logger = logging.getLogger(__name__)

class JobFetcher:
    def __init__(self, job_fetcher_config: JobFetcherConfig):
        self.job_fetcher_config = job_fetcher_config
        self.driver = webdriver.Chrome()
        self.wait = WebDriverWait(self.driver, self.job_fetcher_config.web_driver_wait)
        logger.info(f"Initialized JobFetcher with URL: {self.job_fetcher_config.target_url}")
        self.driver.get(self.job_fetcher_config.target_url)

    @asyncHandler
    async def get_jobs(self, cookies, jobtile: str):
        logger.info("Adding cookies to the session")
        for cookie in cookies:
            try:
                self.driver.add_cookie(cookie)
            except Exception as e:
                logger.debug(f"Failed to add a cookie: {e}")

        self.driver.refresh()
        logger.info("Session refreshed with cookies")

        return await self.save_jobs(jobtile=jobtile)

    @asyncHandler
    async def save_jobs(self, jobtile: str):
        logger.info(f"Starting job search for: {jobtile}")
        
        search_box = self.wait.until(
            EC.element_to_be_clickable(
                (By.CSS_SELECTOR, "input[data-testid='typeahead-input']")
            )
        )

        search_box.send_keys(jobtile)
        search_box.send_keys(Keys.ENTER)

        time.sleep(3)

        logger.info("Clicking on 'Jobs' tab")
        jobs_tab = self.wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Jobs')]"))
        )
        jobs_tab.click()

        time.sleep(5)

        logger.info("Waiting for job listings to load")
        jobs = self.wait.until(
            EC.presence_of_all_elements_located(
                (By.CSS_SELECTOR, "ul.semantic-search-results-list li")
            )
        )

        dirname = os.path.dirname(self.job_fetcher_config.saved_jobs_file_path)
        os.makedirs(dirname, exist_ok=True)

        logger.info(f"Found {len(jobs)} potential jobs. Scraping top 20.")
        self.job_fetcher_config.saved_jobs_file_path=os.path.join(dirname, jobtile+".csv")
        with open(self.job_fetcher_config.saved_jobs_file_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["Title", "Company", "Job Link", "Apply Link", "Description", "img_link"])

            for idx, job in enumerate(jobs[:20]):
                try:
                    self.driver.execute_script(
                        "arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", job
                    )
                    time.sleep(1)
                    job.click()
                    time.sleep(4)

                    # ✅ JOB LINK (From browser URL after click)
                    job_link = self.driver.current_url.split('?')[0]

                    # ✅ TITLE (Specific to the job detail pane)
                    try:
                        title_elem = self.wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title")))
                        title = title_elem.text.strip()
                    except:
                        try:
                            title = self.driver.find_element(By.CSS_SELECTOR, "h2.t-24").text.strip()
                        except:
                            title = "N/A"

                    # ✅ COMPANY
                    try:
                        company_elem = self.driver.find_element(By.CSS_SELECTOR, ".job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name, .job-details-jobs-unified-top-card__primary-description-container a")
                        company = company_elem.text.strip()
                    except:
                        company = "N/A"

                    # ✅ IMAGE LINK
                    try:
                        img_elem = job.find_element(By.CSS_SELECTOR, "img.ivm-view-attr__img--centered, .ivm-view-attr__img-wrapper img, .job-card-container__company-logo img")
                        img_link = img_elem.get_attribute("src")
                    except:
                        try:
                            img_elem = self.driver.find_element(By.CSS_SELECTOR, ".job-details-jobs-unified-top-card__company-logo img, .jobs-unified-top-card__company-logo img")
                            img_link = img_elem.get_attribute("src")
                        except:
                            img_link = "N/A"

                    # ✅ DESCRIPTION
                    try:
                        description_elem = self.driver.find_element(By.ID, "job-details")
                        description = description_elem.text.strip()
                    except:
                        try:
                            description = self.driver.find_element(By.CSS_SELECTOR, ".jobs-description__content, .jobs-box__html-content").text.strip()
                        except:
                            description = "N/A"

                    # ✅ APPLY LINK
                    apply_link = "LinkedIn (No direct button found)"
                    try:
                        # 1. Check for Easy Apply
                        try:
                            self.driver.find_element(By.CSS_SELECTOR, "button.jobs-apply-button")
                            apply_link = job_link 
                        except:
                            # 2. Check for External Apply
                            external_btn = self.driver.find_element(By.CSS_SELECTOR, "a.jobs-apply-button")
                            original_window = self.driver.current_window_handle
                            external_btn.click()
                            time.sleep(3)
                            
                            if len(self.driver.window_handles) > 1:
                                for window_handle in self.driver.window_handles:
                                    if window_handle != original_window:
                                        self.driver.switch_to.window(window_handle)
                                        apply_link = self.driver.current_url
                                        self.driver.close() 
                                        self.driver.switch_to.window(original_window)
                                        break
                            else:
                                apply_link = external_btn.get_attribute("href")
                    except:
                        pass

                    logger.info(f"Scraped {idx+1}: {title} | {company}")
                    writer.writerow([title, company, job_link, apply_link, description, img_link])
                    f.flush()

                except Exception as e:
                    logger.error(f"Error scraping job at index {idx}: {e}")

        logger.info(f"All jobs saved to {self.job_fetcher_config.saved_jobs_file_path}")

        self.driver.quit()

        return self.job_fetcher_config.saved_jobs_file_path

    @asyncHandler
    async def fetch(self, jobtile: str) -> JobFetcherArtifact:
        logger.info(f"Starting fetch pipeline for job title: {jobtile}")
        saved_cookie_file_path = self.job_fetcher_config.saved_cookie_path

        if not os.path.exists(saved_cookie_file_path):
            logger.info("Cookies not found. Initiating LinkedIn login.")
            self.driver.get("https://www.linkedin.com/login")

            username = self.wait.until(
                EC.presence_of_element_located((By.ID, "username"))
            )
            password = self.driver.find_element(By.ID, "password")

            username.send_keys(LINKED_IN_USER_NAME)
            password.send_keys(LINKED_IN_USER_PASSWORD)
            password.send_keys(Keys.RETURN)

            time.sleep(5)

            os.makedirs(os.path.dirname(saved_cookie_file_path), exist_ok=True)
            pickle.dump(self.driver.get_cookies(), open(saved_cookie_file_path, "wb"))
            logger.info(f"Cookies saved to {saved_cookie_file_path}")

        logger.info("Loading cookies from file")
        cookies = pickle.load(open(saved_cookie_file_path, "rb"))

        saved_job_cs = await self.get_jobs(cookies=cookies, jobtile=jobtile)

        return JobFetcherArtifact(saved_jobs_file_path=saved_job_cs)
