import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Code2,
  Home, Info, BookOpen, PenTool, FlaskConical, Briefcase, Mail, LayoutDashboard,
  LogOut, ChevronLeft, ChevronRight, Sun, Moon, User as UserIcon, Palette, X,
  Bot, FileText, Linkedin
} from "lucide-react";
import { cn } from "@/lib/utils";
import userApi from "@/Services/userApi";
import { useSidebar } from "./AppLayout";
import { useTheme, THEMES, ThemeId } from "@/contexts/ThemeContext";
import { User } from "@/types";

const mapPathToIcon: Record<string, any> = {
  "/": Home, "/about": Info, "/courses": BookOpen, "/practice": PenTool,
  "/playground": FlaskConical, "/apply": Briefcase, "/contact": Mail, "/dashboard": LayoutDashboard,
  "/schedule-interview": Bot, "/templates": FileText, "/job-fetcher": Linkedin
};

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Courses", path: "/courses" },
  { name: "Practice", path: "/practice" },
  { name: "ML Playground", path: "/playground" },
  { name: "Job Fetcher", path: "/job-fetcher" },
  { name: "AI Interview", path: "/schedule-interview" },
  { name: "Resume Builder", path: "/templates" },
  { name: "Apply", path: "/apply" },
  { name: "Contact", path: "/contact" },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
  const { themeId, isDark, setTheme, toggleDark } = useTheme();
  const [showThemePicker, setShowThemePicker] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try { setUser(JSON.parse(storedUser)); } catch { setUser(null); }
      } else {
        setUser(null);
      }
    };
    handleStorageChange();
    window.addEventListener("auth-change", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("auth-change", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    try { await userApi.logout(); } catch { /* ignore */ } finally {
      localStorage.removeItem("user");
      setUser(null);
      window.dispatchEvent(new Event("auth-change"));
      navigate("/login");
    }
  };

  const visibleLinks = [...navLinks];
  if (user) visibleLinks.push({ name: "Dashboard", path: "/dashboard" });

  return (
    <>
      {/* ── Sidebar panel ───────────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 flex flex-col",
          "border-r border-sidebar-border shadow-2xl",
          "transition-all duration-300 ease-in-out",
          // z-index: high only when mobile drawer is open
          isMobileOpen ? "z-50" : "z-30",
          // Mobile responsive classes
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{
          width: isMobileOpen ? "280px" : isCollapsed ? "72px" : "260px",
          background: "hsl(var(--sidebar-background) / 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Collapse toggle (Desktop only) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3 top-6 h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar-background shadow-md hover:bg-sidebar-accent transition-colors z-50"
          aria-label="Toggle sidebar"
        >
          {isCollapsed
            ? <ChevronRight className="h-3.5 w-3.5 text-sidebar-foreground" />
            : <ChevronLeft  className="h-3.5 w-3.5 text-sidebar-foreground" />
          }
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden absolute right-4 top-4 p-2 text-sidebar-foreground/50 hover:text-foreground transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Logo */}
        <div className={cn(
          "flex h-[64px] items-center border-b border-sidebar-border flex-shrink-0",
          isCollapsed && !isMobileOpen ? "justify-center px-0" : "px-4"
        )}>
          <Link
            to="/"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 overflow-hidden min-w-0"
          >
            <div className="w-9 h-9 min-w-[36px] rounded-xl gradient-bg flex items-center justify-center shadow-md flex-shrink-0">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <span
              className={cn(
                "text-lg font-bold whitespace-nowrap text-sidebar-foreground overflow-hidden transition-all duration-300",
                isCollapsed && !isMobileOpen ? "w-0 opacity-0 pointer-events-none" : "w-auto opacity-100"
              )}
            >
              <span className="text-primary">ML</span> Learner
            </span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1 scrollbar-none">
          {visibleLinks.map((link) => {
            const Icon = mapPathToIcon[link.path] || Code2;
            const isActive =
              location.pathname === link.path ||
              (link.path !== "/" && location.pathname.startsWith(link.path));

            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed ? link.name : undefined}
                className={cn(
                  "group relative flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 outline-none",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  isCollapsed && !isMobileOpen && "lg:justify-center lg:px-0"
                )}
              >
                {/* Active left bar */}
                {isActive && (!isCollapsed || isMobileOpen) && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-primary rounded-r-full" />
                )}
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    (!isCollapsed || isMobileOpen) && "mr-3",
                    isActive ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                  )}
                />
                <span
                  className={cn(
                    "truncate transition-all duration-300",
                    isCollapsed && !isMobileOpen ? "lg:w-0 lg:opacity-0 lg:overflow-hidden" : "w-auto opacity-100"
                  )}
                >
                  {link.name}
                </span>
              </Link>
            );
          })}
        </nav>


        {/* Bottom actions */}
        <div className="p-3 border-t border-sidebar-border space-y-1 flex-shrink-0">

          {/* Theme Palette button */}
          <button
            onClick={() => setShowThemePicker((v) => !v)}
            title={isCollapsed ? "Change Theme" : undefined}
            className={cn(
              "flex w-full items-center rounded-xl p-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors",
              isCollapsed && !isMobileOpen ? "justify-center" : "gap-3"
            )}
          >
            <Palette className="h-5 w-5 flex-shrink-0" />
            <span className={cn("transition-all duration-300 whitespace-nowrap", isCollapsed && !isMobileOpen ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100")}>
              Theme
            </span>
            {(!isCollapsed || isMobileOpen) && (
              <span
                className="ml-auto w-4 h-4 rounded-full border-2 border-sidebar-border flex-shrink-0"
                style={{ background: `hsl(var(--primary))` }}
              />
            )}
          </button>

          {/* Dark/Light toggle */}
          <button
            onClick={toggleDark}
            title={isCollapsed ? "Toggle theme" : undefined}
            className={cn(
              "flex w-full items-center rounded-xl p-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors",
              isCollapsed && !isMobileOpen ? "justify-center" : "gap-3"
            )}
          >
            {isDark ? <Sun className="h-5 w-5 flex-shrink-0" /> : <Moon className="h-5 w-5 flex-shrink-0" />}
            <span className={cn("transition-all duration-300 whitespace-nowrap", isCollapsed && !isMobileOpen ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100")}>
              {isDark ? "Light Mode" : "Dark Mode"}
            </span>
          </button>

          {/* User section */}
          {user ? (
            <div className={cn("flex items-center pt-1", isCollapsed && !isMobileOpen ? "justify-center" : "justify-between gap-2")}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 min-w-[36px] rounded-lg gradient-bg flex items-center justify-center text-sm font-bold text-white overflow-hidden shadow-sm flex-shrink-0">
                  {user.avatar
                    ? <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                    : user.fullName.charAt(0).toUpperCase()
                  }
                </div>
                <div className={cn("flex flex-col overflow-hidden transition-all duration-300 min-w-0", isCollapsed && !isMobileOpen ? "w-0 opacity-0" : "w-auto opacity-100")}>
                  <span className="text-sm font-bold truncate text-sidebar-foreground">{user.fullName}</span>
                  <span className="text-xs text-sidebar-foreground/55 truncate">{user.email}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex-shrink-0"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className={cn("flex flex-col gap-2 pt-1", isCollapsed && !isMobileOpen ? "items-center" : "")}>
              <Link
                to="/login"
                title={isCollapsed ? "Login" : undefined}
                className={cn(
                  "flex items-center justify-center rounded-xl text-sm font-medium transition-all text-primary hover:bg-primary/10 border border-primary/20",
                  isCollapsed ? "p-2.5" : "py-2 px-4"
                )}
              >
                {isCollapsed ? <UserIcon className="h-5 w-5" /> : "Login"}
              </Link>
              {!isCollapsed && (
                <Link to="/signup" className="btn-primary text-sm py-2 px-4 text-center w-full">
                  Sign Up
                </Link>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* ── Theme Picker Panel (slides out above sidebar) ── */}
      {showThemePicker && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowThemePicker(false)}
          />
          <div
            className={cn(
              "fixed bottom-0 z-50 bg-sidebar-background border border-sidebar-border rounded-2xl shadow-2xl p-4",
              "animate-scale-in"
            )}
            style={{
              left: isCollapsed ? "80px" : "268px",
              bottom: "80px",
              width: "220px",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Pick a Theme
              </p>
              <button
                onClick={() => setShowThemePicker(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t.id as ThemeId); setShowThemePicker(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200",
                    themeId === t.id
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  {/* Color duo */}
                  <div className="flex gap-1 flex-shrink-0">
                    <span className="w-4 h-4 rounded-full border border-border" style={{ background: t.light }} />
                    <span className="w-4 h-4 rounded-full border border-border" style={{ background: t.dark }} />
                  </div>
                  <span>{t.name}</span>
                  {themeId === t.id && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 text-center">
              Pairs with ☀️ / 🌙 toggle above
            </p>
          </div>
        </>
      )}
    </>
  );
};
