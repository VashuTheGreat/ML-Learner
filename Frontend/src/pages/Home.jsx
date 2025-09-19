import React, { useState } from "react";
import axios from "axios";

const Home = () => {
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


  const handleModelChange = (selectedModel) => {
    setModel(selectedModel);
    setDataset(""); // reset dataset on model change
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
        {
          data_name: dataset,
          model_name: model,
          params: hyperparams,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      setModelPerformance(response.data);
      setSearching(false);
    } catch (error) {
      console.error(error);
      alert("Error running the model. Check console for details.");
      setSearching(false);
    }
  };

  // ✅ Get dataset options based on model type
  const getAvailableDatasets = () => {
    if (classifiers.includes(model)) return datasetGroups.classification;
    if (regressors.includes(model)) return datasetGroups.regression;
    return [];
  };

  return (
    <div className="flex flex-col md:flex-row p-6 gap-6">
      <div className="md:w-1/3 bg-gray-100 p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Select Model & Parameters</h2>

        {/* Model Selector */}
        <label className="block mb-2 font-medium">Choose Model:</label>
        <select
          value={model}
          onChange={(e) => handleModelChange(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        >
          <option value="">--Select Model--</option>
          <optgroup label="Classification Models">
            {classifiers.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </optgroup>
          <optgroup label="Regression Models">
            {regressors.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </optgroup>
        </select>

        {/* Dataset Selector */}
        <label className="block mb-2 font-medium">Choose Dataset:</label>
        <select
          value={dataset}
          onChange={(e) => setDataset(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        >
          <option value="">--Select Dataset--</option>
          {getAvailableDatasets().map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* Hyperparams */}
        {model && hyperparams && Object.keys(hyperparams).length > 0 && (
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Hyperparameters:</h3>
            {Object.keys(hyperparams).map((param) => (
              <div key={param} className="mb-2">
                <label className="block mb-1">{param}:</label>
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

        <button
          onClick={handleRunModel}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          Run Model
        </button>
      </div>

      {/* Output Panel */}
    <div className="md:w-2/3 bg-gray-50 p-6 rounded-lg shadow overflow-auto max-h-[600px]">
        <h2 className="text-2xl font-bold mb-4">Model Output</h2>
        {modelPerformance &&!searching ? (
          <>
          
            

            {modelPerformance.result.plots &&
              modelPerformance.result.plots.map((base64, index) => (
                <img
                  key={index}
                  src={`data:image/png;base64,${base64}`}
                  alt={`plot-${index}`}
                  className="mb-4"
                />
              ))}
       <div className="grid grid-cols-2 gap-4 p-6 bg-white text-gray-900 rounded-2xl shadow-lg max-w-lg mx-auto border">
  <h2 className="col-span-2 text-xl font-bold text-center mb-2">📊 Model Performance</h2>

  <div className="p-3 bg-gray-100 rounded-lg shadow-sm">
    <p className="text-sm text-gray-500">Accuracy</p>
    <p className="text-lg font-semibold">{modelPerformance.result.accuracy ? modelPerformance.result.accuracy : "Not Found"}%</p>
  </div>

  <div className="p-3 bg-gray-100 rounded-lg shadow-sm">
    <p className="text-sm text-gray-500">MAE</p>
    <p className="text-lg font-semibold">{modelPerformance.result.mae ? modelPerformance.result.mae : "Not Found"}</p>
  </div>

  <div className="p-3 bg-gray-100 rounded-lg shadow-sm">
    <p className="text-sm text-gray-500">MSE</p>
    <p className="text-lg font-semibold">{modelPerformance.result.mse ? modelPerformance.result.mse : "Not Found"}</p>
  </div>

  <div className="p-3 bg-gray-100 rounded-lg shadow-sm">
    <p className="text-sm text-gray-500">R²</p>
    <p className="text-lg font-semibold">{modelPerformance.result.r2 ? modelPerformance.result.r2 : "Not Found"}</p>
  </div>

  <div className="p-3 bg-gray-100 rounded-lg shadow-sm">
    <p className="text-sm text-gray-500">RMSE</p>
    <p className="text-lg font-semibold">{modelPerformance.result.rmse ? modelPerformance.result.rmse : "Not Found"}%</p>
  </div>

  <div className="p-3 bg-gray-100 rounded-lg shadow-sm">
    <p className="text-sm text-gray-500">Precision</p>
    <p className="text-lg font-semibold">{modelPerformance.result.precision}</p>
  </div>

  <div className="p-3 bg-gray-100 rounded-lg shadow-sm">
    <p className="text-sm text-gray-500">Recall</p>
    <p className="text-lg font-semibold">{modelPerformance.result.recall}</p>
  </div>

  <div className="p-3 bg-gray-100 rounded-lg shadow-sm col-span-2">
    <p className="text-sm text-gray-500">Model Type</p>
    <p className="text-lg font-semibold">{modelPerformance.result.type}</p>
  </div>
</div>


          </>
        ) : (
          <p className="text-gray-500">Output will appear here after running the model.</p>
        )}
        {searching && <p className="text-blue-500">Running model, please wait...</p>}

      </div>
    </div>
  );
};

export default Home;