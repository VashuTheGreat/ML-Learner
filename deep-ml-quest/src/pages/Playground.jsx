import { useState } from "react";
import axios from "axios";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Download, Upload, Settings, BarChart3 } from "lucide-react";

const Playground = () => {
  const [model, setModel] = useState("");
  const [dataset, setDataset] = useState("");
  const [hyperparams, setHyperparams] = useState({});
  const [modelPerformance, setModelPerformance] = useState(null);
  const [searching, setSearching] = useState(false);

const datasetGroups = {
  classification: [
    "iris",
    "titanic",
    "penguins",
    "anagrams",
    "attention",
    "dots",
    "glue"
  ],
  regression: [
    "mpg",
    "diamonds",
    "car_crashes",
    "tips",
    "anscombe",
    "brain_networks",
    "dowjones",
    "exercise",
    "flights",
    "fmri",
    "geyser",
    "healthexp",
    "planets",
    "seaice",
    "taxis"
  ]
};


   const classifiers = [
    "RandomForestClassifier", "GradientBoostingClassifier", "AdaBoostClassifier", 
    "BaggingClassifier", "DecisionTreeClassifier", "ExtraTreeClassifier", 
    "LogisticRegression", "RidgeClassifier", "SGDClassifier", 
    "PassiveAggressiveClassifier", "Perceptron", "SVC", "LinearSVC", 
    "NuSVC", "KNeighborsClassifier", "GaussianNB", "MultinomialNB", 
    "BernoulliNB", "MLPClassifier", "XGBClassifier", "LGBMClassifier", 
    "CatBoostClassifier"
  ];

  const regressors = [
    "LinearRegression", "Ridge", "Lasso", "ElasticNet", "SGDRegressor", 
    "BayesianRidge", "HuberRegressor", "PassiveAggressiveRegressor", 
    "RANSACRegressor", "TheilSenRegressor", "DecisionTreeRegressor", 
    "ExtraTreeRegressor", "RandomForestRegressor", "GradientBoostingRegressor", 
    "AdaBoostRegressor", "BaggingRegressor", "KNeighborsRegressor", 
    "SVR", "LinearSVR", "NuSVR", "KernelRidge", "MLPRegressor", 
    "XGBRegressor", "LGBMRegressor", "CatBoostRegressor"
  ];

  const modelHyperparams = {
  // 🟢 CLASSIFIERS
  RandomForestClassifier: { n_estimators: 100, max_depth: 5, criterion: "gini" },
  GradientBoostingClassifier: { n_estimators: 100, learning_rate: 0.1, max_depth: 3 },
  AdaBoostClassifier: { n_estimators: 50, learning_rate: 1.0 },
  BaggingClassifier: { n_estimators: 10, max_samples: 1.0 },
  DecisionTreeClassifier: { max_depth: 5, criterion: "gini" },
  ExtraTreeClassifier: { max_depth: 5, criterion: "gini" },
  LogisticRegression: { penalty: "l2", C: 1.0, solver: "lbfgs" },
  RidgeClassifier: { alpha: 1.0 },
  SGDClassifier: { loss: "hinge", penalty: "l2", max_iter: 1000 },
  PassiveAggressiveClassifier: { C: 1.0, max_iter: 1000 },
  Perceptron: { penalty: null, alpha: 0.0001 },
  SVC: { C: 1.0, kernel: "rbf" },
  LinearSVC: { C: 1.0 },
  NuSVC: { nu: 0.5, kernel: "rbf" },
  KNeighborsClassifier: { n_neighbors: 5, algorithm: "auto" },
  GaussianNB: {},
  MultinomialNB: { alpha: 1.0 },
  BernoulliNB: { alpha: 1.0 },
  MLPClassifier: { hidden_layer_sizes: [100], activation: "relu", solver: "adam", max_iter: 200 },
  XGBClassifier: { n_estimators: 100, learning_rate: 0.1, max_depth: 3 },
  LGBMClassifier: { n_estimators: 100, learning_rate: 0.1, num_leaves: 31 },
  CatBoostClassifier: { iterations: 100, depth: 6, learning_rate: 0.1 },

  // 🔵 REGRESSORS
  LinearRegression: { fit_intercept: true },
  Ridge: { alpha: 1.0 },
  Lasso: { alpha: 1.0 },
  ElasticNet: { alpha: 1.0, l1_ratio: 0.5 },
  SGDRegressor: { loss: "squared_error", penalty: "l2", max_iter: 1000 },
  BayesianRidge: {},
  HuberRegressor: { epsilon: 1.35, alpha: 0.0001 },
  PassiveAggressiveRegressor: { C: 1.0, max_iter: 1000 },
  RANSACRegressor: { max_trials: 100 },
  TheilSenRegressor: { max_subpopulation: 1e4 },
  DecisionTreeRegressor: { max_depth: 5, criterion: "squared_error" },
  ExtraTreeRegressor: { max_depth: 5, criterion: "squared_error" },
  RandomForestRegressor: { n_estimators: 100, max_depth: 5 },
  GradientBoostingRegressor: { n_estimators: 100, learning_rate: 0.1, max_depth: 3 },
  AdaBoostRegressor: { n_estimators: 50, learning_rate: 1.0 },
  BaggingRegressor: { n_estimators: 10, max_samples: 1.0 },
  KNeighborsRegressor: { n_neighbors: 5, algorithm: "auto" },
  SVR: { C: 1.0, kernel: "rbf" },
  LinearSVR: { C: 1.0 },
  NuSVR: { nu: 0.5, C: 1.0, kernel: "rbf" },
  KernelRidge: { alpha: 1.0, kernel: "linear" },
  MLPRegressor: { hidden_layer_sizes: [100], activation: "relu", solver: "adam", max_iter: 200 },
  XGBRegressor: { n_estimators: 100, learning_rate: 0.1, max_depth: 3 },
  LGBMRegressor: { n_estimators: 100, learning_rate: 0.1, num_leaves: 31 },
  CatBoostRegressor: { iterations: 100, depth: 6, learning_rate: 0.1 }
};

  const handleModelChange = (selectedModel) => {
    setModel(selectedModel);
    setDataset("");
    setHyperparams(modelHyperparams[selectedModel] || {});
  };

  const handleParamChange = (param, value) => {
    setHyperparams({ ...hyperparams, [param]: value });
  };

  const handleRunModel = async () => {
    setSearching(true);
    if (!model || !dataset) {
      alert("Please select both a model and a dataset.");
      setSearching(false);
      return;
    }
    try {
      const host = import.meta.env.VITE_HOST || "http://localhost:3000";
      const response = await axios.post(
        `${host}/model`,
        { data_name: dataset, model_name: model, params: hyperparams },
        { headers: { "Content-Type": "application/json" } }
      );
      setModelPerformance(response.data);
    } catch (error) {
      console.error(error);
      alert("Error running the model.");
    }
    setSearching(false);
  };

  const getAvailableDatasets = () => {
    if (classifiers.includes(model)) return datasetGroups.classification;
    if (regressors.includes(model)) return datasetGroups.regression;
    return [];
  };

  const isClassification = classifiers.includes(model);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">ML Playground</h1>
          <p className="text-lg text-muted-foreground">
            Experiment with machine learning models and datasets interactively
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Model Configuration */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" /> Model Configuration
                </CardTitle>
                <CardDescription>Choose and configure your ML model</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Select Model</Label>
                  <Select value={model} onValueChange={handleModelChange}>
                    <SelectTrigger><SelectValue placeholder="Choose a model" /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(modelHyperparams).map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Hyperparameters */}
                {model && hyperparams && Object.keys(hyperparams).length > 0 && (
                  <div className="space-y-3">
                    <Label>Hyperparameters</Label>
                    {Object.keys(hyperparams).map((param) => (
                      <div key={param}>
                        <Label>{param}</Label>
                        <input
                          type={typeof hyperparams[param] === "number" ? "number" : "text"}
                          value={hyperparams[param]}
                          onChange={(e) =>
                            handleParamChange(
                              param,
                              typeof hyperparams[param] === "number"
                                ? Number(e.target.value)
                                : e.target.value
                            )
                          }
                          className="w-full p-2 border rounded"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Dataset Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" /> Dataset
                </CardTitle>
                <CardDescription>Choose your training data</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={dataset} onValueChange={setDataset}>
                  <SelectTrigger><SelectValue placeholder="Choose dataset" /></SelectTrigger>
                  <SelectContent>
                    {getAvailableDatasets().map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Run Model */}
            <div className="space-y-3">
              <Button
                onClick={handleRunModel}
                disabled={searching}
                className="w-full"
                size="lg"
              >
                <Play className="mr-2 h-4 w-4" />
                {searching ? "Training..." : "Run Model"}
              </Button>
            </div>
          </div>

          {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
  <Card>
    {/* Card Header */}
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5" /> Model Performance
      </CardTitle>
      <CardDescription>
        See the metrics and plots of your model
      </CardDescription>
    </CardHeader>

    {/* Card Content */}
    
    <CardContent>
      {modelPerformance ? (
        <>
          {/* Metrics Boxes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg shadow">
            {isClassification ? (
              <>
                <div className="p-4 bg-blue-100 rounded-lg text-blue-800 font-semibold text-center">
                  Accuracy: {modelPerformance?.result?.accuracy !== undefined ? modelPerformance.result.accuracy.toFixed(2) : "-"}
                </div>
                <div className="p-4 bg-green-100 rounded-lg text-green-800 font-semibold text-center">
                  Precision: {modelPerformance?.result?.precision !== undefined ? modelPerformance.result.precision.toFixed(2) : "-"}
                </div>
                <div className="p-4 bg-yellow-100 rounded-lg text-yellow-800 font-semibold text-center">
                  Recall: {modelPerformance?.result?.recall !== undefined ? modelPerformance.result.recall.toFixed(2) : "-"}
                </div>
                <div className="p-4 bg-purple-100 rounded-lg text-purple-800 font-semibold text-center">
                  F1-Score: {modelPerformance?.result?.f1Score !== undefined ? modelPerformance.result.f1Score.toFixed(2) : "-"}
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-red-100 rounded-lg text-red-800 font-semibold text-center">
                  MSE: {modelPerformance?.result?.mse !== undefined ? modelPerformance.result.mse.toFixed(2) : "-"}
                </div>
                <div className="p-4 bg-indigo-100 rounded-lg text-indigo-800 font-semibold text-center">
                  MAE: {modelPerformance?.result?.mae !== undefined ? modelPerformance.result.mae.toFixed(2) : "-"}
                </div>
                <div className="p-4 bg-teal-100 rounded-lg text-teal-800 font-semibold text-center">
                  R²: {modelPerformance?.result?.r2 !== undefined ? modelPerformance.result.r2.toFixed(2) : "-"}
                </div>
                <div className="p-4 bg-pink-100 rounded-lg text-pink-800 font-semibold text-center">
                  RMSE: {modelPerformance?.result?.rmse !== undefined ? modelPerformance.result.rmse.toFixed(2) : "-"}
                </div>
              </>
            )}
          </div>

          {/* Plots */}
          {modelPerformance.result?.plots?.length > 0 && (
            <div className="mt-6 space-y-4">
              {modelPerformance.result.plots.map((base64, index) => (
                <img
                  key={index}
                  src={`data:image/png;base64,${base64}`}
                  alt={`plot-${index}`}
                  className="rounded shadow"
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <p className="text-muted-foreground">Run a model to see results.</p>
      )}
    </CardContent>
  </Card>
</div>

        </div>
      </div>
    </div>
  );
};

export default Playground;
