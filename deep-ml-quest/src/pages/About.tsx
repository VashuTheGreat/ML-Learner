import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, Award, Target } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            About Deep ML Learner
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Empowering the next generation of machine learning engineers through 
            interactive coding challenges, comprehensive tutorials, and real-world applications.
          </p>
        </div>

        {/* Mission Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="border-border hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-foreground">Learn by Doing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Master machine learning concepts through hands-on coding challenges 
                and interactive tutorials designed for all skill levels.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-success" />
              </div>
              <CardTitle className="text-foreground">Community Driven</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Join a thriving community of learners and experts sharing knowledge, 
                solutions, and best practices in machine learning.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-warning" />
              </div>
              <CardTitle className="text-foreground">Industry Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Prepare for real-world ML engineering roles with practical projects 
                and interview preparation resources.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-2xl text-foreground flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              What Makes Us Different
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Comprehensive Problem Set
                </h3>
                <p className="text-muted-foreground mb-4">
                  From basic data structures to advanced neural networks, our curated 
                  problems cover the entire spectrum of machine learning concepts.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Data Preprocessing</Badge>
                  <Badge variant="secondary">Model Selection</Badge>
                  <Badge variant="secondary">Feature Engineering</Badge>
                  <Badge variant="secondary">Deep Learning</Badge>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  Interactive Learning
                </h3>
                <p className="text-muted-foreground mb-4">
                  Test your models in real-time with our ML playground, visualize 
                  results, and understand the impact of different parameters.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Real-time Feedback</Badge>
                  <Badge variant="secondary">Visual Analytics</Badge>
                  <Badge variant="secondary">Performance Metrics</Badge>
                  <Badge variant="secondary">Model Comparison</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;