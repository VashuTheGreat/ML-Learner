import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { CheckCircle, ArrowRight, Home, RotateCcw, Trophy, Loader2, BarChart2 } from "lucide-react";
import heroPerson from "@/assets/hero-person.png";

import pythonApi from "@/Services/pythonApi";
import performanceApi from "@/Services/performanceApi";
import interviewApi from "@/Services/interviewApi";

const ThanksParticipating = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { threadId: stateThreadId, slug: stateSlug } = location.state || {};
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const normalizeSkills = (skills: any) => {
    const defaultSkill = { score: 0, feedback: "Not evaluated" };
    if (!skills || typeof skills !== 'object') {
       return {
         technical: defaultSkill, dsa: defaultSkill, problemSolving: defaultSkill,
         communication: defaultSkill, systemDesign: defaultSkill, projects: defaultSkill, behaviour: defaultSkill
       };
    }

    const skillKeys = ['technical', 'dsa', 'problemSolving', 'communication', 'systemDesign', 'projects', 'behaviour'];
    const normalized: any = {};
    
    skillKeys.forEach(key => {
      const val = skills[key];
      if (val && typeof val === 'object' && val.score !== undefined) {
        normalized[key] = {
          score: Math.min(10, Math.max(0, Number(val.score) || 0)),
          feedback: String(val.feedback || "Good performance")
        };
      } else if (typeof val === 'string') {
        normalized[key] = {
          score: 7, // Default score if only feedback string is present
          feedback: val
        };
      } else {
        normalized[key] = defaultSkill;
      }
    });
    return normalized;
  };

  // Helper to normalize the LLM verdict string into the strict Mongoose enum
  const mapVerdict = (v: any): "hire" | "maybe" | "reject" => {
    const lower = String(v || "").toLowerCase();
    if (lower.includes("hire") && !lower.includes("no") && !lower.includes("not")) return "hire";
    if (lower.includes("reject") || lower.includes("no")) return "reject";
    return "maybe";
  };

  useEffect(() => {
    // This page now only serves as a final landing page. 
    // Performance generation and backend saving is handled in AIInterview.tsx.
    setIsLoading(false);
    
    // Check if we arrived here due to an error in the interview page
    if (location.state?.error) {
      setError("We encountered an issue during analysis. Please check your Dashboard to see if the result was saved.");
    }
  }, [location.state]);

  return (
    <div className="min-h-screen mesh-gradient">

      
      <div className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Content Card */}
            <div className="bg-card rounded-3xl p-8 md:p-12 shadow-soft-lg animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Left - Content */}
                <div className="space-y-6">
                  <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-primary-foreground" />
                  </div>
                  
                  <h1 className="text-3xl md:text-4xl font-bold">
                    Thanks For{" "}
                    <span className="gradient-text">Participating!</span>
                  </h1>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {isLoading 
                      ? "Please wait while we analyze your performance and generate detailed feedback..."
                      : "You've successfully completed the interview. Your results have been recorded and you can see your feedback below."
                    }
                  </p>

                  {/* Score Card */}
                  <div className="bg-muted/50 rounded-2xl p-6 min-h-[120px] flex flex-col justify-center">
                    {isLoading ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <span className="text-sm font-medium text-muted-foreground">Generating performance...</span>
                      </div>
                    ) : error ? (
                      <div className="text-center text-destructive text-sm font-medium">
                        {error}
                      </div>
                    ) : performanceData ? (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-muted-foreground">Overall Score</span>
                          <span className="text-3xl font-bold gradient-text">
                            {performanceData.overallScore}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-sm text-muted-foreground">
                            {performanceData.verdict || "Great performance! Keep learning."}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-muted-foreground text-sm">
                        No performance data available.
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap sm:flex-row gap-4">
                    {performanceData && (
                      <button 
                        onClick={() => navigate(`/performance/${stateSlug || "unknown"}`)}
                        className="btn-primary flex items-center justify-center gap-2 bg-primary text-white"
                      >
                        <BarChart2 className="w-5 h-5" />
                        View Performance
                      </button>
                    )}
                    <Link 
                      to="/dashboard" 
                      className="btn-outline flex items-center justify-center gap-2"
                    >
                      <Home className="w-5 h-5" />
                      Back to Dashboard
                    </Link>
                    <Link 
                      to="/apply" 
                      className="btn-outline flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Try Another
                    </Link>
                  </div>
                </div>

                {/* Right - Image */}
                <div className="hidden md:block">
                  <img 
                    src={heroPerson} 
                    alt="Congratulations" 
                    className="w-full max-w-xs mx-auto rounded-2xl"
                  />
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 text-center">
              <p className="text-muted-foreground text-sm">
                Want to improve your skills?{" "}
                <Link to="/courses" className="text-primary font-medium hover:underline">
                  Explore more courses
                  <ArrowRight className="inline w-4 h-4 ml-1" />
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThanksParticipating;
