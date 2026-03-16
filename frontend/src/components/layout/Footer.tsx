import { Link } from "react-router-dom";
import { Code2, Mail, Phone, MapPin, Twitter, Linkedin, Github, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-sidebar-background border-t border-sidebar-border text-foreground py-16">

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Logo */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-primary">ML</span> Learner
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              A new way to learn coding with interactive courses, real-world projects, and AI-powered mock interviews.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-widest">Quick Links</h4>
            <div className="flex flex-col gap-2.5">
              {[
                { label: "About Us", href: "/about" },
                { label: "Courses", href: "/courses" },
                { label: "Quiz", href: "/quiz" },
                { label: "Contact", href: "/contact" },
              ].map((l) => (
                <Link
                  key={l.href}
                  to={l.href}
                  className="text-muted-foreground hover:text-primary text-sm transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-widest">Contact</h4>
            <div className="flex flex-col gap-3">
              {[
                { icon: Mail, text: "hello@MLcode.com" },
                { icon: Phone, text: "+91 123 456 7890" },
                { icon: MapPin, text: "Mumbai, India" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Socials */}
          <div className="space-y-4">
            <h4 className="font-semibold text-sm uppercase tracking-widest">Follow Us</h4>
            <div className="flex items-center gap-3">
              {[Twitter, Linkedin, Github, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© 2025 ML Learner. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground font-medium">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
