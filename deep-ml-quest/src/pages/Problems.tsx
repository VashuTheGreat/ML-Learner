import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Trophy, Star, Search } from "lucide-react";

const Problems = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [problemsData, setProblemsData] = useState<any>(null);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await fetch("http://localhost:3000/problems");
        const data = await res.json();
        
        setProblemsData(data); // Store original data

        const allProblems = [
          ...data.easy.map((p: any) => ({ ...p, difficulty: "easy" })),
          ...data.medium.map((p: any) => ({ ...p, difficulty: "medium" })),
          ...data.difficult.map((p: any) => ({ ...p, difficulty: "hard" })),
        ];

        const shuffledProblems = allProblems.sort(() => Math.random() - 0.5);
        setProblems(shuffledProblems);
      } catch (err) {
        console.error("❌ Failed to fetch problems:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "success";
      case "medium":
        return "warning";
      case "hard":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const filteredProblems = problems.filter((problem) => {
    const title = problem.data?.title || problem.folder;
    const desc = problem.data?.description || "";
    const tags = problem.data?.tags || [];
    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDifficulty =
      selectedDifficulty === "all" || problem.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const handleSolveProblem = (problem: any) => {
    // Store problem data in sessionStorage (works across page navigation)
    sessionStorage.setItem('currentProblem', JSON.stringify(problem));
    sessionStorage.setItem('problemsData', JSON.stringify(problemsData));
    
    // Navigate to solve page
    window.location.href = '/solve';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading problems...
      </div>
    );
  }

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
        {/* Search + Filters */}
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
          {filteredProblems.map((problem, idx) => (
            <Card key={idx} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3">
                      {problem.data?.solved && (
                        <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
                          <Trophy className="h-4 w-4 text-success-foreground" />
                        </div>
                      )}
                      <span className={problem.data?.solved ? "text-success" : ""}>
                        {problem.data?.title || problem.folder}
                      </span>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {problem.data?.description || "No description available."}
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
                      {problem.data?.timeEstimate || "—"}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {problem.data?.acceptanceRate
                        ? `${problem.data.acceptanceRate}% acceptance`
                        : "N/A"}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleSolveProblem(problem)}
                  >
                    {problem.data?.solved ? "Review" : "Solve"}
                  </Button>
                </div>
                {problem.data?.tags && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {problem.data.tags.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
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