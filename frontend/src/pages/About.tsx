import { Link } from "react-router-dom";
import { ArrowRight, Target, Eye, Heart, Users, BookOpen, Rocket, Sparkles, Code2, Brain } from "lucide-react";

import Footer from "@/components/layout/Footer";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Our Mission",
      description: "To make quality ML & coding education accessible to everyone, everywhere — from beginners to senior engineers.",
      gradient: "from-primary to-accent",
      iconBg: "bg-primary/10 text-primary",
    },
    {
      icon: Eye,
      title: "Our Vision",
      description: "To become the world's leading platform for interactive machine learning education and interview preparation.",
      gradient: "from-accent to-secondary",
      iconBg: "bg-accent/10 text-accent",
    },
    {
      icon: Heart,
      title: "Our Values",
      description: "Innovation, accessibility, and student success drive every feature we ship and every decision we make.",
      gradient: "from-secondary to-primary",
      iconBg: "bg-secondary/20 text-secondary-foreground",
    },
  ];

  const stats = [
    { value: "10K+", label: "Students Enrolled", icon: Users },
    { value: "50+", label: "Expert Courses", icon: BookOpen },
    { value: "95%", label: "Success Rate", icon: Target },
    { value: "24/7", label: "Support Available", icon: Rocket },
  ];

  const team = [
    {
      name: "Rahul Sharma",
      role: "Founder & CEO",
      specialization: "Full Stack Development",
      initials: "RS",
      color: "from-primary to-accent",
    },
    {
      name: "Priya Patel",
      role: "Head of Education",
      specialization: "Data Science & ML",
      initials: "PP",
      color: "from-accent to-secondary",
    },
    {
      name: "Amit Kumar",
      role: "Lead Instructor",
      specialization: "Frontend Development",
      initials: "AK",
      color: "from-secondary to-primary",
    },
  ];

  const features = [
    { icon: Code2, label: "Coding Platform", desc: "Practice real interview questions" },
    { icon: Brain, label: "AI Interviews", desc: "Simulate real interview sessions" },
    { icon: Sparkles, label: "ML Playground", desc: "Train models interactively" },
  ];

  return (
    <div className="min-h-screen w-full relative">


      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 mesh-gradient overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-7 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold">
                <Sparkles className="w-4 h-4" />
                About ML Learner
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
                We're Building the <span className="gradient-text">Future of Learning</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                Our platform combines cutting-edge AI with proven teaching methods to help you
                achieve your programming and machine learning goals faster than ever before.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/courses" className="btn-primary inline-flex items-center gap-2">
                  Explore Courses
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/contact" className="btn-outline inline-flex items-center gap-2">
                  Get In Touch
                </Link>
              </div>
            </div>

            {/* Feature chips */}
            <div className="flex flex-col gap-4 animate-slide-up">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-card border border-border rounded-2xl p-5 card-hover group"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <f.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{f.label}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────── */}
      <section className="py-16 border-y border-border/50 relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="group space-y-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-4xl font-extrabold gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────── */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-semibold mb-5">
              <Heart className="w-4 h-4" />
              Core Principles
            </div>
            <h2 className="text-4xl font-bold mb-4">What Drives Us</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our core principles guide every decision we make and every feature we build.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="group bg-card border border-border rounded-3xl p-8 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${value.iconBg}`}>
                  <value.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                <div className="mt-6 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────── */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-5">
              <Users className="w-4 h-4" />
              The Team
            </div>
            <h2 className="text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Expert instructors and engineers dedicated to your success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="group bg-card border border-border rounded-3xl p-8 text-center hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 card-hover overflow-hidden relative"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
                <div className={`w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center mb-6 text-3xl font-black text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {member.initials}
                </div>
                <h3 className="text-xl font-bold mb-1 text-foreground">{member.name}</h3>
                <p className="text-primary font-semibold text-sm mb-2">{member.role}</p>
                <p className="text-muted-foreground text-sm">{member.specialization}</p>
                <div className="mt-5 flex justify-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                    {member.specialization.split(" ")[0]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="relative rounded-3xl overflow-hidden gradient-bg p-12 text-center text-white">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Start Learning?</h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Join thousands of students who are already building the future with ML Learner.
              </p>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 bg-white text-primary font-bold px-8 py-4 rounded-xl hover:bg-white/90 transition-colors shadow-xl"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
