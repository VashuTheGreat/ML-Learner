import React, { useState } from "react";
import { BookOpen, FileText, Download, Search } from "lucide-react";

const Notes = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const pdfFiles = [
    {
      name: "Hands-On-ML-Notes.pdf",
      title: "Handwritten Machine Learning Notes",
      description: "Comprehensive handwritten notes on machine learning.",
      category: "Machine Learning"
    },
    {
      name: "CentralLimitTheorem.pdf",
      title: "Central Limit Theorem",
      description: "Detailed explanation with examples of the central limit theorem.",
      category: "Statistics"
    },
    {
      name: "Deep Learning - Andrew NG.pdf",
      title: "Deep Learning - Andrew NG",
      description: "A must-read deep learning resource by Andrew NG.",
      category: "Deep Learning"
    },
    {
      name: "into_to_data_visualisation.pdf",
      title: "Introduction to Data Visualization",
      description: "Beginner's guide to data visualization concepts and tools.",
      category: "Data Science"
    },
    {
      name: "Hands-On_Machine_Learning_with_Scikit-Learn-Keras-and-TensorFlow-2nd-Edition-Aurelien-Geron[1].pdf",
      title: "Hands-On Machine Learning",
      description: "Practical guide with Scikit-Learn, Keras, and TensorFlow.",
      category: "Machine Learning"
    },
    {
      name: "Introduction_to_Data_Science.pdf",
      title: "Introduction to Data Science",
      description: "Fundamentals of data science concepts and applications.",
      category: "Data Science"
    },
    {
      name: "mysql.pdf",
      title: "MySQL Guide",
      description: "Comprehensive guide to MySQL database concepts.",
      category: "Database"
    },
    {
      name: "NumpyHandbook.pdf",
      title: "NumPy Handbook",
      description: "A practical guide for scientific computing with NumPy.",
      category: "Python"
    },
    {
      name: "Pandas-Handbook.pdf",
      title: "Pandas Handbook",
      description: "Guide to data analysis using Pandas.",
      category: "Python"
    },
    {
      name: "Probability.pdf",
      title: "Probability Theory",
      description: "Foundations and problems in probability theory.",
      category: "Statistics"
    },
    {
      name: "probabilityDistribution.pdf",
      title: "Probability Distributions",
      description: "In-depth exploration of probability distributions.",
      category: "Statistics"
    },
    {
      name: "Python_Refresher_2.pdf",
      title: "Python Refresher",
      description: "Quick refresher course for Python programming.",
      category: "Python"
    },
    {
      name: "Understanding_the_Conda_Environment.pdf",
      title: "Understanding the Conda Environment",
      description: "Guide to managing Python environments with Conda.",
      category: "Python"
    },
    {
      name: "webscraping.pdf",
      title: "Web Scraping",
      description: "Introduction and techniques for web scraping with Python.",
      category: "Python"
    }
  ];

  const filteredPdfs = pdfFiles.filter(pdf =>
    pdf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pdf.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pdf.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoryColors = {
    "Machine Learning": "from-purple-500 to-pink-500",
    "Deep Learning": "from-blue-500 to-cyan-500",
    "Data Science": "from-green-500 to-emerald-500",
    "Statistics": "from-orange-500 to-red-500",
    "Database": "from-yellow-500 to-orange-500",
    "Python": "from-indigo-500 to-purple-500"
  };

  return (
    <div className="min-h-screen transition-all duration-500 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Notes Library
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {filteredPdfs.length} resources available
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search notes by title, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border-2 border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500 transition-all duration-300 shadow-lg"
            />
          </div>
        </div>
      </div>

      {/* PDF Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPdfs.map((pdf, index) => (
            <div
              key={index}
              className="group relative rounded-2xl overflow-hidden bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Category Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${categoryColors[pdf.category]} shadow-lg`}>
                  {pdf.category}
                </span>
              </div>

              {/* PDF Preview */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                <iframe
                  src={`/${encodeURIComponent(pdf.name)}`}
                  className="w-full h-full"
                  title={pdf.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/80 dark:from-gray-800/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight flex-1">
                    {pdf.title}
                  </h2>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                  {pdf.description}
                </p>

                {/* Action Button */}
                <a
                  href={`/${encodeURIComponent(pdf.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 hover:from-blue-600 hover:to-purple-600 dark:hover:from-blue-500 dark:hover:to-purple-500 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Download className="w-4 h-4" />
                  View PDF
                </a>
              </div>
            </div>
          ))}
        </div>

        {filteredPdfs.length === 0 && (
          <div className="text-center py-20">
            <FileText className="w-20 h-20 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No notes found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;