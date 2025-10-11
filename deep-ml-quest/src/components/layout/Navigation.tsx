import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import {
  Code,
  BookOpen,
  Zap,
  BarChart3,
  Users,
  Info,
  Mail,
  Menu,
  X,
} from "lucide-react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [session, setSession] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  // 👇 Handle scroll hide/show
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // 👇 Check session token
  useEffect(() => {
    const tokenData = sessionStorage.getItem("token");
    if (tokenData) {
      try {
        const parsed = JSON.parse(tokenData);
        setSession(parsed.user);
      } catch {
        setSession(null);
      }
    }
  }, []);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { name: "Home", path: "/", icon: null },
    { name: "Problems", path: "/problems", icon: Code },
    { name: "ML Playground", path: "/playground", icon: Zap },
    { name: "Dashboard", path: "/dashboard", icon: BarChart3 },
    { name: "Interview Prep", path: "/interview", icon: Users },
    { name: "About", path: "/about", icon: Info },
    { name: "Contact", path: "/contact", icon: Mail },
  ];

  function handleLogout() {
    sessionStorage.removeItem("token");
    setSession(null);
    navigate("/login");
  }

  function handleDashboardClick() {
    if (!session) {
      navigate("/signup");
    } else {
      navigate("/dashboard");
    }
  }

  function handleGetStarted() {
    if (session) {
      navigate("/dashboard");
    } else {
      navigate("/signup");
    }
  }

  return (
    <nav
      className={`bg-background/90 backdrop-blur-md border-b border-border fixed w-full top-0 z-50 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <Code className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-foreground">Deep ML Learner</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                // Dashboard visible only when logged in
                if (item.name === "Dashboard" && !session) return null;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={item.name === "Dashboard" ? handleDashboardClick : undefined}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-1 ${
                      isActive(item.path)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />
            {session ? (
              <>
                <span className="text-sm font-semibold text-foreground">
                  {session.user_metadata?.full_name || "User"}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button variant="default" size="sm" onClick={handleGetStarted}>
                Sign Up
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-3 border-t border-border bg-background/95 backdrop-blur-sm">
            <div className="px-2 pt-2 space-y-1">
              {navItems.map((item) => {
                if (item.name === "Dashboard" && !session) return null;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => {
                      setIsOpen(false);
                      if (item.name === "Dashboard") handleDashboardClick();
                    }}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive(item.path)
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {Icon && <Icon className="h-5 w-5" />}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <div className="flex justify-center pt-3 space-x-2">
                <ThemeToggle />
                {session ? (
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                ) : (
                  <Button variant="default" size="sm" onClick={handleGetStarted}>
                    Sign Up
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
