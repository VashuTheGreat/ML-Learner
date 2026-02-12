import logging
import os
from logging.handlers import RotatingFileHandler
from datetime import datetime
from src.constants import LOGS_DIR

# Log File Configuration
LOG_FILE = f"{datetime.now().strftime('%m_%d_%Y_%H_%M_%S')}.log"
MAX_LOG_SIZE = 5 * 1024 * 1024 # 5MB
BACKUP_COUNT = 3

log_file_path = os.path.join(LOGS_DIR, LOG_FILE)

def configure_logger():
    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG)

    formatter = logging.Formatter("[ %(asctime)s ] %(name)s - %(levelname)s - %(message)s")

    # File Handler
    file_handler = RotatingFileHandler(log_file_path, maxBytes=MAX_LOG_SIZE, backupCount=BACKUP_COUNT)
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.DEBUG)

    # Console Handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(logging.INFO)

    # Avoid duplicate handlers if the logger is re-initialized
    if not logger.handlers:
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)

# Automatically configure on import
configure_logger()
logging.info(f"Logger initialized. Logging to {log_file_path}")
