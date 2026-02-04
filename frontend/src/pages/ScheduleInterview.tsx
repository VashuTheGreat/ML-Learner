import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, Briefcase, ChevronRight, Check, Bot, Code2, Users } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

const ScheduleInterview = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");

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

  // Generate next 7 days
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' })
      });
    }
    return days;
  };

  const days = getNextDays();

  const handleSchedule = () => {
    // Dummy function
    console.log("Interview scheduled:", {
      date: selectedDate,
      time: selectedTime,
      position: selectedPosition,
      type: selectedType
    });
    
    // Navigate to interview or confirmation
    if (selectedType === "ai") {
      navigate("/ai-interview");
    } else {
      alert("Interview scheduled successfully! You'll receive a confirmation email.");
      navigate("/");
    }
  };

  const isFormComplete = selectedDate && selectedTime && selectedPosition && selectedType;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Header */}
      <section className="pt-32 pb-16 mesh-gradient">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-2xl gradient-bg flex items-center justify-center mb-6">
              <Calendar className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-5xl font-extrabold mb-6">
              Schedule <span className="gradient-text">Interview</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Book your interview session and practice with our AI interviewer
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Step 1: Select Position */}
            <div className="mb-12">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full gradient-bg text-primary-foreground flex items-center justify-center text-sm">1</span>
                Select Position
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {positions.map((pos) => (
                  <button
                    key={pos.id}
                    onClick={() => setSelectedPosition(pos.id)}
                    className={cn(
                      "p-6 rounded-2xl border-2 transition-all hover:scale-105 text-left",
                      selectedPosition === pos.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {selectedPosition === pos.id && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full gradient-bg flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                    <pos.icon className="w-8 h-8 text-primary mb-3" />
                    <div className="font-semibold text-sm">{pos.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Interview Type */}
            <div className="mb-12">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full gradient-bg text-primary-foreground flex items-center justify-center text-sm">2</span>
                Interview Type
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {interviewTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={cn(
                      "p-6 rounded-2xl border-2 transition-all hover:scale-105 text-left flex items-start gap-4",
                      selectedType === type.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0",
                      selectedType === type.id ? "gradient-bg" : "bg-muted"
                    )}>
                      <type.icon className={cn(
                        "w-7 h-7",
                        selectedType === type.id ? "text-primary-foreground" : "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <div className="font-bold mb-1">{type.name}</div>
                      <div className="text-sm text-muted-foreground">{type.description}</div>
                    </div>
                    {selectedType === type.id && (
                      <Check className="w-6 h-6 text-primary ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Select Date */}
            <div className="mb-12">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full gradient-bg text-primary-foreground flex items-center justify-center text-sm">3</span>
                Select Date
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {days.map((day) => (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    className={cn(
                      "flex-shrink-0 w-20 py-4 rounded-2xl border-2 transition-all hover:scale-105 text-center",
                      selectedDate === day.date
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="text-xs text-muted-foreground mb-1">{day.day}</div>
                    <div className="text-2xl font-bold">{day.dayNum}</div>
                    <div className="text-xs text-muted-foreground">{day.month}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Select Time */}
            <div className="mb-12">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full gradient-bg text-primary-foreground flex items-center justify-center text-sm">4</span>
                Select Time
              </h2>
              <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
                {timeSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={cn(
                      "py-3 px-4 rounded-xl border-2 transition-all hover:scale-105 text-sm font-medium",
                      selectedTime === time
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary & Confirm */}
            {isFormComplete && (
              <div className="bg-muted/50 rounded-2xl p-6 mb-8 animate-fade-in">
                <h3 className="font-bold mb-4">Interview Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Position</div>
                    <div className="font-semibold capitalize">{selectedPosition?.replace('-', ' ')} Developer</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Type</div>
                    <div className="font-semibold">{selectedType === 'ai' ? 'AI Interview' : 'Mock Interview'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Date</div>
                    <div className="font-semibold">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Time</div>
                    <div className="font-semibold">{selectedTime}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSchedule}
              disabled={!isFormComplete}
              className={cn(
                "w-full btn-primary flex items-center justify-center gap-2 py-4 text-lg",
                !isFormComplete && "opacity-50 cursor-not-allowed"
              )}
            >
              {selectedType === 'ai' ? 'Start AI Interview Now' : 'Schedule Interview'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ScheduleInterview;
