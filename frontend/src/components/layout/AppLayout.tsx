import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { createContext, useContext, useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <div className="flex min-h-screen bg-background text-foreground w-full overflow-x-hidden">
        
        {/* Mobile Header */}
        <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-sidebar-background border-b border-sidebar-border z-40 flex items-center justify-between px-4">
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-sidebar-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg"><span className="text-primary">ML</span> Learner</span>
          </div>
          <div className="w-10"></div> {/* Spacer for symmetry */}
        </header>

        {/* Sidebar Overlay for Mobile */}
        {isMobileOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        <Sidebar />

        {/* Main content shifts using margin so it never overlaps or leaves a gap */}
        <main
          className={cn(
            "flex flex-col min-h-screen transition-all duration-300 ease-in-out w-full",
            "pt-16 lg:pt-0" // Account for mobile header
          )}
          style={{
            marginLeft: (window.innerWidth >= 1024) ? (isCollapsed ? "72px" : "260px") : "0",
            width: (window.innerWidth >= 1024) ? `calc(100% - ${isCollapsed ? "72px" : "260px"})` : "100%",
          }}
        >
          <div className="flex-1 w-full animate-fade-in relative">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarContext.Provider>
  );
};

