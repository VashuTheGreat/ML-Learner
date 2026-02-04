import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Linkedin, ExternalLink } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

const LinkedinConnect = () => {
  const navigate = useNavigate();
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const handleNext = () => {
    navigate("/quiz");
  };

  const handleSkip = () => {
    navigate("/quiz");
  };

  return (
    <div className="min-h-screen mesh-gradient">
      <Navbar />
      
      <div className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="flex items-center justify-center gap-2 mb-12">
              <div className="w-3 h-3 rounded-full gradient-bg"></div>
              <div className="w-8 h-1 gradient-bg rounded-full"></div>
              <div className="w-3 h-3 rounded-full gradient-bg"></div>
              <div className="w-8 h-1 gradient-bg rounded-full"></div>
              <div className="w-3 h-3 rounded-full gradient-bg"></div>
            </div>

            {/* Content Card */}
            <div className="bg-card rounded-3xl p-8 md:p-12 shadow-soft-lg animate-fade-in">
              <div className="text-center mb-10">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-[#0077B5] flex items-center justify-center mb-6">
                  <Linkedin className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  Connect with me on{" "}
                  <span className="text-[#0077B5]">LinkedIn</span>
                </h1>
                <p className="text-muted-foreground">
                  Stay connected and get exclusive tips, job updates, and networking opportunities.
                </p>
              </div>

              {/* LinkedIn Input */}
              <div className="space-y-4 mb-8">
                <label className="block text-sm font-medium">
                  Your LinkedIn Profile URL
                </label>
                <div className="relative">
                  <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0077B5]" />
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/your-profile"
                    className="input-field pl-12"
                  />
                </div>
              </div>

              {/* Connect Button */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#0077B5] text-white font-semibold hover:bg-[#006399] transition-colors mb-4"
              >
                <Linkedin className="w-5 h-5" />
                Connect on LinkedIn
                <ExternalLink className="w-4 h-4" />
              </a>

              {/* Next Button */}
              <button
                onClick={handleNext}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Continue to Quiz
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Skip Option */}
              <button
                onClick={handleSkip}
                className="w-full text-center text-muted-foreground text-sm mt-4 hover:text-foreground transition-colors"
              >
                Skip for now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedinConnect;
