import os
import shutil
from src.constants import ARTIFACT_DIR,PUBLIC_FOLDER_FILE_PATH
import logging
import asyncio

from src.graphs.multi_rag_graph_builder import deleteThread as GraphThreadDeletor

async def delete_thread(thread_id: str, delay_seconds: int):
    """Utility function to delete a thread after a specific delay."""
    if delay_seconds > 0:
        logging.info(f"Waiting {delay_seconds} seconds before deleting thread: {thread_id}")
        await asyncio.sleep(delay_seconds)

    logging.info(f"Starting deletion of thread data for thread_id: {thread_id}")
    
    try:
        path1 = os.path.join(ARTIFACT_DIR, thread_id)
        path2 = os.path.join(PUBLIC_FOLDER_FILE_PATH, thread_id)
        
        if os.path.exists(path1):
            shutil.rmtree(path1)
            logging.info(f"Deleted artifact data for path: {path1}")
        if os.path.exists(path2):
            shutil.rmtree(path2)
            logging.info(f"Deleted public folder data for path: {path2}")
        try:    
            GraphThreadDeletor(thread_id)
        except Exception as e:
            logging.error(f"Error during graph thread deletion for thread_id {thread_id}: {e}")    
        logging.info(f"Completed deletion of thread data for thread_id: {thread_id}")
    except Exception as e:
        logging.error(f"Error deleting thread data for thread_id {thread_id}: {e}")
