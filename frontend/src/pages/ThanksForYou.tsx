import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Building2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { cn } from "@/lib/utils";

const ThanksForYou = () => {
  const navigate = useNavigate();
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  const companies = [
    { id: "google", name: "Google", color: "bg-blue-500" },
    { id: "amazon", name: "Amazon", color: "bg-orange-500" },
    { id: "microsoft", name: "Microsoft", color: "bg-green-500" },
    { id: "meta", name: "Meta", color: "bg-blue-600" },
    { id: "cognizant", name: "Cognizant", color: "bg-purple-500" },
    { id: "infosys", name: "Infosys", color: "bg-teal-500" },
  ];

  const toggleCompany = (id: string) => {
    setSelectedCompanies(prev => 
      prev.includes(id) 
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  const handleNext = () => {
    navigate("/linkedin-connect");
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
              <div className="w-8 h-1 bg-border rounded-full"></div>
              <div className="w-3 h-3 rounded-full bg-border"></div>
            </div>

            {/* Content Card */}
            <div className="bg-card rounded-3xl p-8 md:p-12 shadow-soft-lg animate-fade-in">
              <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  Thanks For <span className="gradient-text">You!</span>
                </h1>
                <p className="text-muted-foreground">
                  Which companies are you targeting for placement? Select your dream companies.
                </p>
              </div>

              {/* Company Selection Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                {companies.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => toggleCompany(company.id)}
                    className={cn(
                      "relative p-6 rounded-2xl border-2 transition-all hover:scale-105",
                      selectedCompanies.includes(company.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {selectedCompanies.includes(company.id) && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full gradient-bg flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                    <div className={cn("w-12 h-12 rounded-xl mb-3 flex items-center justify-center mx-auto", company.color)}>
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="font-semibold text-center">{company.name}</div>
                  </button>
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                disabled={selectedCompanies.length === 0}
                className={cn(
                  "btn-primary w-full flex items-center justify-center gap-2",
                  selectedCompanies.length === 0 && "opacity-50 cursor-not-allowed"
                )}
              >
                Next Step
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThanksForYou;
