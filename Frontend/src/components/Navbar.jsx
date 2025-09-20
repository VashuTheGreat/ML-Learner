import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) setUser(JSON.parse(storedUser));

  const handleLoginEvent = () => {
    const updatedUser = localStorage.getItem("user");
    if (updatedUser) setUser(JSON.parse(updatedUser));
  };

  window.addEventListener("userLoggedIn", handleLoginEvent);

  return () => {
    window.removeEventListener("userLoggedIn", handleLoginEvent);
  };
}, []);


  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setDropdownOpen(false);
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
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

          {/* Right section */}
          <div className="hidden md:flex items-center space-x-4 relative">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <img
                    src={user.image || "/default-avatar.png"}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-white font-medium">{user.name}</span>
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-2 z-50">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="bg-white text-indigo-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                Try Model
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
