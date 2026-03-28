import os

import torch
# ----------- JOb Similar -------------------------
MLFLOW_TRACKING_URI=os.getenv('ML_FLOW_TRACKING_URI')

DEVICE=torch.device("cuda" if torch.cuda.is_available() else "cpu")
