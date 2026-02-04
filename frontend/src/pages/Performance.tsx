import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Trophy, ArrowLeft, Loader2, CheckCircle, XCircle, 
  AlertCircle, Target, BookOpen, Lightbulb, ShieldAlert,
  BarChart3, Brain, Rocket, Heart
} from "lucide-react";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip
} from 'recharts';
import performanceApi from '@/Services/performanceApi';
import Navbar from '@/components/layout/Navbar';
import { cn } from "@/lib/utils";

const Performance = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const data = await performanceApi.fetchInterviewPerformance(slug);
        console.log("Fetched Performance Data:", data);
        setPerformance(data);
      } catch (err) {
        console.error("Error fetching performance:", err);
        setError("Failed to load performance data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [slug]);

  const getChartData = () => {
    if (!performance?.skills) return [];
    
    // Handle both object and array formats for skills
    const skillsArray = Array.isArray(performance.skills) 
      ? performance.skills 
      : Object.entries(performance.skills).map(([key, value]: [string, any]) => ({
          name: key,
          ...value
        }));

    return skillsArray.map((skill: any) => ({
      subject: (skill.name || skill.subject || "").replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      A: skill.score || 0,
      fullMark: 10,
    }));
  };

  const getVerdictColor = (verdict: string) => {
    const v = verdict?.toLowerCase();
    if (v === 'hire' || v === 'strong hire' || v === 'yes') return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (v === 'maybe' || v === 'neutral') return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    return 'text-destructive bg-destructive/10 border-destructive/20';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
          <Brain className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="mt-4 text-muted-foreground font-medium animate-pulse">Analyzing your performance...</p>
      </div>
    );
  }

  const chartData = getChartData();

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all mb-8 group"
        >
          <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="font-medium">Back to Dashboard</span>
        </button>

        <div className="max-w-6xl mx-auto">
          {error ? (
            <div className="glass-card p-12 text-center rounded-3xl border-destructive/20 max-w-lg mx-auto">
              <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Oops!</h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="btn-primary w-full"
              >
                Try Again
              </button>
            </div>
          ) : performance ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              {/* Header Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card p-8 md:p-10 rounded-3xl relative overflow-hidden flex flex-col justify-center">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 rounded-full blur-3xl -ml-24 -mb-24"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center shadow-xl shadow-primary/20">
                        <Trophy className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                          Interview <span className="gradient-text">Analysis</span>
                        </h1>
                        <p className="text-muted-foreground font-medium">Technical Assessment Results</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className={cn(
                        "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-bold uppercase tracking-wider",
                        getVerdictColor(performance.verdict)
                      )}>
                        Verdict: {performance.verdict}
                      </div>
                      <p className="text-lg text-foreground/80 leading-relaxed font-medium">
                        "{performance.summaryFeedback}"
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-8 rounded-3xl flex flex-col items-center justify-center text-center relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Overall Score</div>
                    <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                      <svg className="w-full h-full -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="58"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="10"
                          className="text-secondary/10"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="58"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="10"
                          strokeDasharray={364.4}
                          strokeDashoffset={364.4 - (364.4 * (performance.overallScore > 10 ? performance.overallScore / 100 : performance.overallScore / 10))}
                          className="text-primary transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold gradient-text">
                          {performance.overallScore > 10 ? performance.overallScore : performance.overallScore * 10}%
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium">Based on 7 core competencies</p>
                  </div>
                </div>
              </div>

              {/* Visualization Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Radar Chart */}
                <div className="glass-card p-8 rounded-3xl flex flex-col">
                  <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Skills Visualization
                  </h3>
                  <div className="flex-1 min-h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#94a3b8' }} />
                        <Radar
                          name="Skills"
                          dataKey="A"
                          stroke="#8b5cf6"
                          fill="#8b5cf6"
                          fillOpacity={0.4}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                            borderRadius: '12px', 
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                          }} 
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Skills List */}
                <div className="glass-card p-8 rounded-3xl overflow-hidden">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Detailed Breakdown
                  </h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {performance.skills && (Array.isArray(performance.skills) ? performance.skills : Object.entries(performance.skills).map(([key, value]: [string, any]) => ({ name: key, ...value }))).map((skillData: any, index: number) => (
                      <div key={index} className="p-4 rounded-2xl bg-secondary/5 border border-border/50 hover:border-primary/30 transition-all group">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                            <span className="font-bold capitalize text-sm">{(skillData.name || skillData.subject || "").replace(/([A-Z])/g, ' $1')}</span>
                          </div>
                          <span className="text-sm font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10">{skillData.score}/10</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{skillData.feedback}</p>
                      </div>
                    ))}
                    {(!performance.skills || (Array.isArray(performance.skills) ? performance.skills.length === 0 : Object.keys(performance.skills).length === 0)) && (
                      <div className="text-center py-12 text-muted-foreground italic">
                        No detailed skill breakdown available.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass-card p-8 rounded-3xl border-l-4 border-l-green-500 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Rocket className="w-16 h-16 text-green-500" />
                  </div>
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    Key Strengths
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {performance.strengths?.map((item: string, i: number) => (
                      <div key={i} className="px-4 py-2 rounded-xl bg-green-500/5 border border-green-500/10 text-sm text-green-700 font-medium flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-8 rounded-3xl border-l-4 border-l-destructive relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldAlert className="w-16 h-16 text-destructive" />
                  </div>
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-destructive">
                    <XCircle className="w-5 h-5" />
                    Areas for Improvement
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {performance.weaknesses?.map((item: string, i: number) => (
                      <div key={i} className="px-4 py-2 rounded-xl bg-destructive/5 border border-destructive/10 text-sm text-destructive font-medium flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-destructive"></div>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Practice */}
                <div className="glass-card p-6 rounded-3xl border-t-4 border-t-primary">
                  <h4 className="font-bold mb-4 flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Practice
                  </h4>
                  <ul className="space-y-3">
                    {performance.practiceRecommendations?.map((item: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary font-bold">→</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Study */}
                <div className="glass-card p-6 rounded-3xl border-t-4 border-t-secondary">
                  <h4 className="font-bold mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-secondary" />
                    Study
                  </h4>
                  <ul className="space-y-3">
                    {performance.studyRecommendations?.map((item: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-secondary font-bold">→</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Low Priority */}
                <div className="glass-card p-6 rounded-3xl border-t-4 border-t-muted-foreground/30">
                  <h4 className="font-bold mb-4 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-muted-foreground" />
                    Low Priority
                  </h4>
                  <ul className="space-y-3">
                    {performance.lowPriorityOrAvoid?.map((item: string, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-muted-foreground font-bold">→</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer Note */}
              <div className="text-center p-8">
                <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
                  Generated with <Heart className="w-4 h-4 text-destructive fill-destructive" /> by AI Interviewer
                </p>
              </div>

            </div>
          ) : (
            <div className="glass-card p-12 text-center rounded-3xl">
              <p className="text-muted-foreground">No performance data found for this interview.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Performance;
