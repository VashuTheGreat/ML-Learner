# InterviewCraker

A comprehensive interview preparation and practice platform with AI-powered features, resume building, and performance tracking.

## 📋 Overview

InterviewCraker is a full-stack application designed to help users prepare for technical interviews, practice coding problems, build professional resumes, and track their performance over time.

## 🏗️ Project Structure

The project is organized into three main components:

### Backend (Node.js)
- **Location**: `Backend_node/`
- **Framework**: Express.js
- **Features**:
  - User authentication and management
  - Coding problem repository
  - Interview simulations
  - Performance tracking
  - Resume template management
  - File upload with Cloudinary integration
  - Redis caching
  - MongoDB database

### Frontend (React + TypeScript)
- **Location**: `pixel-perfect-ui/`
- **Framework**: React with Vite
- **Features**:
  - Interview practice interface
  - Dashboard with analytics
  - Resume builder
  - LinkedIn integration
  - Responsive UI with Tailwind CSS
  - Unit testing with Vitest

### Python Backend
- **Location**: `python_backend/`
- **Features**:
  - AI-powered features
  - Advanced data processing
  - MCP (Model Context Protocol) integration

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8+
- MongoDB
- Redis (optional, for caching)

### Installation

1. **Backend Node Setup**
   ```bash
   cd Backend_node
   npm install
   npm start
   ```

2. **Frontend Setup**
   ```bash
   cd pixel-perfect-ui
   npm install
   npm run dev
   ```

3. **Python Backend Setup**
   ```bash
   cd python_backend
   pip install -r requirements.txt
   python main.py
   ```

## 📁 Key Files

### Backend Node
- `src/app.js` - Express application setup
- `src/routes/` - API route definitions
- `src/controllers/` - Business logic
- `src/models/` - Database schemas
- `src/utils/` - Helper utilities

### Frontend
- `src/pages/` - Page components
- `src/components/` - Reusable components
- `src/Services/` - API service calls
- `src/hooks/` - Custom React hooks

## 🔧 Environment Variables

Create `.env` files in respective directories:

**Backend_node/.env**
```
MONGODB_URI=your_mongodb_uri
REDIS_URL=your_redis_url
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=8000
```

**pixel-perfect-ui/.env**
```
VITE_API_BASE_URL=http://localhost:8000
```

## 📚 Features

- **Interview Practice**: Simulate real interview scenarios with AI feedback
- **Coding Problems**: Extensive library of coding interview questions
- **Resume Builder**: Multiple professional resume templates
- **Performance Analytics**: Track progress and identify weak areas
- **LinkedIn Integration**: Easy profile sharing
- **Code Storage**: Save and manage coding solutions

## 🧪 Testing

### Frontend
```bash
cd pixel-perfect-ui
npm run test
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Vansh

## 🤝 Contributing

Contributions are welcome! Feel free to fork the repository and submit pull requests.

## 📧 Contact

For inquiries and support, please reach out through the Contact page in the application.

---

**Happy Interviewing! 🎯**
