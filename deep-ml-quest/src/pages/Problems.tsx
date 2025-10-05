import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Trophy, Star, Search, ChevronLeft, ChevronRight } from "lucide-react";

const PROBLEMS_PER_PAGE = 10;

const Problems = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [problemsData, setProblemsData] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await fetch("http://localhost:3000/problems");
        const data = await res.json();
        console.log("Fetched data:", data);
        
        let actualData = data;
        if (Array.isArray(data) && data.length === 1 && Array.isArray(data[0])) {
          actualData = data[0];
        }
        
        setProblemsData(actualData);

        const allProblems = [];

        if (Array.isArray(actualData)) {
          allProblems.push(
            ...actualData.map((p: any) => {
              let decodedDesc = "";
              try {
                decodedDesc = p.description ? atob(p.description) : "";
              } catch (e) {
                console.error("Failed to decode description:", e);
              }
              
              return {
                ...p,
                difficulty: p.difficulty || p.tinygrad_difficulty || p.pytorch_difficulty || "easy",
                data: {
                  title: p.title || decodedDesc.split('\n')[0] || `Problem ${p.id}`,
                  description: decodedDesc || "No description available",
                  solved: false,
                  timeEstimate: "30 min",
                  acceptanceRate: null,
                  tags: p.category ? [p.category] : ["Uncategorized"]
                }
              };
            })
          );
        } else {
          if (Array.isArray(data.easy)) {
            allProblems.push(...data.easy.map((p: any) => ({ ...p, difficulty: "easy" })));
          }
          if (Array.isArray(data.medium)) {
            allProblems.push(...data.medium.map((p: any) => ({ ...p, difficulty: "medium" })));
          }
          if (Array.isArray(data.difficult)) {
            allProblems.push(...data.difficult.map((p: any) => ({ ...p, difficulty: "hard" })));
          }
        }

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
    const title = (problem.data?.title || problem.title || problem.folder || "").toString();
    const desc = (problem.data?.description || "").toString();
    const tags = Array.isArray(problem.data?.tags) ? problem.data.tags : [];

    const matchesSearch =
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tags.some((tag: string) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesDifficulty =
      selectedDifficulty === "all" || problem.difficulty === selectedDifficulty;

    return matchesSearch && matchesDifficulty;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredProblems.length / PROBLEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * PROBLEMS_PER_PAGE;
  const endIndex = startIndex + PROBLEMS_PER_PAGE;
  const currentProblems = filteredProblems.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDifficulty]);

  const handleSolveProblem = (problem: any) => {
    // Store in sessionStorage for reliable data transfer
    sessionStorage.setItem('currentProblem', JSON.stringify(problem));
    sessionStorage.setItem('problemsData', JSON.stringify(problemsData));
    
    window.location.href = '/solve';
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading problems...</p>
        </div>
      </div>
    );
  }

  if (problems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-gradient-to-br from-slate-50 to-slate-100">
        <p className="text-muted-foreground text-lg">No problems loaded</p>
        <p className="text-sm text-muted-foreground">Check console for errors</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
  {/* Header */}
  <div className="bg-gradient-to-r border-b border-border shadow-lg
                dark:from-gray-800 dark:to-gray-900
                from-blue-500 to-purple-600">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
      ML Problems
    </h1>
    <p className="text-lg text-white/90 max-w-2xl">
      Master machine learning through hands-on coding challenges. From basic algorithms to advanced techniques.
    </p>
    <div className="mt-6 flex gap-6 text-white/90">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5" />
        <span>{problems.length} Problems</span>
      </div>
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5" />
        <span>Community Driven</span>
      </div>
    </div>
  </div>
</div>


  {/* Content */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Search + Filters */}
    <div className="flex flex-col md:flex-row gap-4 mb-8 bg-card p-6 rounded-xl shadow-sm">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search problems by title, description, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-border focus:border-primary"
        />
      </div>
      <Tabs value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
        <TabsList className="bg-muted">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="easy">Easy</TabsTrigger>
          <TabsTrigger value="medium">Medium</TabsTrigger>
          <TabsTrigger value="hard">Hard</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>

    {/* Results count */}
    <div className="mb-4 text-sm text-muted-foreground">
      Showing {startIndex + 1}-{Math.min(endIndex, filteredProblems.length)} of {filteredProblems.length} problems
    </div>

    {/* Problems Grid */}
    <div className="grid gap-4 mb-8">
      {currentProblems.map((problem, idx) => (
        <Card key={problem.id || idx} className="hover:shadow-lg transition-all duration-200 border-border bg-card">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-3 text-xl">
                  {problem.data?.solved && (
                    <div className="w-7 h-7 bg-success rounded-full flex items-center justify-center flex-shrink-0">
                      <Trophy className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <span className={problem.data?.solved ? "text-success" : "text-foreground"}>
                    {problem.data?.title || problem.title || `Problem ${problem.id}`}
                  </span>
                </CardTitle>
                <CardDescription className="mt-2 text-muted-foreground line-clamp-2">
                  {problem.data?.description || "No description available."}
                </CardDescription>
              </div>
              <Badge variant={getDifficultyColor(problem.difficulty) as any} className="flex-shrink-0">
                {problem.difficulty}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {problem.data?.timeEstimate || "30 min"}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  {problem.likes || "0"} likes
                </div>
              </div>
              <Button
                onClick={() => handleSolveProblem(problem)}
                className="bg-primary hover:bg-primary-focus"
              >
                {problem.data?.solved ? "Review" : "Solve Problem"}
              </Button>
            </div>
            {problem.data?.tags && problem.data.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {problem.data.tags.map((tag: string, tagIdx: number) => (
                  <Badge key={tagIdx} variant="secondary" className="text-xs bg-muted text-foreground">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Pagination */}
    {filteredProblems.length > 0 && (
      <div className="flex items-center justify-center gap-2 mt-8 bg-card p-6 rounded-xl shadow-sm">
        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="border-border"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            const showPage =
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1);

            const showEllipsis =
              (page === currentPage - 2 && currentPage > 3) ||
              (page === currentPage + 2 && currentPage < totalPages - 2);

            if (showEllipsis) {
              return <span key={page} className="px-2 text-muted-foreground">...</span>;
            }

            if (!showPage) return null;

            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(page)}
                className={currentPage === page ? "bg-primary hover:bg-primary-focus" : "border-border"}
              >
                {page}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="border-border"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    )}

    {filteredProblems.length === 0 && (
      <div className="text-center py-20 bg-card rounded-xl shadow-sm">
        <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg text-muted-foreground mb-2">No problems found</p>
        <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
      </div>
    )}
  </div>
</div>

  );
};

export default Problems;