import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, confusion_matrix, ConfusionMatrixDisplay

models = {
    "RandomForestClassifier": RandomForestClassifier
}

class Model:
    def __init__(self, data_name):
        self.data_name = data_name
        self.data = None
        self.model = None

    @staticmethod
    def dataspliter(data: pd.DataFrame, columnToPredict):
        X, y = data.drop(columns=[columnToPredict]), data[columnToPredict]
        x_train, x_test, y_train, y_test = train_test_split(
            X, y,
            test_size=0.2,
            shuffle=True,
            random_state=42
        )
        return x_train, x_test, y_train, y_test

    def loadData(self):
        self.data = sns.load_dataset(self.data_name)

    @staticmethod
    def dataCleaner(data: pd.DataFrame):
        df = data.copy()
        df = df.drop_duplicates()

        # 1. Drop missing values
        df.dropna(inplace=True)

        # 2. Convert categorical strings to lowercase
        for col in df.select_dtypes(include=['object', 'category']).columns:
            df[col] = df[col].astype(str).str.lower()
        for col in df.select_dtypes(include=['bool']).columns:
            df[col] = df[col].astype(int)

        # 3. Encode categorical columns
        encoders = {}
        for col in df.select_dtypes(include=['object', 'category']).columns:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col])
            encoders[col] = le

        return df, encoders

    def TrainModel(self, model_name, columnToPredict):
        if model_name not in models:
            raise ValueError("Model doesn't exist")

        # Instantiate model
        self.model = models[model_name]()  

        x_train, x_test, y_train, y_test = self.dataspliter(self.data, columnToPredict)

        self.model.fit(x_train, y_train)
        return self.ValidateModel(x_test=x_test, y_test=y_test, model_name=model_name)

    def ValidateModel(self, x_test, y_test, model_name):
        preds = self.model.predict(x_test)

        acc = accuracy_score(y_test, preds)
        prec = precision_score(y_test, preds, average="weighted", zero_division=0)
        rec = recall_score(y_test, preds, average="weighted", zero_division=0)
        cm = confusion_matrix(y_test, preds)

        # Confusion Matrix Plot
        disp = ConfusionMatrixDisplay(confusion_matrix=cm)
        disp.plot(cmap=plt.cm.Blues)
        plt.title(f"{model_name} - Confusion Matrix")
        plt.show()

        return {
            "accuracy": acc,
            "precision": prec,
            "recall": rec,
            "confusion_matrix": cm.tolist()
        }
