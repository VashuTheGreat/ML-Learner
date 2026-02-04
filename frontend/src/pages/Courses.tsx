import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Clock, Users, Star, ArrowRight, BookOpen } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { cn } from "@/lib/utils";

const Courses = () => {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Frontend", "Backend", "Data Science", "Mobile", "DevOps"];

  const courses = [
    { 
      id: 1,
      title: "JavaScript Fundamentals", 
      category: "Frontend",
      level: "Beginner", 
      lessons: 24, 
      duration: "8 hours",
      students: 2500,
      rating: 4.8,
      description: "Master the basics of JavaScript programming"
    },
    { 
      id: 2,
      title: "React Masterclass", 
      category: "Frontend",
      level: "Intermediate", 
      lessons: 32, 
      duration: "12 hours",
      students: 1800,
      rating: 4.9,
      description: "Build modern web applications with React"
    },
    { 
      id: 3,
      title: "Node.js Backend Development", 
      category: "Backend",
      level: "Intermediate", 
      lessons: 28, 
      duration: "10 hours",
      students: 1500,
      rating: 4.7,
      description: "Create scalable backend APIs with Node.js"
    },
    { 
      id: 4,
      title: "Python for Data Science", 
      category: "Data Science",
      level: "Beginner", 
      lessons: 36, 
      duration: "14 hours",
      students: 3200,
      rating: 4.9,
      description: "Learn Python for data analysis and ML"
    },
    { 
      id: 5,
      title: "React Native Development", 
      category: "Mobile",
      level: "Advanced", 
      lessons: 40, 
      duration: "16 hours",
      students: 1200,
      rating: 4.8,
      description: "Build cross-platform mobile applications"
    },
    { 
      id: 6,
      title: "Docker & Kubernetes", 
      category: "DevOps",
      level: "Advanced", 
      lessons: 30, 
      duration: "12 hours",
      students: 900,
      rating: 4.7,
      description: "Master containerization and orchestration"
    },
  ];

  const filteredCourses = activeCategory === "All" 
    ? courses 
    : courses.filter(c => c.category === activeCategory);

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Header Section */}
      <section className="pt-32 pb-16 mesh-gradient">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <h1 className="text-5xl font-extrabold mb-6">
              Explore Our <span className="gradient-text">Courses</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Choose from our wide range of programming courses designed by industry experts
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Search courses..."
                className="input-field pl-12 pr-4"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-4 mb-12">
            <Filter className="w-5 h-5 text-muted-foreground" />
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  activeCategory === category 
                    ? "gradient-bg text-primary-foreground" 
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <div 
                key={course.id} 
                className="bg-card rounded-2xl overflow-hidden shadow-soft card-hover border border-border"
              >
                <div className="h-40 gradient-bg flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-primary-foreground" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {course.level}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                      {course.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{course.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {course.students}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-accent text-accent" />
                      {course.rating}
                    </div>
                  </div>

                  <Link 
                    to={`/welcome-quiz`}
                    className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
                  >
                    Enroll Now
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Courses;
