import { Link } from "react-router-dom";
import { ArrowRight, Target, Eye, Heart, Users, Award, BookOpen } from "lucide-react";
import heroPerson from "@/assets/hero-person.png";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const About = () => {
  const values = [
    { 
      icon: Target, 
      title: "Our Mission", 
      description: "To make quality coding education accessible to everyone, everywhere." 
    },
    { 
      icon: Eye, 
      title: "Our Vision", 
      description: "To become the world's leading platform for interactive programming education." 
    },
    { 
      icon: Heart, 
      title: "Our Values", 
      description: "Innovation, accessibility, and student success drive everything we do." 
    },
  ];

  const team = [
    { name: "Rahul Sharma", role: "Founder & CEO", specialization: "Full Stack Development" },
    { name: "Priya Patel", role: "Head of Education", specialization: "Data Science" },
    { name: "Amit Kumar", role: "Lead Instructor", specialization: "Frontend Development" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 mesh-gradient">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-5xl font-extrabold leading-tight">
                About <span className="gradient-text">ML Learner</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We're on a mission to transform how people learn to code. Our platform 
                combines cutting-edge technology with proven teaching methods to help 
                you achieve your programming goals faster than ever before.
              </p>
              <Link to="/courses" className="btn-primary inline-flex items-center gap-2">
                Explore Courses
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="relative flex justify-center">
              <div className="absolute inset-0 gradient-bg rounded-3xl blur-3xl opacity-20 scale-90"></div>
              <img 
                src={heroPerson} 
                alt="About us" 
                className="relative z-10 w-full max-w-sm rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-foreground text-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary">10K+</div>
              <div className="text-background/70 mt-2">Students Enrolled</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary">50+</div>
              <div className="text-background/70 mt-2">Expert Courses</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent">95%</div>
              <div className="text-background/70 mt-2">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">24/7</div>
              <div className="text-background/70 mt-2">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Drives Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our core principles guide every decision we make
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div 
                key={index} 
                className="p-8 rounded-2xl border border-border hover:border-primary transition-colors group"
              >
                <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <value.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Expert instructors dedicated to your success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div 
                key={index} 
                className="bg-card rounded-2xl p-6 text-center shadow-soft card-hover"
              >
                <div className="w-24 h-24 mx-auto rounded-full gradient-bg flex items-center justify-center mb-6">
                  <Users className="w-12 h-12 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                <p className="text-primary font-medium text-sm mb-2">{member.role}</p>
                <p className="text-muted-foreground text-sm">{member.specialization}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
