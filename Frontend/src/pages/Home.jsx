import React, { useState } from "react";
import axios from "axios";

const Home = () => {
  const [model, setModel] = useState("");
  const [dataset, setDataset] = useState("");
  const [hyperparams, setHyperparams] = useState({});
  const [modelPerformance, setModelPerformance] = useState(null);
  const [searching,setsearching]=useState(true);

  const dataSets = ["iris", "titanic", "mpg", "penguins", "diamonds", "car_crashes"];

  const modelHyperparams = {
    RandomForestClassifier: { n_estimators: 100, max_depth: 5, criterion: "gini" },
    DecisionTreeClassifier: { max_depth: 5, criterion: "gini" },
    GradientBoostingClassifier: { n_estimators: 100, learning_rate: 0.1, max_depth: 3 },
    LogisticRegression: { penalty: "l2", C: 1.0, solver: "lbfgs" },
    KNeighborsClassifier: { n_neighbors: 5, algorithm: "auto" },
    RandomForestRegressor: { n_estimators: 100, max_depth: 5 },
    LinearRegression: { fit_intercept: true },
  };

  const handleModelChange = (selectedModel) => {
    setModel(selectedModel);
    setHyperparams(modelHyperparams[selectedModel] || {});
  };

  const handleParamChange = (param, value) => {
    setHyperparams({ ...hyperparams, [param]: value });
  };

  const handleRunModel = async () => {
  setsearching(true); // ✅ correct
  if (!model || !dataset) {
    alert("Please select both a model and a dataset.");
    setsearching(false); // add this to reset if validation fails
    return;
  }
  try {
    const host = import.meta.env.VITE_HOST || "http://localhost:5000";

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
    setsearching(false); // ✅ correct usage
  } catch (error) {
    console.error(error);
    alert("Error running the model. Check console for details.");
    setsearching(false); // make sure searching is false on error
  }
};


  return (
    <div className="flex flex-col md:flex-row p-6 gap-6">
      <div className="md:w-1/3 bg-gray-100 p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Select Model & Parameters</h2>
        <label className="block mb-2 font-medium">Choose Model:</label>
        <select
          value={model}
          onChange={(e) => handleModelChange(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        >
          <option value="">--Select Model--</option>
          {Object.keys(modelHyperparams).map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <label className="block mb-2 font-medium">Choose Dataset:</label>
        <select
          value={dataset}
          onChange={(e) => setDataset(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        >
          <option value="">--Select Dataset--</option>
          {dataSets.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

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
              <div>Accuracy: {modelPerformance.result.accuracy*100}%</div>
              <div>precision: {modelPerformance.result.precision}</div>
              <div>Recall: {modelPerformance.result.recall}</div>
              <div>type: {modelPerformance.result.type}</div>

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
