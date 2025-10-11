import React, { useState, memo } from "react";
import supabase from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";

const Login = ({ setToken }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;
      console.log("Login success:", data);
      setToken(data);
      alert("Sign-in successful!");
      navigate("/dashboard");
    } catch (error) {
      alert(error.message || "Error signing in");
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <div className="w-full max-w-sm md:max-w-md p-6 sm:p-8 bg-gray-900/70 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-700">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-2">
          Welcome Back
        </h2>
        <p className="text-center text-gray-400 text-sm mb-6">
          Login to continue
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-300 text-sm mb-2">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 text-white placeholder-gray-500 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition gap-11px"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 text-white placeholder-gray-500 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <button
            type="submit"
            className="w-400px py-2 text-white font-semibold bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-transform transform hover:scale-[1.02]"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-400 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default memo(Login);
