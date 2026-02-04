import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle, ArrowRight, Home, RotateCcw, Trophy, Loader2 } from "lucide-react";
import heroPerson from "@/assets/hero-person.png";
import Navbar from "@/components/layout/Navbar";
import pythonApi from "@/Services/pythonApi";
import performanceApi from "@/Services/performanceApi";

const ThanksParticipating = () => {
  const location = useLocation();
  const { threadId: stateThreadId, slug: stateSlug } = location.state || {};
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generatePerformance = async () => {
      const threadId = stateThreadId || sessionStorage.getItem('interview_thread_id') || localStorage.getItem('interview_thread_id');
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
        
        // 2. Save Performance to Backend
        if (performanceRes && (performanceRes.overallScore !== undefined || performanceRes.score !== undefined)) {
          console.log("Saving performance to backend...");
          await performanceApi.createPerformance({
            ...performanceRes,
            overallScore: performanceRes.overallScore ?? performanceRes.score, // Handle different field names
            interview_id: slug
          });
          setPerformanceData(performanceRes);
          console.log("Performance saved and set in state");
        } else {
          console.warn("Invalid performance data received:", performanceRes);
          setError("Received invalid performance data format.");
        }

        // 3. Cleanup
        console.log("Cleaning up thread...");
        await pythonApi.deleteThread(threadId);
        sessionStorage.removeItem('interview_thread_id');
        localStorage.removeItem('interview_thread_id');
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
                    <Link 
                      to="/" 
                      className="btn-primary flex items-center justify-center gap-2"
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
