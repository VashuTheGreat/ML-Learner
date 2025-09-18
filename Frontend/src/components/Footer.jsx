import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-gray-200 py-6 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        
        {/* Logo / App Name */}
        <div className="text-lg font-bold mb-4 md:mb-0">
          ML Learner
        </div>

        {/* Navigation Links */}
        <div className="flex space-x-6 mb-4 md:mb-0">
          <a href="/" className="hover:text-white transition duration-200">Home</a>
          <a href="/models" className="hover:text-white transition duration-200">Models</a>
          <a href="/about" className="hover:text-white transition duration-200">About</a>
          <a href="/contact" className="hover:text-white transition duration-200">Contact</a>
        </div>

        {/* Copyright */}
        <div className="text-sm">
          &copy; {new Date().getFullYear()} ML Learner. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
