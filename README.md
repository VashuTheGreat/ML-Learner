# 🎯 ML-Learner (InterviewCracker)

**The Ultimate AI-Powered Technical Interview & Machine Learning Playground.**

InterviewCracker is a robust, full-stack platform designed to bridge the gap between learning and landing your dream job. It combines a sophisticated Machine Learning playground, an interactive coding environment, and AI-driven interview simulations into one seamless experience.

---

## � Core Features

### 🧠 AI Interview Simulation

- **Dynamic Interaction**: Engage in realistic technical interviews with AI agents that adapt to your responses.
- **Skill Mapping**: Get a detailed breakdown of your strengths and weaknesses across different technical domains.
- **Performance Analytics**: Track your progress with visual metrics and historical performance data.

### 💻 Interactive Coding Practice

- **Multi-Category Challenges**: Practice Linear Algebra, Statistics, Data Structures, and ML-specific coding problems.
- **TinyGrad Integration**: Solve problems specifically designed for optimized tensor computation.
- **Real-time Execution**: Immediate feedback on code performance and test case validation.
- **Progress Tracking**: Keep tabs on your achievements with a gamified dashboard.

### 📊 ML Playground & Trainer

- **End-to-End ML Pipeline**: From data transformation to model training and evaluation.
- **Interactive Visualizations**: Real-time plots for classification decision regions, regression residuals, and more.
- **Model Configuration**: Experiment with different architectures and hyperparameters directly from the UI.

### 📝 Resume & Career Tools

- **Template-Based Builder**: Create professional, EJS-templated resumes.
- **LinkedIn Sync**: Integrate your professional profile for a unified career presence.

---

## 🏗️ Architecture & Tech Stack

The project follows a distributed architecture with dual backends to handle high-performance ML workloads and scalable user management.

### 🎨 Frontend (React + Vite)

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS & Lucide Icons
- **Components**: Shadcn/UI for premium, responsive design
- **Editor**: Monaco Editor for a VS-Code like coding experience
- **State/Data**: TanStack Query (React Query) & Axios

### ⚡ Node.js Backend (Core Engine)

- **Framework**: Express.js with `@vashuthegreat/vexpress`
- **Database**: MongoDB (Mongoose)
- **Caching**: Redis for session and rate-limiting
- **Storage**: Cloudinary for file and avatar management
- **Logging**: Winston for comprehensive observability

### 🐍 Python Backend (ML & AI)

- **Framework**: FastAPI
- **AI/LLM**: LangChain & LangGraph for intelligent interview flows
- **ML Libraries**: PyTorch, Scikit-Learn, TinyGrad
- **Visualization**: Seaborn & Matplotlib

---

## 📁 Project Structure

```bash
ML-Learner/
├── frontend/               # React + Vite application
│   ├── src/pages/          # Main application views (Solve, DashBoard, MLTrainer, etc.)
│   ├── src/Services/       # API integration layers
│   └── src/components/     # Shared UI components
├── Backend_node/           # Main application server (Node.js)
│   ├── src/routes/         # Auth, Questions, Coding, Interviews
│   ├── src/controllers/    # Business logic implementation
│   └── src/models/         # MongoDB schemas
└── python_backend/         # AI & ML computation server (Python)
    ├── src/routes/         # ML Training, AI Interviews, Coding Execution
    ├── src/components/     # Coderunner, Model Trainer, AI Agents
    └── main.py             # FastAPI entry point
```

---

## 🚥 API Reference

### Node.js API (`:3000`)

- `GET  /api/user/me` - Fetch authenticated user profile
- `GET  /api/question/fetch_question/all` - List practice challenges
- `POST /api/codingSchema/updateCodingSchema` - Sync user progress
- `GET  /api/interview/getUserAppliedInterviews` - Fetch interview history

### Python API (`:8000`)

- `POST /api/coding/submit` - Execute and validate coding solutions
- `POST /api/modelTrain/initiate_training` - Trigger custom ML training
- `POST /api/interviewSchema/aboutUserByResume` - AI-powered resume extraction

---

## 🛠️ Getting Started

### 1. Setup Backend (Node)

```bash
cd Backend_node
npm install
npm run dev
```

### 2. Setup ML Engine (Python)

```bash
cd python_backend
# Recommended: use uv
uv run main.py
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Vansh** - [GitHub](https://github.com/VashuTheGreat)

---

_Powered by Deep Learning and Passion. 🚀_
