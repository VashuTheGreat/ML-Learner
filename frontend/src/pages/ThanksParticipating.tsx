import { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { CheckCircle, ArrowRight, Home, RotateCcw, Trophy, Loader2, BarChart2 } from "lucide-react";
import heroPerson from "@/assets/hero-person.png";
import Navbar from "@/components/layout/Navbar";
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

  useEffect(() => {
    const generatePerformance = async () => {
      const threadId = stateThreadId || sessionStorage.getItem('interview_thread_id');
      const slug = stateSlug || "unknown";

      console.log("Starting performance generation for:", { threadId, slug });

      if (!threadId) {
        console.warn("No threadId found in state or sessionStorage");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // 1. Get Performance from Python API
        const response = await pythonApi.getPerformance(threadId);
        console.log("Raw response from Python API:", response);
        
        let performanceRes: any = null;

        // Handle the case where Python returns a set {"data", res} -> serialized as array ["data", res]
        if (Array.isArray(response)) {
          console.log("Response is an array (likely Python set)");
          const jsonStr = response.find(item => item !== "data");
          if (jsonStr) {
            performanceRes = JSON.parse(jsonStr);
          }
        } else if (response && response.data) {
          // Handle {"data": "..."}
          console.log("Response has data field");
          performanceRes = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
        } else {
          // Fallback
          console.log("Falling back to direct response");
          performanceRes = response;
        }

        console.log("Parsed performance data:", performanceRes);
        
        // 2. Normalize and Save Performance to Backend
        if (performanceRes) {
          const normalizedData = {
            interview_id: slug,
            overallScore: Math.min(10, Math.max(0, Number(performanceRes.overallScore ?? performanceRes.score) || 0)),
            verdict: (performanceRes.verdict || "maybe").toLowerCase(),
            summaryFeedback: performanceRes.summaryFeedback || "Interview completed.",
            skills: normalizeSkills(performanceRes.skills),
            strengths: Array.isArray(performanceRes.strengths) ? performanceRes.strengths : [],
            weaknesses: Array.isArray(performanceRes.weaknesses) ? performanceRes.weaknesses : [],
            practiceRecommendations: Array.isArray(performanceRes.practiceRecommendations) ? performanceRes.practiceRecommendations : [],
            studyRecommendations: Array.isArray(performanceRes.studyRecommendations) ? performanceRes.studyRecommendations : [],
            lowPriorityOrAvoid: Array.isArray(performanceRes.lowPriorityOrAvoid) ? performanceRes.lowPriorityOrAvoid : [],
            confidenceLevel: Math.min(10, Math.max(0, Number(performanceRes.confidenceLevel) || 5))
          };

          console.log("Saving normalized performance to backend:", normalizedData);
          try {
            await performanceApi.createPerformance(normalizedData);
            setPerformanceData(normalizedData);
            console.log("Performance saved successfully");
            navigate(`/performance/${slug}`); // Redirect on success
          } catch (saveErr) {
            console.error("Failed to save performance to backend:", saveErr);
            // We set the data anyway so the UI can show something, even if DB save failed
            setPerformanceData(normalizedData);
            setError("Performance generated but failed to save to history. You can still see results below.");
          }

          // 3. Update interview status to 'done' (Always try this)
          try {
            await interviewApi.updateInterviewStatus({ id: slug, status: 'done' });
            console.log("Interview status updated to 'done'");
          } catch (statusErr) {
            console.error("Error updating interview status:", statusErr);
          }
        } else {
          console.warn("No performance data received");
          setError("Could not generate performance data.");
        }

        // 4. Cleanup (Always try this)
        console.log("Cleaning up thread from backend and storage...");
        try {
          await pythonApi.deleteThread(threadId);
          console.log("Thread deleted from backend successfully");
        } catch (delErr) {
          console.error("Error deleting thread from backend:", delErr);
        }
        
        // Always clear storage even if backend deletion fails
        sessionStorage.removeItem('interview_thread_id');
        localStorage.removeItem('interview_thread_id');
        console.log("Local/Session storage cleared for thread:", threadId);
        
      } catch (err) {
        console.error("Error in generatePerformance:", err);
        setError("Failed to generate performance feedback. Please check console for details.");
      } finally {
        setIsLoading(false);
      }
    };

    generatePerformance();
  }, [stateThreadId, stateSlug]);

  return (
    <div className="min-h-screen mesh-gradient">
      <Navbar />
      
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
                  <div className="flex flex-col sm:flex-row gap-4">
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
                      to="/" 
                      className="btn-outline flex items-center justify-center gap-2"
                    >
                      <Home className="w-5 h-5" />
                      Back to Home
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
