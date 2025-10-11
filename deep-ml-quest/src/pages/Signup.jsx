import React, { useState, memo } from "react";
import supabase from "../supabaseClient";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
          },
        },
      });

      if (error) throw error;
      console.log("Signup successful:", data);
      alert("Signup successful!");
      navigate("/login");
    } catch (error) {
      alert(error.message || "Error signing up");
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
          Create Account
        </h2>
        <p className="text-center text-gray-400 text-sm mb-6">
          Sign up to get started
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-300 text-sm mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 text-white placeholder-gray-500 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 text-white placeholder-gray-500 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
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
            className="w-full py-2 text-white font-semibold bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-transform transform hover:scale-[1.02]"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default memo(Signup);
