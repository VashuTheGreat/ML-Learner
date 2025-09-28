import Hero from "@/components/sections/Hero";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Code, 
  Brain, 
  Users, 
  Trophy, 
  ArrowRight, 
  BookOpen, 
  Target,
  Zap,
  BarChart3,
  Star
} from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Code,
      title: "Interactive Coding",
      description: "Practice with real ML algorithms in our built-in code editor with syntax highlighting."
    },
    {
      icon: Brain,
      title: "ML Playground",
      description: "Experiment with different models and datasets to understand how they work."
    },
    {
      icon: Target,
      title: "Structured Learning",
      description: "Progress through carefully designed problems from beginner to advanced."
    },
    {
      icon: BarChart3,
      title: "Track Progress",
      description: "Monitor your improvement with detailed analytics and performance metrics."
    },
    {
      icon: Users,
      title: "Interview Prep",
      description: "Prepare for ML interviews with curated questions and practice sessions."
    },
    {
      icon: Trophy,
      title: "Achievements",
      description: "Earn badges and compete with others as you master machine learning."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "ML Engineer at Google",
      content: "Deep ML Learner helped me transition from software engineering to machine learning. The hands-on approach is amazing!"
    },
    {
      name: "Marcus Johnson",
      role: "Data Scientist",
      content: "The best platform for learning ML through practice. The problems are well-structured and progressively challenging."
    },
    {
      name: "Emily Rodriguez",
      role: "PhD Student",
      content: "I use this platform to supplement my research. The playground feature is perfect for quick experiments."
    }
  ];

  return (
    <div className="min-h-screen">
      <Hero />

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Deep ML Learner?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform combines the best of interactive learning with real-world applications
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <p className="text-muted-foreground">Active Learners</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">Problems</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">95%</div>
              <p className="text-muted-foreground">Success Rate</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">4.9★</div>
              <p className="text-muted-foreground">User Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of successful learners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current text-warning" />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Master Machine Learning?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our community of learners and start your journey to becoming an ML expert today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-4 group">
              Start Learning Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4">
              View Problems
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
