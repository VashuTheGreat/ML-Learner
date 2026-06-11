import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { createContext, useContext, useState, useEffect } from "react";
import { Menu, X, Code2, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { CanvasBackground } from "./CanvasBackground";

export const SidebarContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (v: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (v: boolean) => void;
}>({ 
  isCollapsed: false, 
  setIsCollapsed: () => {}, 
  isMobileOpen: false, 
  setIsMobileOpen: () => {} 
});

export const useSidebar = () => useContext(SidebarContext);

export const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const checkTimer = () => {
      if (!location.pathname.startsWith("/multirag")) {
        setTimeLeft(null);
        return;
      }

      const start = localStorage.getItem("multirag_session_start");
      const duration = localStorage.getItem("multirag_session_duration");

      if (start && duration) {
        const elapsed = Math.floor((Date.now() - parseInt(start)) / 1000);
        const remaining = parseInt(duration) - elapsed;
        if (remaining > 0) {
          setTimeLeft(remaining);
        } else {
          localStorage.removeItem("multirag_session_start");
          localStorage.removeItem("multirag_session_duration");
          localStorage.removeItem("multirag_thread_id");
          setTimeLeft(null);
          window.dispatchEvent(new Event("storage"));
          navigate("/");
        }
      } else {
        setTimeLeft(null);
      }
    };

    checkTimer();
    window.addEventListener("storage", checkTimer);
    const interval = setInterval(checkTimer, 1000);

    return () => {
      window.removeEventListener("storage", checkTimer);
      clearInterval(interval);
    };
  }, [location.pathname, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const isUrgent = timeLeft !== null && timeLeft <= 60;

  // Auto-collapse on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
        setIsMobileOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }}>
      <div className="flex min-h-screen text-foreground w-full overflow-x-hidden">
        
        {timeLeft !== null && (
          <div className={cn(
            "fixed top-4 right-4 z-[9999] flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md shadow-lg transition-all duration-300",
            isUrgent 
              ? "border-red-500/50 text-red-400 bg-red-950/30 shadow-red-500/10 animate-bounce" 
              : "border-indigo-500/30 text-indigo-400 bg-slate-950/80 shadow-indigo-500/10"
          )}>
            <Timer className={cn("w-4 h-4", isUrgent ? "animate-pulse" : "animate-spin-slow")} style={{ animationDuration: isUrgent ? "0.5s" : "8s" }} />
            <span className="font-mono font-black text-sm tracking-wider">
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
        
        {/* Mobile Header */}
        <header
          className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-sidebar-border z-40 flex items-center justify-between px-4"
          style={{
            background: "hsl(var(--sidebar-background) / 0.75)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-sidebar-foreground" />
          </button>
          {/* Logo — icon + text */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center shadow-md">
              <Code2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base"><span className="text-primary">ML</span> Learner</span>
          </div>
          <div className="w-10"></div> {/* Spacer for symmetry */}
        </header>

        {/* Sidebar Overlay for Mobile */}
        {isMobileOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/70 z-40 transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        <Sidebar />

        {/* 3D WebGL Background Layer */}
        <CanvasBackground />

        {/* Main content shifts using margin so it never overlaps or leaves a gap */}
        <main
          className={cn(
            "flex flex-col min-h-screen transition-all duration-300 ease-in-out relative z-10",
            "pt-16 lg:pt-0", // Account for mobile header
            isCollapsed ? "lg:ml-[72px] w-full lg:w-[calc(100vw-72px)]" : "lg:ml-[260px] w-full lg:w-[calc(100vw-260px)]"
          )}
        >
          <div className="flex-1 w-full max-w-full animate-fade-in relative">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarContext.Provider>
  );
};

