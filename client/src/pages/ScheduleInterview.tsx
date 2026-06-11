import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Clock, 
  Briefcase, 
  ChevronRight, 
  Check, 
  Bot, 
  Code2, 
  Users,
  Building2,
  Calendar as CalendarIcon
} from "lucide-react";

import Footer from "@/components/layout/Footer";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import interviewApi from "@/services/interviewApi";

const ScheduleInterview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Dynamic configuration loaded from the backend
  const [companies, setCompanies] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("ai");
  const [companyName, setCompanyName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch options from the backend on component mount
  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        const options = await interviewApi.getInterviewOptions();
        if (options) {
          setCompanies(options.companies || []);
          setPositions(options.positions || []);
          setTimeSlots(options.durations || []);
          
          // Set initial defaults
          if (options.companies && options.companies.length > 0) {
            setCompanyName(options.companies[0]);
          }
          if (options.positions && options.positions.length > 0) {
            setSelectedPosition(options.positions[0]);
          }
          if (options.durations && options.durations.length > 0) {
            setSelectedTime(options.durations[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load interview options:", err);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  const interviewTypes = [
    { id: "ai", name: "AI Interview", description: "Practice with our AI interviewer", icon: Bot },
    { id: "mock", name: "Mock Interview", description: "Simulate real interview experience", icon: Users },
  ];

  const getPositionIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("frontend") || lower.includes("backend") || lower.includes("full stack") || lower.includes("fullstack")) {
      return Code2;
    }
    return Briefcase;
  };

  const handleSchedule = async () => {
    if (!isFormComplete) return;
    
    setIsSubmitting(true);
    try {
      // Convert duration string to seconds
      let durationSeconds = 10 * 60;
      if (selectedTime.includes("3")) durationSeconds = 3 * 60;
      else if (selectedTime.includes("5")) durationSeconds = 5 * 60;
      else if (selectedTime.includes("10")) durationSeconds = 10 * 60;

      const payload = {
        companyName,
        topic: selectedPosition,
        job_Role: selectedPosition,
        time: new Date().toISOString(),
        duration: durationSeconds,
        status: "pending"
      };

      const createdInterview = await interviewApi.scheduleInterview(payload);
      
      toast({ 
        title: "Interview Scheduled", 
        description: `Your interview for ${companyName} has been scheduled successfully!` 
      });
      if (selectedType === "ai") {
        navigate(`/interview/${createdInterview._id}`);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Failed to schedule interview:", error);
      toast({ 
        title: "Scheduling Failed", 
        description: "There was an error scheduling your interview. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormComplete = selectedTime && selectedPosition && selectedType && companyName;

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      {/* Header */}
      <section className="pt-32 pb-16 mesh-gradient">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-2xl gradient-bg flex items-center justify-center mb-6">
              <CalendarIcon className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-5xl font-extrabold mb-6">
              Schedule <span className="gradient-text">Interview</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              Book your interview session and practice with our AI interviewer
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {loadingOptions ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="text-muted-foreground animate-pulse">Loading interview options...</p>
              </div>
            ) : (
              <>
                {/* Step 1: Company Details */}
                <div className="mb-12">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full gradient-bg text-primary-foreground flex items-center justify-center text-sm">1</span>
                    Interview Details
                  </h2>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2 col-span-full">
                      <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" /> Company Name
                      </label>
                      <select
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full bg-card border border-border h-12 px-4 rounded-xl focus:ring-2 focus:ring-primary/20 text-sm font-medium focus:outline-none"
                      >
                        {companies.map((company) => (
                          <option key={company} value={company} className="bg-card text-foreground">
                            {company}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Step 2: Select Position */}
                <div className="mb-12">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full gradient-bg text-primary-foreground flex items-center justify-center text-sm">2</span>
                    Select Position
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {positions.map((posName) => {
                      const IconComponent = getPositionIcon(posName);
                      return (
                        <button
                          key={posName}
                          type="button"
                          onClick={() => setSelectedPosition(posName)}
                          className={cn(
                            "p-6 rounded-2xl border-2 transition-all hover:scale-105 text-left relative",
                            selectedPosition === posName
                              ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                              : "border-border bg-card hover:border-primary/50"
                          )}
                        >
                          {selectedPosition === posName && (
                            <div className="absolute top-3 right-3 w-6 h-6 rounded-full gradient-bg flex items-center justify-center">
                              <Check className="w-4 h-4 text-primary-foreground" />
                            </div>
                          )}
                          <IconComponent className="w-8 h-8 text-primary mb-3" />
                          <div className="font-bold text-sm">{posName}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 3: Interview Type */}
                <div className="mb-12">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full gradient-bg text-primary-foreground flex items-center justify-center text-sm">3</span>
                    Interview Type
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {interviewTypes.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedType(type.id)}
                        className={cn(
                          "p-6 rounded-2xl border-2 transition-all hover:scale-105 text-left flex items-start gap-4 relative",
                          selectedType === type.id
                            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                            : "border-border bg-card hover:border-primary/50"
                        )}
                      >
                        <div className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                          selectedType === type.id ? "gradient-bg" : "bg-muted"
                        )}>
                          <type.icon className={cn(
                            "w-7 h-7",
                            selectedType === type.id ? "text-primary-foreground" : "text-muted-foreground"
                          )} />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold mb-1">{type.name}</div>
                          <div className="text-sm text-muted-foreground leading-relaxed">{type.description}</div>
                        </div>
                        {selectedType === type.id && (
                          <Check className="w-6 h-6 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 4: Select Duration (Time) */}
                <div className="mb-12">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full gradient-bg text-primary-foreground flex items-center justify-center text-sm">4</span>
                    Select Duration
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        type="button"
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          "py-4 px-3 rounded-xl border-2 transition-all hover:scale-105 text-sm font-bold text-center",
                          selectedTime === time
                            ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                            : "border-border bg-card hover:border-primary/50"
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary & Confirm */}
                {isFormComplete && (
                  <div className="bg-card border border-primary/20 rounded-3xl p-8 mb-8 animate-fade-in shadow-xl shadow-primary/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary" /> Interview Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm relative z-10">
                      <div className="space-y-1">
                        <div className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Company & Position</div>
                        <div className="font-bold text-base">{companyName}</div>
                        <div className="text-primary font-bold">{selectedPosition}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Type</div>
                        <div className="font-bold text-base">{selectedType === 'ai' ? 'AI Interview' : 'Mock Interview'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Duration</div>
                        <div className="text-primary font-bold flex items-center gap-1.5 text-base">
                          <Clock className="w-4 h-4" /> {selectedTime}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="button"
                  onClick={handleSchedule}
                  disabled={!isFormComplete || isSubmitting}
                  className={cn(
                    "w-full h-16 rounded-2xl text-lg font-bold transition-all duration-300 shadow-xl",
                    isFormComplete && "hover:-translate-y-1 hover:shadow-primary/30",
                    !isFormComplete && "opacity-50 grayscale"
                  )}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-primary-foreground"></div>
                      Scheduling...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {selectedType === 'ai' ? 'Start AI Interview Now' : 'Save Interview Schedule'}
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ScheduleInterview;
