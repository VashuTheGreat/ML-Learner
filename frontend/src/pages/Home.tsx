import { Link } from "react-router-dom";
import { ArrowRight, Play, Star, Users, BookOpen, Award } from "lucide-react";
import heroPerson from "@/assets/hero-person.png";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const Home = () => {
  const stats = [
    { icon: Users, label: "Active Students", value: "10K+" },
    { icon: BookOpen, label: "Courses", value: "50+" },
    { icon: Award, label: "Certificates", value: "5K+" },
    { icon: Star, label: "Rating", value: "4.9" },
  ];

  const courses = [
    { title: "JavaScript Fundamentals", level: "Beginner", lessons: 24, duration: "8 hours" },
    { title: "React Masterclass", level: "Intermediate", lessons: 32, duration: "12 hours" },
    { title: "Data Structures & Algorithms", level: "Advanced", lessons: 40, duration: "16 hours" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 mesh-gradient min-h-screen flex items-center">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Star className="w-4 h-4 fill-primary" />
                Top Rated Learning Platform
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight">
                A New Way To{" "}
                <span className="gradient-text">Learn</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                Master coding with our interactive courses, real-world projects, and 
                expert guidance. Start your journey to becoming a professional developer today.
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <Link to="/courses" className="btn-primary flex items-center gap-2">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button className="flex items-center gap-3 px-6 py-3 rounded-xl border-2 border-border hover:border-primary transition-colors">
                  <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
                    <Play className="w-4 h-4 text-primary-foreground fill-primary-foreground ml-0.5" />
                  </div>
                  <span className="font-semibold">Watch Demo</span>
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center sm:text-left">
                    <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 gradient-bg rounded-3xl blur-3xl opacity-30 scale-90"></div>
                <img 
                  src={heroPerson} 
                  alt="Student learning to code" 
                  className="relative z-10 w-full max-w-md rounded-3xl shadow-2xl animate-float"
                />
                
                {/* Floating Card */}
                <div className="absolute -left-8 top-1/4 glass-card rounded-2xl p-4 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-bold">50+ Courses</div>
                      <div className="text-sm text-muted-foreground">Available Now</div>
                    </div>
                  </div>
                </div>
                
                {/* Another Floating Card */}
                <div className="absolute -right-4 bottom-1/4 glass-card rounded-2xl p-4 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                      <Award className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <div>
                      <div className="font-bold">Certified</div>
                      <div className="text-sm text-muted-foreground">Upon Completion</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Popular Courses</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our most popular courses designed to help you master programming skills
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <div 
                key={index} 
                className="bg-card rounded-2xl p-6 shadow-soft card-hover"
              >
                <div className="h-40 rounded-xl gradient-bg mb-6 flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-primary-foreground" />
                </div>
                <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
                  {course.level}
                </div>
                <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {course.lessons} lessons • {course.duration}
                </p>
                <Link 
                  to="/courses" 
                  className="flex items-center gap-2 text-primary font-medium text-sm hover:gap-3 transition-all"
                >
                  Start Learning
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
