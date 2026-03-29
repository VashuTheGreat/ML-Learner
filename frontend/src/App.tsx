import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Courses from "./pages/Courses";
import WelcomeQuiz from "./pages/WelcomeQuiz";
import ThanksForYou from "./pages/ThanksForYou";
import LinkedinConnect from "./pages/LinkedinConnect";
import Quiz from "./pages/Quiz";
import ThanksParticipating from "./pages/ThanksParticipating";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Contact from "./pages/Contact";
import ScheduleInterview from "./pages/ScheduleInterview";
import NotFound from "./pages/NotFound";
import { DashBoard } from "./pages/DashBoard";
import { Templates } from "./pages/Templates";
import { CreateResume } from "./pages/CreateResume";
import { View_resume } from "./pages/ViewResume";
import { Apply } from "./pages/Apply";
import { AIInterview } from "./pages/AIInterview";
import Performance from "./pages/Performance";
import Practice from "./pages/Practice";
import Solve from "./pages/Solve";
import MLTrainer from "./pages/MLTrainer";
import Playground from "./pages/Playground";
import JobFetcher from "./pages/JobFetcher"; 
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { GuestRoute } from "./components/auth/GuestRoute";

// QueryClient must be created AFTER all imports
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/contact" element={<Contact />} />

            {/* Guest-only Routes */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/welcome-quiz" element={<WelcomeQuiz />} />
              <Route path="/thanks-for-you" element={<ThanksForYou />} />
              <Route path="/linkedin-connect" element={<LinkedinConnect />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/thanks-participating" element={<ThanksParticipating />} />
              <Route path="/schedule-interview" element={<ScheduleInterview />} />
              <Route path="/dashboard" element={<DashBoard />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/create-resume/:slug" element={<CreateResume />} />
              <Route path="/viewresume/:slug" element={<View_resume/>} />
              <Route path="/apply" element={<Apply/>} />
              {/* /ai-interview removed: all interviews use /interview/:slug */}
              <Route path="/interview/:slug" element={<AIInterview/>} />
              <Route path="/performance/:slug" element={<Performance/>} />
              <Route path="/practice" element={<Practice/>} />
              <Route path="/solve/:slug" element={<Solve/>} />
              <Route path="/ml-trainer" element={<MLTrainer/>} />
              <Route path="/playground" element={<Playground/>} />
              <Route path="/job-fetcher" element={<JobFetcher/>} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
