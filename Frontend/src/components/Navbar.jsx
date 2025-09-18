import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo / App Name */}
          <div className="flex-shrink-0">
            <h1 className="text-white text-2xl font-bold">ML Learner</h1>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-6">
            <Link
              to="/"
              className="text-white hover:text-gray-200 font-medium transition duration-200"
            >
              Home
            </Link>
            <Link
              to="/models"
              className="text-white hover:text-gray-200 font-medium transition duration-200"
            >
              Models
            </Link>
            <Link
              to="/about"
              className="text-white hover:text-gray-200 font-medium transition duration-200"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-white hover:text-gray-200 font-medium transition duration-200"
            >
              Contact
            </Link>
          </div>

          {/* Button (optional) */}
          <div className="hidden md:flex">
            <button className="bg-white text-indigo-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition duration-200">
              Try Model
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
