import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Trophy, Star, Search, Filter } from "lucide-react";

const Problems = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");

  const problems = [
    {
      id: 1,
      title: "Linear Regression Implementation",
      difficulty: "easy",
      acceptanceRate: 85,
      timeEstimate: "15 min",
      tags: ["regression", "numpy", "mathematics"],
      solved: true,
      description: "Implement linear regression from scratch using gradient descent."
    },
    {
      id: 2,
      title: "Decision Tree Classifier",
      difficulty: "medium",
      acceptanceRate: 72,
      timeEstimate: "30 min",
      tags: ["classification", "trees", "sklearn"],
      solved: false,
      description: "Build a decision tree classifier with information gain calculations."
    },
    {
      id: 3,
      title: "Neural Network Backpropagation",
      difficulty: "hard",
      acceptanceRate: 45,
      timeEstimate: "60 min",
      tags: ["neural networks", "deep learning", "backpropagation"],
      solved: false,
      description: "Implement backpropagation algorithm for a multi-layer perceptron."
    },
    {
      id: 4,
      title: "K-Means Clustering",
      difficulty: "easy",
      acceptanceRate: 78,
      timeEstimate: "20 min",
      tags: ["clustering", "unsupervised", "k-means"],
      solved: true,
      description: "Implement K-means clustering algorithm with centroids optimization."
    },
    {
      id: 5,
      title: "Random Forest Ensemble",
      difficulty: "medium",
      acceptanceRate: 65,
      timeEstimate: "45 min",
      tags: ["ensemble", "random forest", "bagging"],
      solved: false,
      description: "Build a random forest classifier using bootstrap aggregating."
    },
    {
      id: 6,
      title: "Gradient Boosting Implementation",
      difficulty: "hard",
      acceptanceRate: 38,
      timeEstimate: "90 min",
      tags: ["boosting", "ensemble", "gradient descent"],
      solved: false,
      description: "Implement gradient boosting algorithm with weak learners."
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "success";
      case "medium": return "warning";
      case "hard": return "destructive";
      default: return "secondary";
    }
  };

  const filteredProblems = problems.filter(problem => {
    const matchesSearch = problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         problem.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDifficulty = selectedDifficulty === "all" || problem.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ML Problems
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Master machine learning through hands-on coding challenges. From basic algorithms to advanced techniques.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="easy">Easy</TabsTrigger>
              <TabsTrigger value="medium">Medium</TabsTrigger>
              <TabsTrigger value="hard">Hard</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Problems Grid */}
        <div className="grid gap-6">
          {filteredProblems.map((problem) => (
            <Card key={problem.id} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3">
                      {problem.solved && (
                        <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
                          <Trophy className="h-4 w-4 text-success-foreground" />
                        </div>
                      )}
                      <span className={problem.solved ? "text-success" : ""}>{problem.title}</span>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {problem.description}
                    </CardDescription>
                  </div>
                  <Badge variant={getDifficultyColor(problem.difficulty) as any}>
                    {problem.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {problem.timeEstimate}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {problem.acceptanceRate}% acceptance
                    </div>
                  </div>
                  <Button variant="outline">
                    {problem.solved ? "Review" : "Solve"}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {problem.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProblems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No problems found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Problems;