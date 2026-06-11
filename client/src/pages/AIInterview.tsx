import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, Send, 
  Clock, Bot, User, Volume2, Trophy, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import pythonApi from '@/services/pythonApi';
import performanceApi from '@/services/performanceApi';
import interviewApi from '@/services/interviewApi';
import { FaceDetectionVideo } from '@/components/common/FaceDetectionVideo';

export const AIInterview = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [timeRemaining, setTimeRemaining] = useState(10 * 60); // 10 minutes default
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [userAnswer, setUserAnswer] = useState("");
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [messages, setMessages] = useState<Array<{role: 'ai' | 'user', content: string}>>([]);
  const [threadId, setThreadId] = useState<string>("");
  const [topic, setTopic] = useState<string>("");
  const [recognition, setRecognition] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState("");
  const hasInterviewStarted = useRef(false);
  
  // Ref for handleEndInterview to avoid stale closures in timer
  const handleEndInterviewRef = React.useRef<() => Promise<void>>();

  // Ref to auto-focus textarea when user starts speaking
  const answerRef = useRef<HTMLTextAreaElement>(null);

  // Ref to scroll chat to latest message
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      // Do NOT use continuous=true — it causes a 'network' error on many browsers.
      // Instead we restart manually in onend when the mic is still supposed to be on.
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let currentInterim = "";
        let finalTranscripts = "";
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscripts += event.results[i][0].transcript + " ";
          }
        }
        
        if (finalTranscripts) {
          setUserAnswer(prev => (prev ? prev + " " : "") + finalTranscripts.trim());
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (e: any) => {
        console.error("Speech reco error event:", e.error);
        if (e.error === 'network') {
          setIsMicOn(false);
          toast({
            title: "Voice Input Network Error",
            description: "Speech-to-text service is temporarily unavailable. Please type your responses manually.",
            variant: "destructive"
          });
        } else if (e.error === 'not-allowed') {
          setIsMicOn(false);
          toast({
            title: "Microphone Access Denied",
            description: "Please check your browser permissions to enable microphone input.",
            variant: "destructive"
          });
        }
        setIsListening(false);
      };

      setRecognition(rec);
    } else {
      console.warn("Speech recognition not supported");
    }
  }, []);

  // Manage Mic State — restart recognition each time it ends (non-continuous workaround)
  useEffect(() => {
    if (!recognition) return;
    
    let active = true;
    const startTimeout = setTimeout(() => {
      if (!active) return;
      try {
        if (isMicOn && !isAISpeaking && !isListening) {
          recognition.start();
          setIsListening(true);
        }
      } catch (e) {
        // ignore AbortError / InvalidStateError
      }
    }, 400); // 400ms delay to prevent CPU-hogging loop on rapid failures

    try {
      if ((!isMicOn || isAISpeaking) && isListening) {
        recognition.stop();
        setIsListening(false);
      }
    } catch (e) {
      // ignore
    }

    return () => {
      active = false;
      clearTimeout(startTimeout);
    };
  }, [isMicOn, isAISpeaking, isListening, recognition]);

  // Auto-focus textarea when user starts speaking OR when AI finishes speaking
  useEffect(() => {
    if (!isAISpeaking && answerRef.current) {
      answerRef.current.focus();
    }
  }, [isAISpeaking]);

  useEffect(() => {
    if (isListening && answerRef.current) {
      answerRef.current.focus();
    }
  }, [isListening]);

  // Auto-scroll chat to bottom whenever messages change
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAISpeaking]);

  // Initialize unique threadId for the interview session
  useEffect(() => {
    let id = sessionStorage.getItem('interview_thread_id');
    const storedSlug = sessionStorage.getItem('interview_slug');
    
    if (!id || storedSlug !== slug) {
      // Generate a new unique ID if none exists or if the interview slug has changed
      id = crypto.randomUUID();
      sessionStorage.setItem('interview_thread_id', id);
      localStorage.setItem('interview_thread_id', id);
      if (slug) {
        sessionStorage.setItem('interview_slug', slug);
        localStorage.setItem('interview_slug', slug);
      }
      console.log("New Interview Thread ID generated for slug:", id, slug);
    } else {
      console.log("Resuming Interview with Thread ID:", id);
    }
    
    setThreadId(id);
  }, [slug]);

  // Fetch Interview Details
  useEffect(() => {
    if (!slug) return;
    const fetchInterview = async () => {
      try {
        const data = await interviewApi.getInterviewById(slug);
        if (data) {
          if (data.topic) {
            setTopic(data.topic);
          }
          if (data.duration) {
            setTimeRemaining(Number(data.duration));
          }
        }
      } catch (error) {
        console.error("Error fetching interview:", error);
      }
    };
    fetchInterview();
  }, [slug]);

  // TTS Helper
  const speak = useCallback((rawText: string) => {
    if (!window.speechSynthesis) return;
    
    // Clean and prune text to be spoken
    let textToSpeak = rawText
      .replace(/\*\*?/g, "") // remove bold asterisks
      .replace(/#+\s+/g, "") // remove headers
      .replace(/__?/g, "") // remove underscores
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // replace markdown links
      .replace(/`/g, "") // remove backticks
      .trim();

    if (textToSpeak.includes("Let's start")) {
      const parts = textToSpeak.split("Let's start");
      textToSpeak = "Let's start. " + parts[parts.length - 1];
    }

    // Strip out emojis for cleaner pronunciation
    textToSpeak = textToSpeak.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "");

    if (!textToSpeak) return;

    try {
      window.speechSynthesis.resume(); // Workaround for Chromium SpeechSynthesis freeze bug
      window.speechSynthesis.cancel();
      
      // Short delay to reset speechSynthesis in Chromium engines
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.onstart = () => setIsAISpeaking(true);
        utterance.onend = () => setIsAISpeaking(false);
        utterance.onerror = (e) => {
          // Ignore interruption events as they are normal on cancellation
          if (e.error !== 'interrupted') {
            console.error("SpeechSynthesisUtterance error:", e);
          }
          setIsAISpeaking(false);
        };
        
        // Select an English voice if available
        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find(v => v.lang.startsWith('en'));
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
        
        window.speechSynthesis.speak(utterance);
      }, 50);
    } catch (e) {
      console.error("TTS Speak error:", e);
      setIsAISpeaking(false);
    }
  }, []);

  useEffect(() => {
    if (!threadId || !slug || !hasStarted) return;
    // Guard set SYNCHRONOUSLY before any async call to prevent React Strict Mode double-fire
    if (hasInterviewStarted.current) return;
    if (!topic && slug) return; // Wait for topic to load before starting

    hasInterviewStarted.current = true;

    const startInterview = async () => {
      try {
        const currentTopic = topic || slug;
        setMessages([{ role: 'ai', content: "" }]);
        
        const response = await pythonApi.chatInterviewer(
          threadId, 
          timeRemaining, 
          currentTopic, 
          "Hello, I am ready for the interview.",
          (token) => {
            setMessages(prev => {
              if (prev.length === 0) return [{ role: 'ai', content: token }];
              const last = prev[prev.length - 1];
              if (last.role === 'ai') {
                return [...prev.slice(0, -1), { role: 'ai', content: last.content + token }];
              }
              return [...prev, { role: 'ai', content: token }];
            });
          }
        );
        
        const aiMsg = (typeof response === 'string' ? response : (response.ai_response)) 
          || "Hello! I am your AI interviewer. Let's begin.";
          
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'ai' && last.content) return prev;
          return [{ role: 'ai', content: aiMsg }];
        });
        
        speak(aiMsg);
      } catch (error) {
        console.error("Error starting interview:", error);
        hasInterviewStarted.current = false; // Reset on error to allow retry
      }
    };

    startInterview();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId, slug, topic, hasStarted]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          if (handleEndInterviewRef.current) {
            handleEndInterviewRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendAnswer = async () => {
    if (!userAnswer.trim() || isAISpeaking || isAnalyzing) return;

    // Renew user activation synchronously to prevent browser from blocking subsequent async speak() call
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.resume();
        const u = new SpeechSynthesisUtterance(" ");
        window.speechSynthesis.speak(u);
      } catch (e) {
        // ignore
      }
    }

    const currentAnswer = userAnswer;
    setMessages(prev => [...prev, { role: 'user', content: currentAnswer }, { role: 'ai', content: "" }]);
    setUserAnswer("");

    try {
      setIsAISpeaking(true);
      const response = await pythonApi.chatInterviewer(
        threadId, 
        timeRemaining, 
        topic || slug || "General", 
        currentAnswer,
        (token) => {
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'ai') {
              return [...prev.slice(0, -1), { role: 'ai', content: last.content + token }];
            }
            return [...prev, { role: 'ai', content: token }];
          });
        }
      );
      
      // Handle both string and object responses
      const aiMsg = typeof response === 'string' ? response : response.ai_response;
      
      if (aiMsg) {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'ai' && last.content) return prev;
          return [...prev.slice(0, -1), { role: 'ai', content: aiMsg }];
        });
        speak(aiMsg);
      } else {
        console.warn("Empty AI response received");
        setIsAISpeaking(false);
      }
    } catch (error) {
      console.error("Error sending answer:", error);
      setIsAISpeaking(false);
    }
  };

  const handleEndInterview = async () => {
    if (isAnalyzing) return;
    
    console.log("Ending interview...");
    setIsAnalyzing(true);
    setAnalysisStatus("Evaluating performance...");
    
    const finalMsg = "Analyzing your performance now. Redirecting you to the dashboard.";
    speak(finalMsg);

    try {
      // 1. Send final chat request with timeRemaining = 0 to trigger performance node & auto-saving
      await pythonApi.chatInterviewer(
        threadId, 
        0, 
        topic || slug || "General", 
        "Please end the interview and evaluate my performance now."
      );
      
      // 2. Clear scheduled/pending status from local storage
      localStorage.removeItem(`pending_interview_${slug}`);
      
      // 3. Clear session and thread storage keys
      const itemsToClear = ['interview_thread_id', 'interview_slug'];
      itemsToClear.forEach(item => {
        localStorage.removeItem(item);
        sessionStorage.removeItem(item);
      });

      setAnalysisStatus("Success! Redirecting...");
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error("Error during interview wrap-up:", error);
      // Fallback: make sure storage is cleaned up and user is redirected
      localStorage.removeItem(`pending_interview_${slug}`);
      const itemsToClear = ['interview_thread_id', 'interview_slug'];
      itemsToClear.forEach(item => {
        localStorage.removeItem(item);
        sessionStorage.removeItem(item);
      });
      navigate('/dashboard');
    }
  };

  const handleStartClick = () => {
    // Unlock SpeechSynthesis by speaking a non-empty string trigger synchronously in the gesture handler
    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.resume();
        const u = new SpeechSynthesisUtterance("Let's begin");
        window.speechSynthesis.speak(u);
      } catch (e) {
        console.error("Failed to unlock speech synthesis:", e);
      }
    }
    setHasStarted(true);
  };

  // Update ref whenever handleEndInterview changes
  useEffect(() => {
    handleEndInterviewRef.current = handleEndInterview;
  }, [handleEndInterview]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendAnswer();
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="h-16 border-b border-border/50 flex items-center justify-between px-4 sm:px-6 gap-2 sm:gap-4 overflow-hidden">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl gradient-bg flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-foreground font-bold text-sm sm:text-base truncate">Technical Interview</h1>
            <p className="text-muted-foreground text-[10px] sm:text-xs truncate">{topic || slug}</p>
          </div>
        </div>

        {/* Timer - Compact on small mobile */}
        <div className={cn(
          "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full shrink-0",
          timeRemaining < 60 ? "bg-destructive/20 text-destructive" : "bg-secondary/20 text-foreground"
        )}>
          <Clock className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          <span className="font-mono font-bold text-sm sm:text-lg">{formatTime(timeRemaining)}</span>
        </div>

        <button
          onClick={handleEndInterview}
          disabled={isAnalyzing}
          className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-destructive text-white font-bold text-[10px] sm:text-sm hover:bg-destructive/90 transition-colors shrink-0 whitespace-nowrap disabled:opacity-50"
        >
          {isAnalyzing ? "Saving..." : "End"}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative min-h-0">
        {isAnalyzing && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-background/90 backdrop-blur-xl">
            <div className="text-center space-y-8 max-w-md p-10 bg-card/50 border border-primary/20 rounded-[2rem] shadow-2xl animate-in fade-in zoom-in-95 duration-500">
               <div className="relative w-24 h-24 mx-auto">
                 <div className="absolute inset-0 rounded-full border-4 border-primary/10 border-t-primary animate-spin"></div>
                 <div className="absolute inset-0 flex items-center justify-center">
                    <Trophy className="w-10 h-10 text-primary animate-bounce" />
                 </div>
               </div>
               <div className="space-y-2">
                 <h2 className="text-2xl font-bold gradient-text">Analysis in Progress</h2>
                 <p className="text-muted-foreground font-medium">{analysisStatus}</p>
               </div>
            </div>
          </div>
        )}

        {!hasStarted && !isAnalyzing && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
            <div className="text-center space-y-6 max-w-md p-8 bg-card border border-border rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4">
                <Bot className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold">Ready to Start?</h2>
              <p className="text-muted-foreground">
                Your interview on <strong>{topic || slug}</strong> is ready. 
                Make sure your mic and camera are working correctly before we begin.
              </p>
              <button 
                onClick={handleStartClick}
                className="w-full btn-primary h-14 rounded-2xl text-lg font-bold"
              >
                Start Interview
              </button>
            </div>
          </div>
        )}
        
        {/* Video Section - Split View for Mobile */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-border/50 p-2 sm:p-3 md:p-4 flex flex-row md:flex-col h-auto md:h-full shrink-0 items-center md:items-stretch gap-2 sm:gap-3 md:gap-0 bg-secondary/5 md:bg-transparent min-h-0">
          
          {/* AI Video Container (Split-half on Mobile, Full-bleeding on Web) */}
          <div className="flex-1 md:flex-1 bg-black rounded-xl md:rounded-2xl relative overflow-hidden border border-border/50 h-[80px] sm:h-[100px] md:h-auto md:mb-4">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={cn(
                "w-12 h-12 sm:w-16 sm:h-16 md:w-32 md:h-32 rounded-full gradient-bg flex items-center justify-center transition-all duration-300 shadow-xl",
                isAISpeaking && "animate-pulse scale-105 md:scale-110 shadow-primary/20"
              )}>
                <Bot className="w-6 h-6 sm:w-8 sm:h-8 md:w-16 md:h-16 text-white" />
              </div>
            </div>
            
            {/* Status Overlays */}
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-background/80 backdrop-blur-sm rounded-full text-[8px] sm:text-[10px] md:text-xs font-bold uppercase tracking-tight z-10 border border-border/50">
              AI Interviewer
            </div>
            
            {isAISpeaking ? (
              <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full z-10 max-w-[80%]">
                <Volume2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-primary animate-pulse shrink-0" />
                <span className="text-[7px] sm:text-[9px] md:text-xs text-primary font-bold uppercase tracking-tighter truncate animate-pulse">Speaking</span>
              </div>
            ) : (
                <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-secondary/20 backdrop-blur-sm border border-border/30 rounded-full z-10 opacity-60">
                  <Bot className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-muted-foreground shrink-0" />
                  <span className="text-[7px] sm:text-[9px] md:text-xs text-muted-foreground font-bold uppercase tracking-tighter">Listening</span>
                </div>
            )}
          </div>

          {/* User Video Container (Split-half on Mobile) */}
          <div className="flex-1 md:w-full md:h-48 md:flex-none shrink-0 relative rounded-xl md:rounded-2xl overflow-hidden shadow-sm border border-border/50 bg-black md:bg-secondary/20 h-[80px] sm:h-[100px]">
            <FaceDetectionVideo 
              isVideoOn={isVideoOn} 
              isMicOn={isMicOn} 
              isListening={isListening} 
              hasStarted={hasStarted} 
              isAnalyzing={isAnalyzing} 
              className="absolute inset-0 w-full h-full border-none"
            />
            {/* Overlay label for mobile */}
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-background/80 backdrop-blur-sm rounded-full text-[8px] sm:text-[10px] md:hidden font-bold uppercase z-10 border border-border/50">
              You
            </div>
          </div>

          {/* Controls - Compact horizontal column on Mobile right side? Actually let's keep them in the row */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-1.5 sm:gap-2 md:gap-4 md:mt-4 shrink-0">
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all shadow-sm shrink-0",
                isMicOn 
                  ? "bg-secondary/20 text-foreground hover:bg-secondary/30" 
                  : "bg-destructive/20 text-destructive"
              )}
              title={isMicOn ? "Mute Mic" : "Unmute Mic"}
            >
              {isMicOn ? <Mic className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" /> : <MicOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />}
            </button>
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all shadow-sm shrink-0",
                isVideoOn 
                  ? "bg-secondary/20 text-foreground hover:bg-secondary/30" 
                  : "bg-destructive/20 text-destructive"
              )}
              title={isVideoOn ? "Turn Off Video" : "Turn On Video"}
            >
              {isVideoOn ? <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" /> : <VideoOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />}
            </button>
          </div>
        </div>

        {/* Chat Section */}
        <div className="flex-1 flex flex-col bg-secondary/5 min-h-0 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
                  msg.role === 'user' && "flex-row-reverse"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm",
                  msg.role === 'ai' ? "gradient-bg" : "bg-secondary/30"
                )}>
                  {msg.role === 'ai' ? (
                    <Bot className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-foreground" />
                  )}
                </div>
                <div className={cn(
                  "max-w-[75%] px-5 py-3 rounded-2xl shadow-sm relative group/msg",
                  msg.role === 'ai' 
                    ? "bg-background text-foreground rounded-tl-none border border-border/50" 
                    : "gradient-bg text-white rounded-tr-none"
                )}>
                  <p className="leading-relaxed text-sm md:text-base pr-8">{msg.content}</p>
                  {msg.role === 'ai' && msg.content && (
                    <button
                      onClick={() => speak(msg.content)}
                      className="absolute right-2 top-2.5 p-1.5 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-muted-foreground hover:text-foreground opacity-40 group-hover/msg:opacity-100 transition-all"
                      title="Speak Question"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {isAISpeaking && messages.length > 0 && messages[messages.length-1].role === 'user' && (
              <div className="flex gap-4 animate-in fade-in duration-300">
                <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center shadow-sm">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-background px-5 py-4 rounded-2xl rounded-tl-none border border-border/50 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
            {/* Scroll anchor */}
            <div ref={chatBottomRef} />
          </div>

          {/* Input */}
          <div className="p-6 bg-background border-t border-border/50">
            <div className="flex items-end gap-4 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <textarea
                  ref={answerRef}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isAISpeaking ? "⏳ AI is speaking, please wait..." : isListening ? "🎤 Listening — speak now..." : "Type your answer or speak..."}
                  rows={2}
                  disabled={isAISpeaking || isAnalyzing}
                  className={cn(
                    "w-full px-4 py-3 bg-secondary/10 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none",
                    (isAISpeaking || isAnalyzing) && "opacity-50 cursor-not-allowed bg-secondary/5"
                  )}
                />
              </div>
              <button
                onClick={handleSendAnswer}
                disabled={!userAnswer.trim() || isAISpeaking}
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-lg shadow-primary/20",
                  userAnswer.trim() && !isAISpeaking
                    ? "gradient-bg text-white hover:opacity-90 active:scale-95" 
                    : "bg-secondary/30 text-muted-foreground cursor-not-allowed shadow-none"
                )}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 text-center uppercase tracking-widest font-bold opacity-50">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

