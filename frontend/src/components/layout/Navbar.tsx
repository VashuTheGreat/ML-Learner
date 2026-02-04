import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Code2, User as UserIcon, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import userApi from "@/Services/userApi";

interface User {
  _id: string;
  fullName: string;
  email: string;
  avatar?: string;
}

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user data", error);
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await userApi.logout();
      setUser(null);
      localStorage.removeItem("user");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
      localStorage.removeItem("user");
      setUser(null);
      navigate("/login");
    }
  };
  
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Courses", path: "/courses" },
    { name: "Practice", path: "/practice" },
    // { name: "Quiz", path: "/quiz" },
    { name: "apply", path: "/apply" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
            <Code2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">
            <span className="gradient-text">ML</span> Learner
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "nav-link text-sm",
                location.pathname === link.path && "nav-link-active"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-secondary/10 transition-all duration-300 border border-transparent hover:border-border"
              >
                <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-sm font-bold text-white overflow-hidden shadow-sm">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    user.fullName.charAt(0).toUpperCase()
                  )}
                </div>
                <span className="hidden sm:block text-sm font-medium">{user.fullName.split(' ')[0]}</span>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-300", isDropdownOpen && "rotate-180")} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-2xl shadow-xl py-2 animate-in fade-in zoom-in duration-200 z-[60]">
                  <div className="px-4 py-2 border-b border-border mb-2">
                    <p className="text-sm font-bold truncate">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  
                  <Link 
                    to="/dashboard" 
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors mt-2 border-t border-border pt-4"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-outline text-sm py-2 px-4">
                Login
              </Link>
              <Link to="/signup" className="btn-primary text-sm py-2 px-4">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
