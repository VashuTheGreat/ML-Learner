
import os
# ---------------- config ----------------------------------------------

MODEL_TRAIN_CONFIG="src/CodeRunAndModelTrain/config/model_train.yaml"



# --------------------- JOB FETCHER -------------------------
DEFAULT_NO_OF_JOBS=30
WEB_DRIVER_WAIT=20
LINKED_IN_TARGET_URL="https://www.linkedin.com/"

DEFAULT_SAVE_COOKIE_PATH=os.path.join("artifact","cookies","cookies.pkl")

LINKED_IN_USER_NAME=os.getenv("LINKED_IN_USER_EMAIL")
LINKED_IN_USER_PASSWORD=os.getenv("LINKED_IN_USER_PASSWORD")


SAVED_JOBS_FILE_PATH=os.path.join("artifact","jobs","jobs.csv")