import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import io, base64

from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, confusion_matrix,
    r2_score, mean_absolute_error, mean_squared_error
)

# Classification Models
from sklearn.ensemble import (
    RandomForestClassifier, GradientBoostingClassifier, AdaBoostClassifier, BaggingClassifier
)
from sklearn.tree import DecisionTreeClassifier, ExtraTreeClassifier
from sklearn.linear_model import (
    LogisticRegression, RidgeClassifier, SGDClassifier, PassiveAggressiveClassifier, Perceptron
)
from sklearn.svm import SVC, LinearSVC, NuSVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB, MultinomialNB, BernoulliNB
from sklearn.neural_network import MLPClassifier
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from catboost import CatBoostClassifier

# Regression Models
from sklearn.linear_model import (
    LinearRegression, Ridge, Lasso, ElasticNet, SGDRegressor, BayesianRidge,
    HuberRegressor, PassiveAggressiveRegressor, RANSACRegressor, TheilSenRegressor
)
from sklearn.tree import DecisionTreeRegressor, ExtraTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, AdaBoostRegressor, BaggingRegressor
from sklearn.svm import SVR, LinearSVR, NuSVR
from sklearn.neighbors import KNeighborsRegressor
from sklearn.kernel_ridge import KernelRidge
from sklearn.neural_network import MLPRegressor
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor
from catboost import CatBoostRegressor


# ========================
# All models dictionary
# ========================
models = {
    # Classification
    "RandomForestClassifier": RandomForestClassifier,
    "GradientBoostingClassifier": GradientBoostingClassifier,
    "AdaBoostClassifier": AdaBoostClassifier,
    "BaggingClassifier": BaggingClassifier,
    "DecisionTreeClassifier": DecisionTreeClassifier,
    "ExtraTreeClassifier": ExtraTreeClassifier,
    "LogisticRegression": LogisticRegression,
    "RidgeClassifier": RidgeClassifier,
    "SGDClassifier": SGDClassifier,
    "PassiveAggressiveClassifier": PassiveAggressiveClassifier,
    "Perceptron": Perceptron,
    "SVC": SVC,
    "LinearSVC": LinearSVC,
    "NuSVC": NuSVC,
    "KNeighborsClassifier": KNeighborsClassifier,
    "GaussianNB": GaussianNB,
    "MultinomialNB": MultinomialNB,
    "BernoulliNB": BernoulliNB,
    "MLPClassifier": MLPClassifier,
    "XGBClassifier": XGBClassifier,
    "LGBMClassifier": LGBMClassifier,
    "CatBoostClassifier": CatBoostClassifier,

    # Regression
    "LinearRegression": LinearRegression,
    "Ridge": Ridge,
    "Lasso": Lasso,
    "ElasticNet": ElasticNet,
    "SGDRegressor": SGDRegressor,
    "BayesianRidge": BayesianRidge,
    "HuberRegressor": HuberRegressor,
    "PassiveAggressiveRegressor": PassiveAggressiveRegressor,
    "RANSACRegressor": RANSACRegressor,
    "TheilSenRegressor": TheilSenRegressor,
    "DecisionTreeRegressor": DecisionTreeRegressor,
    "ExtraTreeRegressor": ExtraTreeRegressor,
    "RandomForestRegressor": RandomForestRegressor,
    "GradientBoostingRegressor": GradientBoostingRegressor,
    "AdaBoostRegressor": AdaBoostRegressor,
    "BaggingRegressor": BaggingRegressor,
    "KNeighborsRegressor": KNeighborsRegressor,
    "SVR": SVR,
    "LinearSVR": LinearSVR,
    "NuSVR": NuSVR,
    "KernelRidge": KernelRidge,
    "MLPRegressor": MLPRegressor,
    "XGBRegressor": XGBRegressor,
    "LGBMRegressor": LGBMRegressor,
    "CatBoostRegressor": CatBoostRegressor,
}


# ========================
# Model Wrapper
# ========================
class Model:
    def __init__(self, data_name):
        self.data_name = data_name
        self.data = None
        self.model = None

    @staticmethod
    def dataspliter(data: pd.DataFrame, columnToPredict):
        X, y = data.drop(columns=[columnToPredict]), data[columnToPredict]
        return train_test_split(X, y, test_size=0.2, shuffle=True, random_state=42)

    def loadData(self):
        self.data = sns.load_dataset(self.data_name)

    @staticmethod
    def dataCleaner(data: pd.DataFrame):
        df = data.copy().drop_duplicates().dropna()
        # lowercase categorical + encode
        for col in df.select_dtypes(include=['object', 'category']).columns:
            df[col] = df[col].astype(str).str.lower()
        for col in df.select_dtypes(include=['bool']).columns:
            df[col] = df[col].astype(int)

        encoders = {}
        for col in df.select_dtypes(include=['object', 'category']).columns:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col])
            encoders[col] = le
        return df, encoders

    def TrainModel(self, model_name, columnToPredict):
        if model_name not in models:
            raise ValueError("Model doesn't exist")
        self.model = models[model_name]()
        x_train, x_test, y_train, y_test = self.dataspliter(self.data, columnToPredict)
        self.model.fit(x_train, y_train)
        return self.ValidateModel(x_test, y_test, model_name)

    @staticmethod
    def buf(figures: list):
        buf = io.BytesIO()
        plt.savefig(buf, format="png", bbox_inches="tight")
        buf.seek(0)
        img_base64 = base64.b64encode(buf.read()).decode("utf-8")
        buf.close()
        plt.close()
        figures.append(img_base64)

    def plots(self, x_test, y_test, preds, isClassifier):
        figures = []
        if isClassifier:
            # Confusion Matrix
            cm = confusion_matrix(y_test, preds)
            plt.figure(figsize=(6, 5))
            sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", cbar=False)
            plt.xlabel("Predicted"); plt.ylabel("Actual")
            plt.title("Confusion Matrix Heatmap")
            self.buf(figures)

            # Decision Boundary (2D only)
            if x_test.shape[1] == 2:
                X, y = x_test.values, y_test.values
                h = .02
                x_min, x_max = X[:, 0].min() - 1, X[:, 0].max() + 1
                y_min, y_max = X[:, 1].min() - 1, X[:, 1].max() + 1
                xx, yy = np.meshgrid(np.arange(x_min, x_max, h),
                                     np.arange(y_min, y_max, h))
                Z = self.model.predict(np.c_[xx.ravel(), yy.ravel()]).reshape(xx.shape)
                plt.contourf(xx, yy, Z, alpha=0.3)
                plt.scatter(X[:, 0], X[:, 1], c=y, edgecolor="k", s=40)
                plt.title("Decision Boundary (2D)")
                self.buf(figures)

            # ROC Curve
            try:
                from sklearn.metrics import roc_curve, auc
                if len(np.unique(y_test)) == 2:
                    y_proba = self.model.predict_proba(x_test)[:, 1]
                    fpr, tpr, _ = roc_curve(y_test, y_proba)
                    roc_auc = auc(fpr, tpr)
                    plt.plot(fpr, tpr, color="darkorange", lw=2,
                             label=f"ROC curve (AUC={roc_auc:.2f})")
                    plt.plot([0, 1], [0, 1], "k--")
                    plt.xlabel("FPR"); plt.ylabel("TPR")
                    plt.title("ROC Curve"); plt.legend()
                    self.buf(figures)
            except: pass

            # Precision-Recall
            try:
                from sklearn.metrics import precision_recall_curve
                y_proba = self.model.predict_proba(x_test)[:, 1]
                precision, recall, _ = precision_recall_curve(y_test, y_proba)
                plt.plot(recall, precision, marker=".", color="blue")
                plt.xlabel("Recall"); plt.ylabel("Precision")
                plt.title("Precision-Recall Curve")
                self.buf(figures)
            except: pass

        else:
            # Regression: Predictions vs Actual
            plt.scatter(y_test, preds, alpha=0.6, color="blue", label="Predictions")
            plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()],
                     "r--", lw=2, label="Perfect Fit")
            plt.xlabel("Actual"); plt.ylabel("Predicted")
            plt.title("Regression Predictions vs Actual")
            plt.legend()
            self.buf(figures)

            # Residuals Plot
            residuals = y_test - preds
            plt.scatter(preds, residuals, alpha=0.6, color="purple")
            plt.axhline(y=0, color="r", linestyle="--")
            plt.xlabel("Predicted"); plt.ylabel("Residuals")
            plt.title("Residuals Plot")
            self.buf(figures)

            # Prediction vs Actual (time-series style)
            plt.plot(y_test.values, label="Actual", color="blue")
            plt.plot(preds, label="Predicted", color="orange")
            plt.legend(); plt.title("Prediction vs Actual")
            self.buf(figures)

        return figures

    def ValidateModel(self, x_test, y_test, model_name):
        preds = self.model.predict(x_test)
        if y_test.nunique() < 20 and y_test.dtype in ["int64", "int32"]:
            acc = accuracy_score(y_test, preds)
            prec = precision_score(y_test, preds, average="weighted", zero_division=0)
            rec = recall_score(y_test, preds, average="weighted", zero_division=0)
            figs = self.plots(x_test, y_test, preds, isClassifier=True)
            return {
                "type": "classification",
                "accuracy": acc,
                "precision": prec,
                "recall": rec,
                "confusion_matrix": confusion_matrix(y_test, preds).tolist(),
                "plots": figs
            }
        else:
            r2 = r2_score(y_test, preds)
            mae = mean_absolute_error(y_test, preds)
            mse = mean_squared_error(y_test, preds)
            rmse = mse ** 0.5
            figs = self.plots(x_test, y_test, preds, isClassifier=False)
            return {
                "type": "regression",
                "r2": r2,
                "mae": mae,
                "mse": mse,
                "rmse": rmse,
                "plots": figs
            }
