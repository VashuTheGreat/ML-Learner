import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, Send, 
  Clock, Bot, User, Volume2
} from "lucide-react";
import { cn } from "@/lib/utils";
import pythonApi from '@/Services/pythonApi';
import performanceApi from '@/Services/performanceApi';
import interviewApi from '@/Services/interviewApi';

export const AIInterview = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [timeRemaining, setTimeRemaining] = useState(1* 60); // 10 minutes default
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [userAnswer, setUserAnswer] = useState("");
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [messages, setMessages] = useState<Array<{role: 'ai' | 'user', content: string}>>([]);
  const [threadId, setThreadId] = useState<string>("");
  const [topic, setTopic] = useState<string>("");

  // Initialize threadId
  useEffect(() => {
    let id = sessionStorage.getItem('interview_thread_id') || localStorage.getItem('interview_thread_id');
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem('interview_thread_id', id);
      localStorage.setItem('interview_thread_id', id);
    }
    console.log("Interview Thread ID initialized:", id);
    setThreadId(id);
  }, []);

  // Fetch Interview Details
  useEffect(() => {
    if (!slug) return;
    const fetchInterview = async () => {
      try {
        const data = await interviewApi.getInterviewById(slug);
        if (data && data.topic) {
          setTopic(data.topic);
        }
      } catch (error) {
        console.error("Error fetching interview:", error);
      }
    };
    fetchInterview();
  }, [slug]);

  // TTS Helper
  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsAISpeaking(true);
    utterance.onend = () => setIsAISpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    if (!threadId || !slug) return;

    const startInterview = async () => {
      try {
        // Send initial greeting twice as requested
        const currentTopic = topic || slug;
        await pythonApi.chatInterviewer(threadId, timeRemaining, currentTopic, "Hello, I am ready for the interview.");
        const response = await pythonApi.chatInterviewer(threadId, timeRemaining, currentTopic, "Hello, I am ready for the interview.");
        
        const aiMsg = response.ai_response || "Hello! I am your AI interviewer. Let's begin.";
        setMessages([{ role: 'ai', content: aiMsg }]);
        speak(aiMsg);
      } catch (error) {
        console.error("Error starting interview:", error);
      }
    };

    if (topic || !slug) { // Wait for topic if slug exists
        startInterview();
    }
  }, [threadId, slug, topic, speak]);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          handleEndInterview();
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
    if (!userAnswer.trim() || isAISpeaking) return;

    const currentAnswer = userAnswer;
    setMessages(prev => [...prev, { role: 'user', content: currentAnswer }]);
    setUserAnswer("");

    try {
      setIsAISpeaking(true);
      const response = await pythonApi.chatInterviewer(threadId, timeRemaining, topic || slug || "General", currentAnswer);
      const aiMsg = response.ai_response;
      
      setMessages(prev => [...prev, { role: 'ai', content: aiMsg }]);
      speak(aiMsg);
    } catch (error) {
      console.error("Error sending answer:", error);
      setIsAISpeaking(false);
    }
  };

  const handleEndInterview = async () => {
    console.log("Ending interview...");
    
    const finalMsg = "Thanks for the interview! Redirecting to your performance results...";
    setMessages(prev => [...prev, { role: 'ai', content: finalMsg }]);
    speak(finalMsg);

    // Wait for the final message to finish speaking before navigating
    // We can use a small timeout or check isAISpeaking in an interval
    const checkSpeech = setInterval(() => {
      if (!window.speechSynthesis.speaking) {
        clearInterval(checkSpeech);
        console.log("Speech finished, navigating to thanks page with:", { threadId, slug });
        navigate("/thanks-participating", { 
          state: { 
            threadId, 
            slug 
          } 
        });
      }
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendAnswer();
    }
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="h-16 border-b border-border/50 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-foreground font-bold">AI Technical Interview</h1>
            <p className="text-muted-foreground text-xs">{slug} Position</p>
          </div>
        </div>

        {/* Timer */}
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-full",
          timeRemaining < 60 ? "bg-destructive/20 text-destructive" : "bg-secondary/20 text-foreground"
        )}>
          <Clock className="w-5 h-5" />
          <span className="font-mono font-bold text-lg">{formatTime(timeRemaining)}</span>
          <span className="text-xs opacity-70">remaining</span>
        </div>

        <button
          onClick={handleEndInterview}
          className="px-4 py-2 rounded-xl bg-destructive text-white font-bold text-sm hover:bg-destructive/90 transition-colors"
        >
          End Interview
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Section */}
        <div className="w-1/3 border-r border-border/50 p-4 flex flex-col">
          {/* AI Video */}
          <div className="flex-1 bg-secondary/10 rounded-2xl relative overflow-hidden mb-4 border border-border/50">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className={cn(
                "w-32 h-32 rounded-full gradient-bg flex items-center justify-center transition-all duration-300 shadow-xl",
                isAISpeaking && "animate-pulse scale-110 shadow-primary/20"
              )}>
                <Bot className="w-16 h-16 text-white" />
              </div>
            </div>
            {isAISpeaking && (
              <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-primary/20 rounded-full">
                <Volume2 className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-xs text-primary font-medium">AI Speaking...</span>
              </div>
            )}
            <div className="absolute top-4 left-4 px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs font-medium">
              AI Interviewer
            </div>
          </div>

          {/* User Video */}
          <div className="h-48 bg-secondary/20 rounded-2xl relative overflow-hidden border border-border/50">
            {isVideoOn ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5">
                <User className="w-20 h-20 text-muted-foreground/30" />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-secondary/30">
                <VideoOff className="w-12 h-12 text-muted-foreground/30" />
              </div>
            )}
            <div className="absolute top-3 left-3 px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-xs font-medium">
              You
            </div>
            {!isMicOn && (
              <div className="absolute top-3 right-3 p-1.5 bg-destructive/20 rounded-full">
                <MicOff className="w-4 h-4 text-destructive" />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm",
                isMicOn 
                  ? "bg-secondary/20 text-foreground hover:bg-secondary/30" 
                  : "bg-destructive/20 text-destructive"
              )}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm",
                isVideoOn 
                  ? "bg-secondary/20 text-foreground hover:bg-secondary/30" 
                  : "bg-destructive/20 text-destructive"
              )}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Chat Section */}
        <div className="flex-1 flex flex-col bg-secondary/5">
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
                  "max-w-[75%] px-5 py-3 rounded-2xl shadow-sm",
                  msg.role === 'ai' 
                    ? "bg-background text-foreground rounded-tl-none border border-border/50" 
                    : "gradient-bg text-white rounded-tr-none"
                )}>
                  <p className="leading-relaxed text-sm md:text-base">{msg.content}</p>
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
          </div>

          {/* Input */}
          <div className="p-6 bg-background border-t border-border/50">
            <div className="flex items-end gap-4 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your answer here..."
                  rows={2}
                  className="w-full px-4 py-3 bg-secondary/10 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
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

