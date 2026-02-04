import { Link } from "react-router-dom";
import { Code2, Mail, Phone, MapPin, Twitter, Linkedin, Github, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Code2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-background">
                ML Learner
              </span>
            </Link>
            <p className="text-background/70 text-sm leading-relaxed">
              A new way to learn coding with interactive courses and real-world projects.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/about" className="text-background/70 hover:text-background text-sm transition-colors">About Us</Link>
              <Link to="/courses" className="text-background/70 hover:text-background text-sm transition-colors">Courses</Link>
              <Link to="/quiz" className="text-background/70 hover:text-background text-sm transition-colors">Quiz</Link>
              <Link to="/contact" className="text-background/70 hover:text-background text-sm transition-colors">Contact</Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Contact</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-background/70">
                <Mail className="w-4 h-4" />
                <span>hello@MLcode.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-background/70">
                <Phone className="w-4 h-4" />
                <span>+91 123 456 7890</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-background/70">
                <MapPin className="w-4 h-4" />
                <span>Mumbai, India</span>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Follow Us</h4>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 mt-12 pt-8 text-center">
          <p className="text-sm text-background/60">
            © 2024 ML Learner. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
