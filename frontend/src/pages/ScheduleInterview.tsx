import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Briefcase, 
  ChevronRight, 
  Check, 
  Bot, 
  Code2, 
  Users,
  Building2,
  BookOpen
} from "lucide-react";
import { format } from "date-fns";

import Footer from "@/components/layout/Footer";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import interviewApi from "@/Services/interviewApi";

const ScheduleInterview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [topic, setTopic] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const positions = [
    { id: "frontend", name: "Frontend Developer", icon: Code2 },
    { id: "backend", name: "Backend Developer", icon: Code2 },
    { id: "fullstack", name: "Full Stack Developer", icon: Code2 },
    { id: "data", name: "Data Scientist", icon: Briefcase },
  ];

  const interviewTypes = [
    { id: "ai", name: "AI Interview", description: "Practice with our AI interviewer", icon: Bot },
    { id: "mock", name: "Mock Interview", description: "Simulate real interview experience", icon: Users },
  ];

  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", 
    "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"
  ];

  const formatBackendTime = (date: Date, timeStr: string) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    let [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    let h = parseInt(hours, 10);
    if (modifier === 'PM' && h < 12) h += 12;
    if (modifier === 'AM' && h === 12) h = 0;
    const finalHours = String(h).padStart(2, '0');
    
    return `${year}-${month}-${day} ${finalHours}:${minutes}:00`;
  };

  const handleSchedule = async () => {
    if (!isFormComplete || !selectedDate) return;
    
    setIsSubmitting(true);
    try {
      const formattedTime = formatBackendTime(selectedDate, selectedTime);
      
      const payload = {
        companyName,
        topic,
        job_Role: selectedPosition,
        time: formattedTime,
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

  const isFormComplete = selectedDate && selectedTime && selectedPosition && selectedType && companyName && topic;

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
            
            {/* Step 1: Company & Topic */}
            <div className="mb-12">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full gradient-bg text-primary-foreground flex items-center justify-center text-sm">1</span>
                Interview Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" /> Company Name
                  </label>
                  <Input 
                    placeholder="e.g. Google, Amazon..." 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="bg-card border-border h-12 rounded-xl focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" /> Interview Topic
                  </label>
                  <Input 
                    placeholder="e.g. Machine Learning, React..." 
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-card border-border h-12 rounded-xl focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Select Position */}
            <div className="mb-12">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full gradient-bg text-primary-foreground flex items-center justify-center text-sm">2</span>
                Select Position
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {positions.map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() => setSelectedPosition(pos.id)}
                    className={cn(
                      "p-6 rounded-2xl border-2 transition-all hover:scale-105 text-left relative",
                      selectedPosition === pos.id
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                        : "border-border bg-card hover:border-primary/50"
                    )}
                  >
                    {selectedPosition === pos.id && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full gradient-bg flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                    <pos.icon className="w-8 h-8 text-primary mb-3" />
                    <div className="font-bold text-sm">{pos.name}</div>
                  </button>
                ))}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              {/* Step 4: Select Date */}
              <div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full gradient-bg text-primary-foreground flex items-center justify-center text-sm">4</span>
                  Select Date
                </h2>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full h-14 justify-start text-left font-bold rounded-xl border-2 px-6",
                        !selectedDate && "text-muted-foreground",
                        selectedDate && "border-primary bg-primary/5"
                      )}
                    >
                      <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      disabled={(date) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                      className="rounded-xl border shadow-2xl bg-card"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Step 5: Select Time */}
              <div>
                <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full gradient-bg text-primary-foreground flex items-center justify-center text-sm">5</span>
                  Select Time
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={cn(
                        "py-3 px-2 rounded-xl border-2 transition-all hover:scale-105 text-xs font-bold",
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
            </div>

            {/* Summary & Confirm */}
            {isFormComplete && (
              <div className="bg-card border border-primary/20 rounded-3xl p-8 mb-8 animate-fade-in shadow-xl shadow-primary/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" /> Interview Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm relative z-10">
                  <div className="space-y-1">
                    <div className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Company & Position</div>
                    <div className="font-bold text-base">{companyName}</div>
                    <div className="text-primary font-bold capitalize">{selectedPosition?.replace('-', ' ')}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Topic & Type</div>
                    <div className="font-bold text-base">{topic}</div>
                    <div className="text-muted-foreground font-bold">{selectedType === 'ai' ? 'AI Interview' : 'Mock Interview'}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">Schedule</div>
                    <div className="font-bold text-base">{selectedDate ? format(selectedDate, "MMMM dd, yyyy") : ""}</div>
                    <div className="text-primary font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {selectedTime}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
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
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ScheduleInterview;
