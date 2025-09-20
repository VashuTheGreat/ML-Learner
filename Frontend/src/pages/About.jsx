import React from "react";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      {/* Heading */}
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        About Our Platform
      </h1>

      {/* Intro Section */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <p className="text-lg text-gray-600 leading-relaxed">
          This platform allows you to explore and test multiple{" "}
          <span className="font-semibold text-blue-600">
            Machine Learning Models
          </span>{" "}
          in one place. Whether you are a beginner learning ML concepts or a
          developer testing model performance, this platform is designed to help
          you.
        </p>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
        <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold text-blue-600 mb-3">
            🎯 Easy to Use
          </h2>
          <p className="text-gray-600 text-sm">
            Test models with just one click and get instant results without
            complex setup.
          </p>
        </div>
        <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold text-blue-600 mb-3">
            📊 Performance Metrics
          </h2>
          <p className="text-gray-600 text-sm">
            Compare models based on accuracy, speed, and efficiency in real-time.
          </p>
        </div>
        <div className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold text-blue-600 mb-3">
            🚀 Multiple Models
          </h2>
          <p className="text-gray-600 text-sm">
            From Random Forest to Neural Networks, explore different algorithms
            at one place.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition"
        >
          Explore Models
        </button>
      </div>
    </div>
  );
};

export default About;
