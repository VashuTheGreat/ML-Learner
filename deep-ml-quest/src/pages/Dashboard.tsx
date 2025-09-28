import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Trophy, Target, Calendar, TrendingUp, BookOpen, Clock, Star, Award } from "lucide-react";

const Dashboard = () => {
  // Mock data
  const stats = {
    totalSolved: 47,
    totalProblems: 150,
    successRate: 85,
    currentStreak: 12,
    longestStreak: 25,
    ranking: 1247
  };

  const solvedByDifficulty = [
    { name: "Easy", solved: 25, total: 50, color: "hsl(var(--success))" },
    { name: "Medium", solved: 18, total: 70, color: "hsl(var(--warning))" },
    { name: "Hard", solved: 4, total: 30, color: "hsl(var(--destructive))" }
  ];

  const weeklyProgress = [
    { day: "Mon", problems: 2 },
    { day: "Tue", problems: 3 },
    { day: "Wed", problems: 1 },
    { day: "Thu", problems: 4 },
    { day: "Fri", problems: 2 },
    { day: "Sat", problems: 5 },
    { day: "Sun", problems: 3 }
  ];

  const monthlyProgress = [
    { month: "Jan", solved: 8 },
    { month: "Feb", solved: 12 },
    { month: "Mar", solved: 15 },
    { month: "Apr", solved: 10 },
    { month: "May", solved: 18 },
    { month: "Jun", solved: 22 }
  ];

  const recentActivity = [
    { problem: "Linear Regression Implementation", difficulty: "easy", status: "solved", date: "2 hours ago" },
    { problem: "Decision Tree Classifier", difficulty: "medium", status: "attempted", date: "1 day ago" },
    { problem: "K-Means Clustering", difficulty: "easy", status: "solved", date: "2 days ago" },
    { problem: "Neural Network Backpropagation", difficulty: "hard", status: "attempted", date: "3 days ago" }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "success";
      case "medium": return "warning"; 
      case "hard": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your progress and achievements in machine learning
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSolved}</div>
              <p className="text-xs text-muted-foreground">
                of {stats.totalProblems} total
              </p>
              <Progress value={(stats.totalSolved / stats.totalProblems) * 100} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successRate}%</div>
              <p className="text-xs text-muted-foreground">
                +2% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.currentStreak}</div>
              <p className="text-xs text-muted-foreground">
                Longest: {stats.longestStreak} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ranking</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">#{stats.ranking}</div>
              <p className="text-xs text-muted-foreground">
                Top 15% globally
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Problems by Difficulty */}
          <Card>
            <CardHeader>
              <CardTitle>Problems by Difficulty</CardTitle>
              <CardDescription>Your progress across different difficulty levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {solvedByDifficulty.map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.solved}/{item.total}
                      </span>
                    </div>
                    <Progress 
                      value={(item.solved / item.total) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weekly Activity */}
          <Card>
            <CardHeader>
              <CardTitle>This Week's Activity</CardTitle>
              <CardDescription>Problems solved per day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="problems" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Monthly Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Progress</CardTitle>
              <CardDescription>Problems solved over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthlyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="solved" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest problem attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.problem}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getDifficultyColor(activity.difficulty) as any} className="text-xs">
                          {activity.difficulty}
                        </Badge>
                        <Badge variant={activity.status === "solved" ? "default" : "secondary"} className="text-xs">
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{activity.date}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;