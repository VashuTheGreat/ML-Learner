import React from "react";
import { useNavigate } from "react-router-dom";

const modelsData = [
  {
    name: "Random Forest",
    description: "Ensemble learning method for classification and regression.",
    accuracy: 92,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/7/76/Random_forest_diagram_complete.png",
  },
  {
    name: "Logistic Regression",
    description: "Simple and effective model for binary classification tasks.",
    accuracy: 85,
    image:
      "https://miro.medium.com/v2/resize:fit:720/format:webp/1*2a2jQydx7l_6r5nCF3YkAQ.png",
  },
  {
    name: "Neural Network",
    description: "Deep learning model capable of learning complex patterns.",
    accuracy: 95,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/e/e4/Artificial_neural_network.svg",
  },
  {
    name: "Support Vector Machine (SVM)",
    description: "Effective in high dimensional spaces for classification.",
    accuracy: 89,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/2/2a/Svm_max_sep_hyperplane_with_margin.png",
  },
  {
    name: "Decision Tree",
    description: "Tree-based model for decision making and classification.",
    accuracy: 80,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/f/f7/CART_tree_titanic_survivors.png",
  },
  {
    name: "K-Nearest Neighbors (KNN)",
    description: "Simple instance-based learning algorithm.",
    accuracy: 78,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/e/e7/KnnClassification.svg",
  },
  {
    name: "Naive Bayes",
    description: "Probabilistic model based on Bayes' theorem.",
    accuracy: 82,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/6/67/Bayes%27_Theorem_MMB_01.jpg",
  },
];

const Models = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <h1 className="text-3xl font-bold text-center mb-10">
        Available Machine Learning Models
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modelsData.map((model, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-4"
          >
            <img
              src={model.image}
              alt={model.name}
              className="w-full h-40 object-cover rounded-md mb-4"
            />
            <h2 className="text-xl font-semibold">{model.name}</h2>
            <p className="text-gray-600 text-sm mb-3">{model.description}</p>

            <div className="mb-2 text-sm font-medium text-gray-700">
              Accuracy: {model.accuracy}%
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${model.accuracy}%` }}
              ></div>
            </div>

            <button
              onClick={() => navigate("/")}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Try Model
            </button>
          </div>
        ))}
      </div>

      {/* Explore More button */}
      <div className="flex justify-center mt-10">
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
        >
          Explore More
        </button>
      </div>
    </div>
  );
};

export default Models;
