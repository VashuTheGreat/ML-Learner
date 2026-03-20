import logging
import os
from logging.handlers import RotatingFileHandler
from datetime import datetime
from constants import LOGS_DIR

# Log File Configuration
LOG_FILE = f"{datetime.now().strftime('%m_%d_%Y_%H_%M_%S')}.log"
MAX_FOLDER_SIZE = 2 * 1024 * 1024  # 2MB
MAX_LOG_SIZE = 5 * 1024 * 1024    # This is still needed for RotatingFileHandler if a single run exceeds 5MB

log_file_path = os.path.join(LOGS_DIR, LOG_FILE)

def cleanup_logs():
    """Removes oldest log files if the total folder size exceeds MAX_FOLDER_SIZE."""
    if not os.path.exists(LOGS_DIR):
        return

    files = [os.path.join(LOGS_DIR, f) for f in os.listdir(LOGS_DIR) if f.endswith(".log")]
    files.sort(key=os.path.getmtime)  # Sort by modification time (oldest first)

    total_size = sum(os.path.getsize(f) for f in files)

    while total_size > MAX_FOLDER_SIZE and files:
        oldest_file = files.pop(0)
        file_size = os.path.getsize(oldest_file)
        try:
            os.remove(oldest_file)
            total_size -= file_size
            logging.info(f"Deleted old log file: {oldest_file}")
        except Exception as e:
            logging.error(f"Error deleting old log file {oldest_file}: {e}")
            break

def configure_logger():
    # Ensure logs directory exists
    os.makedirs(LOGS_DIR, exist_ok=True)
    
    # Run cleanup before creating new log
    cleanup_logs()

    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG)

    formatter = logging.Formatter("[ %(asctime)s ] %(name)s - %(levelname)s - %(message)s")

    # File Handler
    file_handler = RotatingFileHandler(log_file_path, maxBytes=MAX_LOG_SIZE, backupCount=3)
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.DEBUG)

    # Console Handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    console_handler.setLevel(logging.INFO)

    # Avoid duplicate handlers if the logger is re-initialized
    logger.handlers.clear()

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

# Automatically configure on import
configure_logger()
logging.info(f"Logger initialized. Logging to {log_file_path}")