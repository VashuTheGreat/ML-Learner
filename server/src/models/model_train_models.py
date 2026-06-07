from pydantic import BaseModel

class Train(BaseModel):
    model_name: str
    model_params: dict
    type: str
    make_dataset: dict

    class Config:
        json_schema_extra = {
            "examples": [
                {
                    "model_name": "LinearRegression",
                    "model_params": {"fit_intercept": True},
                    "type": "regression",
                    "make_dataset": {"n_samples": 100, "n_features": 2, "noise": 0.1}
                },
                {
                    "model_name": "RandomForestClassifier",
                    "model_params": {"n_estimators": 100, "max_depth": 5},
                    "type": "classification",
                    "make_dataset": {"n_samples": 100, "n_features": 4, "n_informative": 2, "n_classes": 2}
                },
                
            ]
        }
    