import { Link } from "react-router-dom";
import { Code2, Mail, Phone, MapPin, Twitter, Linkedin, Github, Instagram, ArrowRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-background text-foreground pt-24 pb-12 border-t border-border/50">
      {/* Premium Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="container relative z-10 mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand & Newsletter (Takes 5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            <Link to="/" className="flex items-center gap-3 w-fit group">
              <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
                <Code2 className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight">
                <span className="gradient-text">ML</span> Learner
              </span>
            </Link>
            
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Empowering the next generation of engineers with interactive courses, real-world projects, and AI-driven mock interviews. Learn, practice, and get hired faster.
            </p>

            <div className="space-y-4">
              <h4 className="font-bold text-sm text-foreground">Subscribe to our newsletter</h4>
              <div className="flex items-center gap-2 max-w-sm relative">
                <input 
                  type="email" 
                  placeholder="Enter your email address..." 
                  className="w-full bg-secondary/10 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-12"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white hover:scale-105 transition-transform shadow-md">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Links (Takes 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="font-bold text-base tracking-wide text-foreground">Explore</h4>
            <div className="flex flex-col gap-3">
              {[
                { label: "Home", href: "/" },
                { label: "About Us", href: "/about" },
                { label: "Courses", href: "/courses" },
                { label: "AI Interview", href: "/schedule-interview" },
                { label: "ML Playground", href: "/playground" },
              ].map((l) => (
                <Link
                  key={l.href}
                  to={l.href}
                  className="text-muted-foreground hover:text-primary text-sm font-medium transition-all hover:translate-x-1"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact (Takes 3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <h4 className="font-bold text-base tracking-wide text-foreground">Contact Us</h4>
            <div className="flex flex-col gap-4">
              {[
                { icon: Mail, text: "hello@mllearner.com" },
                { icon: Phone, text: "+91 987 654 3210" },
                { icon: MapPin, text: "Tech Hub, Mumbai, India" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3 text-sm text-muted-foreground group cursor-pointer hover:text-primary transition-colors">
                  <div className="p-2 rounded-lg bg-secondary/10 group-hover:bg-primary/10 transition-colors mt-0.5">
                     <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="leading-relaxed font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Socials (Takes 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <h4 className="font-bold text-base tracking-wide text-foreground">Connect</h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Twitter, label: 'Twitter' }, 
                { icon: Linkedin, label: 'LinkedIn' }, 
                { icon: Github, label: 'GitHub' }, 
                { icon: Instagram, label: 'Instagram' }
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="group flex flex-col items-center justify-center p-3 rounded-xl bg-secondary/10 border border-border/50 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
                >
                  <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-sm text-muted-foreground font-medium">
            <p>© 2025 ML Learner. All rights reserved.</p>
            <div className="flex items-center gap-4">
               <Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
               <Link to="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 backdrop-blur-sm shadow-[0_0_15px_rgba(34,197,94,0.1)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs text-green-600 dark:text-green-400 font-bold uppercase tracking-wide">All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
