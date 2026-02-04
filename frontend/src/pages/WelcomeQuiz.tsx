import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";

const WelcomeQuiz = () => {
  const navigate = useNavigate();
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const courses = [
    { id: "html", name: "HTML", icon: "🌐" },
    { id: "css", name: "CSS", icon: "🎨" },
    { id: "javascript", name: "JavaScript", icon: "⚡" },
    { id: "react", name: "React", icon: "⚛️" },
    { id: "nodejs", name: "Node.js", icon: "🟢" },
    { id: "python", name: "Python", icon: "🐍" },
  ];

  const toggleCourse = (id: string) => {
    setSelectedCourses(prev => 
      prev.includes(id) 
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  const handleNext = () => {
    navigate("/thanks-for-you");
  };

  return (
    <div className="min-h-screen mesh-gradient">
      <Navbar />
      
      <div className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="flex items-center justify-center gap-2 mb-12">
              <div className="w-3 h-3 rounded-full gradient-bg"></div>
              <div className="w-8 h-1 bg-border rounded-full"></div>
              <div className="w-3 h-3 rounded-full bg-border"></div>
              <div className="w-8 h-1 bg-border rounded-full"></div>
              <div className="w-3 h-3 rounded-full bg-border"></div>
            </div>

            {/* Content Card */}
            <div className="bg-card rounded-3xl p-8 md:p-12 shadow-soft-lg animate-fade-in">
              <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  Welcome to <span className="gradient-text">ML Learner</span>
                </h1>
                <p className="text-muted-foreground">
                  What courses are you interested in? Select all that apply.
                </p>
              </div>

              {/* Course Selection Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => toggleCourse(course.id)}
                    className={cn(
                      "relative p-6 rounded-2xl border-2 transition-all hover:scale-105",
                      selectedCourses.includes(course.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {selectedCourses.includes(course.id) && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full gradient-bg flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                    <div className="text-4xl mb-3">{course.icon}</div>
                    <div className="font-semibold">{course.name}</div>
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                disabled={selectedCourses.length === 0}
                className={cn(
                  "btn-primary w-full flex items-center justify-center gap-2",
                  selectedCourses.length === 0 && "opacity-50 cursor-not-allowed"
                )}
              >
                Next Step
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeQuiz;
