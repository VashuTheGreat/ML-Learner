import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Models from "./pages/Models";
import Contact from "./pages/Contact";
import TryModel from "./pages/TryModel";
import About from "./pages/About";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />


        <Route path="/login" element={<Login />} />
        <Route path="/models" element={<Models />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/trymodel" element={<TryModel />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
