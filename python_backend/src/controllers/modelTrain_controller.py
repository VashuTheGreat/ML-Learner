import logging
import sys
import io
import base64
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.datasets import make_classification, make_regression
from sklearn.metrics import (
    mean_absolute_error, mean_squared_error, r2_score,
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)
from sklearn.decomposition import PCA
from src.models.model_train_models import Train as TrainSchema
from src.exception import MyException
from src.utils.main_utils import read_yaml_file_sync
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet, SGDRegressor
from sklearn.neighbors import KNeighborsRegressor, KNeighborsClassifier
from sklearn.svm import SVR, LinearSVR, SVC, LinearSVC, NuSVC
from sklearn.tree import DecisionTreeRegressor, DecisionTreeClassifier
from sklearn.ensemble import (
    RandomForestRegressor, GradientBoostingRegressor, AdaBoostRegressor, ExtraTreesRegressor,
    RandomForestClassifier, GradientBoostingClassifier, AdaBoostClassifier, ExtraTreesClassifier
)
from sklearn.neural_network import MLPRegressor, MLPClassifier
from sklearn.linear_model import LogisticRegression, SGDClassifier, Perceptron, PassiveAggressiveClassifier, RidgeClassifier
from sklearn.naive_bayes import GaussianNB, BernoulliNB, MultinomialNB

import os
class TrainController:
    def __init__(self):
        self.config = read_yaml_file_sync("config/model_train.yaml")
        self.model_map = self._create_model_map()

    def _create_model_map(self):
        """
        Dynamically creates a mapping of model names to their respective scikit-learn classes
        based on the 'class' attribute in the YAML configuration.
        """
        model_map = {}
        # Iterate over both classification and regression model definitions in config
        for category in ["classification_models", "regression_models"]:
            if category in self.config:
                for model_key, model_info in self.config[category].items():
                    class_name = model_info.get("class")
                    if class_name:
                        # Look up the class name in the current module's namespace
                        cls = getattr(sys.modules[__name__], class_name, None)
                        if cls:
                            model_map[model_key] = cls
                        else:
                            logging.warning(f"Class {class_name} for model {model_key} not found in imports.")
        return model_map

    async def train(self, schema: TrainSchema):
        logging.info("Entering the train method")
        try:
            model_type = schema.type.lower()
            config_key = "classification_models" if model_type == "classification" else "regression_models"
            
            if config_key not in self.config:
                raise ValueError(f"Invalid model type: {model_type}")
            
            model_name = schema.model_name
            if model_name not in self.config[config_key]:
                raise ValueError(f"Model {model_name} not found in configuration for {model_type}")

            model_class = self.model_map.get(model_name)
            if not model_class:
                raise ValueError(f"Model class for {model_name} not implemented in model_map")

            model = model_class(**schema.model_params)
            
            if model_type == "classification":
                X, y = make_classification(**schema.make_dataset)
                X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)
                res = await self.eval_classification(model, X_test, y_test, y_pred)
                return res
            
            elif model_type == "regression":
                X, y = make_regression(**schema.make_dataset)
                X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)
                res = await self.eval_regression(model, X_test, y_test, y_pred)
                return res

        except Exception as e:
            raise MyException(e, sys)

    def _save_plot(self, name: str):
        """Helper to save plt figure to buffer and file, returning base64 string."""
        os.makedirs("fig", exist_ok=True)
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        img_bytes = buf.read()
        img_str = base64.b64encode(img_bytes).decode('utf-8')
        
        with open(f"fig/{name}.png", "wb") as f:
            f.write(img_bytes)
        
        plt.close()
        return img_str

    async def eval_regression(self, model, X_test, y_true, y_pred, title="Regression performance"):
        mae = mean_absolute_error(y_true, y_pred)
        mse = mean_squared_error(y_true, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_true, y_pred)
        residuals = y_true - y_pred

        res = {
            "mae": mae,
            "mse": mse,
            "rmse": rmse,
            "r2": r2,
            "plots": []
        }

        # 1. Actual vs Predicted
        plt.figure(figsize=(6, 5))
        plt.scatter(y_true, y_pred, alpha=0.6, edgecolor="k")
        min_val, max_val = min(y_true.min(), y_pred.min()), max(y_true.max(), y_pred.max())
        plt.plot([min_val, max_val], [min_val, max_val], "r--", label="Perfect fit")
        plt.xlabel("True values")
        plt.ylabel("Predicted values")
        plt.title(f"{title} - Actual vs Predicted")
        plt.legend(); plt.grid(alpha=0.3); plt.tight_layout()
        res['plots'].append(self._save_plot("regression_actual_vs_pred"))

        # 2. Residuals Plot
        plt.figure(figsize=(6, 5))
        plt.scatter(y_pred, residuals, alpha=0.6, edgecolor="k", color='orange')
        plt.axhline(y=0, color='r', linestyle='--')
        plt.xlabel("Predicted values")
        plt.ylabel("Residuals")
        plt.title(f"{title} - Residuals Plot")
        plt.grid(alpha=0.3); plt.tight_layout()
        res['plots'].append(self._save_plot("regression_residuals"))

        # 3. Error Distribution
        plt.figure(figsize=(6, 5))
        sns.histplot(residuals, kde=True, color='green')
        plt.xlabel("Residual Value")
        plt.title(f"{title} - Error Distribution")
        plt.grid(alpha=0.3); plt.tight_layout()
        res['plots'].append(self._save_plot("regression_error_dist"))
        
        return res

    async def eval_classification(self, model, X_test, y_true, y_pred, labels=None, title="Classification performance"):
        acc = accuracy_score(y_true, y_pred)
        prec = precision_score(y_true, y_pred, average="weighted", zero_division=0)
        rec = recall_score(y_true, y_pred, average="weighted", zero_division=0)
        f1 = f1_score(y_true, y_pred, average="weighted", zero_division=0)

        res = {
            "accuracy": acc,
            "precision": prec,
            "recall": rec,
            "f1": f1,
            "plots": []
        }

        # 1. Confusion Matrix
        cm = confusion_matrix(y_true, y_pred, labels=labels)
        plt.figure(figsize=(6, 5))
        tick_labels = labels if labels is not None else "auto"
        sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=tick_labels, yticklabels=tick_labels)
        plt.xlabel("Predicted"); plt.ylabel("True")
        plt.title(f"{title} - Confusion Matrix")
        plt.tight_layout()
        res['plots'].append(self._save_plot("classification_cm"))

        # 2. Feature Importance (if available)
        importance = None
        if hasattr(model, "feature_importances_"):
            importance = model.feature_importances_
        elif hasattr(model, "coef_"):
            importance = np.abs(model.coef_[0]) if model.coef_.ndim > 1 else np.abs(model.coef_)

        if importance is not None:
            plt.figure(figsize=(6, 5))
            indices = np.argsort(importance)
            plt.barh(range(len(importance)), importance[indices], align='center')
            plt.yticks(range(len(importance)), [f"Feature {i}" for i in indices])
            plt.xlabel("Relative Importance")
            plt.title(f"{title} - Feature Importance")
            plt.tight_layout()
            res['plots'].append(self._save_plot("classification_importance"))

        # 3. Decision regions (PCA)
        res['plots'].append(await self.plot_decision_regions_pca(model, X_test, y_true))
        
        return res

    async def plot_decision_regions_pca(self, model, X, y, title="Decision regions (PCA)", cmap="viridis"):
        pca = PCA(n_components=2)
        X_pca = pca.fit_transform(X)

        x_min, x_max = X_pca[:, 0].min() - 1.0, X_pca[:, 0].max() + 1.0
        y_min, y_max = X_pca[:, 1].min() - 1.0, X_pca[:, 1].max() + 1.0
        xx, yy = np.meshgrid(np.linspace(x_min, x_max, 300), np.linspace(y_min, y_max, 300))

        grid_pca = np.c_[xx.ravel(), yy.ravel()]
        grid_original = pca.inverse_transform(grid_pca)
        Z = model.predict(grid_original)
        Z = Z.reshape(xx.shape).astype(float) if Z.dtype.kind in 'U S' else Z.reshape(xx.shape)

        plt.figure(figsize=(7, 6))
        plt.contourf(xx, yy, Z, alpha=0.3, cmap=cmap)
        plt.scatter(X_pca[:, 0], X_pca[:, 1], c=y, cmap=cmap, edgecolor="k", s=40)
        plt.xlabel("PC1"); plt.ylabel("PC2")
        plt.title(title); plt.grid(alpha=0.2); plt.tight_layout()
        
        return self._save_plot("decision_regions")
