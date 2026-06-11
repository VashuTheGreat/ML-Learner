import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pythonApi from '@/services/pythonApi';
import templateApi from '@/services/templateApi';
import { useToast } from '@/components/ui/use-toast';
import { 
  ArrowLeft, Briefcase, FileText, Sparkles, Loader2, 
  CheckCircle2, AlertTriangle, AlertCircle, RefreshCw 
} from 'lucide-react';

const formatJsonToKeyValueString = (obj: any, indent = ""): string => {
  if (!obj) return "";
  if (typeof obj !== "object") return String(obj);
  
  let result = "";
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    if (["id", "userId", "_id", "createdAt", "updatedAt"].includes(key)) continue;
    
    if (Array.isArray(value)) {
      result += `${indent}${key.toUpperCase()}:\n`;
      value.forEach(item => {
        if (typeof item === "object") {
          result += formatJsonToKeyValueString(item, indent + "  ") + "\n";
        } else {
          result += `${indent}  • ${item}\n`;
        }
      });
    } else if (typeof value === "object") {
      result += `${indent}${key.toUpperCase()}:\n${formatJsonToKeyValueString(value, indent + "  ")}\n`;
    } else {
      result += `${indent}${key.toUpperCase()}: ${value}\n`;
    }
  }
  return result;
};

const CheckAtsScore: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [jobDescription, setJobDescription] = useState("");
  const [userDetails, setUserDetails] = useState("");
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [calculatingScore, setCalculatingScore] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    // 1. Prefill Job Description if saved in localStorage and clear it
    const savedDesc = localStorage.getItem('ats_job_description');
    if (savedDesc) {
      setJobDescription(savedDesc);
      localStorage.removeItem('ats_job_description');
    }
    
    // 2. Fetch User Resume Template and format it
    const loadUserTemplate = async () => {
      setLoadingTemplate(true);
      try {
        const response = await templateApi.getResumeTemplate();
        // Handle various response wrappers
        const schema = response?.schema || response;
        if (schema && Object.keys(schema).length > 0) {
          const formatted = formatJsonToKeyValueString(schema);
          setUserDetails(formatted);
        } else {
          // If no template exists, fallback to standard stored details
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const userObj = JSON.parse(storedUser);
            setUserDetails(`NAME: ${userObj.fullName || ''}\nEMAIL: ${userObj.email || ''}\nABOUT: ${userObj.aboutUser || ''}`);
          }
        }
      } catch (err: any) {
        console.error("Failed to load resume template", err);
        // Fallback
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          setUserDetails(`NAME: ${userObj.fullName || ''}\nEMAIL: ${userObj.email || ''}\nABOUT: ${userObj.aboutUser || ''}`);
        }
      } finally {
        setLoadingTemplate(false);
      }
    };
    
    loadUserTemplate();
  }, []);

  const handleCalculateScore = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Job Description Empty",
        description: "Please paste a target job description to match against.",
        variant: "destructive"
      });
      return;
    }
    if (!userDetails.trim()) {
      toast({
        title: "Profile Details Empty",
        description: "Please paste or fill in your profile details.",
        variant: "destructive"
      });
      return;
    }
    
    setCalculatingScore(true);
    setScore(null);
    try {
      const scoreVal = await pythonApi.similarJobPredictor(jobDescription, userDetails);
      // Backend returns a fraction, e.g. 0.825
      const parsedScore = typeof scoreVal === 'number' ? scoreVal : typeof scoreVal?.data === 'number' ? scoreVal.data : 0;
      setScore(parsedScore * 100);
      toast({
        title: "Score Calculated",
        description: "ATS compatibility analysis finished successfully."
      });
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? err?.message ?? "Failed to compute score.";
      toast({
        title: "Error Calculating Score",
        description: msg,
        variant: "destructive"
      });
    } finally {
      setCalculatingScore(false);
    }
  };

  const getScoreVerdict = (val: number) => {
    if (val >= 80) return { label: "Excellent Alignment", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 };
    if (val >= 60) return { label: "Good Potential Match", color: "text-amber-500 bg-amber-500/10 border-amber-500/20", icon: AlertTriangle };
    return { label: "Additional Optimization Recommended", color: "text-rose-500 bg-rose-500/10 border-rose-500/20", icon: AlertCircle };
  };

  const verdict = score !== null ? getScoreVerdict(score) : null;
  const VerdictIcon = verdict ? verdict.icon : null;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Back Link */}
        <button 
          onClick={() => navigate('/job-fetcher')}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Job Fetcher
        </button>

        {/* Title */}
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-primary animate-pulse" />
            ATS Compatibility Analyzer
          </h1>
          <p className="text-muted-foreground mt-1">
            Edit the fields below to simulate how well your profile aligns with the target role description.
          </p>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Job Description Card */}
          <div className="glass-card rounded-2xl border border-border/50 p-6 flex flex-col h-[500px]">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-base">Target Job Description</h3>
            </div>
            <textarea
              className="flex-1 w-full bg-muted/40 hover:bg-muted/60 focus:bg-muted/80 border border-border/40 rounded-xl p-4 text-xs font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all resize-none overflow-y-auto"
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Paste the target job description details here..."
            />
          </div>

          {/* User Profile Details Card */}
          <div className="glass-card rounded-2xl border border-border/50 p-6 flex flex-col h-[500px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base">Your Profile Details (Key-Value Format)</h3>
              </div>
              {loadingTemplate && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            </div>
            <textarea
              className="flex-1 w-full bg-muted/40 hover:bg-muted/60 focus:bg-muted/80 border border-border/40 rounded-xl p-4 text-xs font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all resize-none overflow-y-auto"
              value={userDetails}
              onChange={e => setUserDetails(e.target.value)}
              placeholder="Your parsed resume elements will load here automatically..."
            />
          </div>

        </div>

        {/* Calculate Controls & Score output */}
        <div className="flex flex-col items-center justify-center p-8 glass-card border border-border/50 rounded-2xl max-w-2xl mx-auto">
          {score === null ? (
            <button
              onClick={handleCalculateScore}
              disabled={calculatingScore}
              className="px-8 py-3.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-sm shadow-lg hover:shadow-primary/20 flex items-center gap-2 transition-all disabled:opacity-60"
            >
              {calculatingScore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Calculating Similarities...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Analyze Compatibility Score
                </>
              )}
            </button>
          ) : (
            <div className="w-full text-center space-y-6 animate-in fade-in duration-300">
              
              <div className="inline-flex items-center justify-center relative w-32 h-32">
                {/* Visual Circle gauge */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    className="text-muted/10"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="52"
                    cx="64"
                    cy="64"
                  />
                  <circle
                    className="text-primary"
                    strokeWidth="8"
                    strokeDasharray={326}
                    strokeDashoffset={326 - (326 * score) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="52"
                    cx="64"
                    cy="64"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold tracking-tight">{score.toFixed(0)}%</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Match</span>
                </div>
              </div>

              {verdict && VerdictIcon && (
                <div className="max-w-md mx-auto space-y-3">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${verdict.color}`}>
                    <VerdictIcon className="w-4 h-4" />
                    {verdict.label}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {score >= 80 
                      ? "Outstanding! Your profile elements line up closely with this job's criteria. You have a very high chance of getting through automated screening filters."
                      : score >= 60
                      ? "Good alignment. Consider adding more specific keywords from the description to your profile details to further increase matching odds."
                      : "Low alignment. Try revising your profile details to match key skills, terms, and requirements mentioned in the job description."
                    }
                  </p>
                </div>
              )}

              <button
                onClick={() => setScore(null)}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1 mx-auto"
              >
                Reset & Analyze Again
              </button>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CheckAtsScore;
