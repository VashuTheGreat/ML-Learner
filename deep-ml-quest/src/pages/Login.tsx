import React, { useState } from "react";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-md border border-purple-200">
        <h2 className="text-3xl font-extrabold text-center mb-6 text-purple-700 drop-shadow-sm">
          {isLogin ? "Welcome Back 👋" : "Create an Account ✨"}
        </h2>

        <form className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-purple-700 text-sm mb-1 font-medium">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-800 placeholder-gray-400"
              />
            </div>
          )}

          <div>
            <label className="block text-purple-700 text-sm mb-1 font-medium">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-800 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-purple-700 text-sm mb-1 font-medium">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-800 placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition duration-300 shadow-md"
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-gray-700 mt-6">
          {isLogin ? "Don’t have an account?" : "Already have an account?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-700 font-semibold ml-1 hover:underline"
          >
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </p>
      </div>
    </div>
  );
};


export default Login;