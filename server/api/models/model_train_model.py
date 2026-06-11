from pydantic import BaseModel, Field

class TrainRequest(BaseModel):
    """
    API-level request model for the /train endpoint.
    Validates the incoming HTTP request body configuration for model training.
    """
    model_name: str = Field(
        ...,
        description="Name of the scikit-learn model to train (e.g. 'LinearRegression', 'RandomForestClassifier').",
        example="LinearRegression"
    )
    model_params: dict = Field(
        ...,
        description="Dictionary of key-value hyperparameter overrides matching the target scikit-learn estimator class.",
        example={"fit_intercept": True}
    )
    type: str = Field(
        ...,
        description="Type of training task: either 'regression' or 'classification'.",
        example="regression"
    )
    make_dataset: dict = Field(
        ...,
        description="Parameters for synthetic dataset generation using sklearn's make_regression or make_classification.",
        example={"n_samples": 100, "n_features": 2, "noise": 0.1}
    )

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

