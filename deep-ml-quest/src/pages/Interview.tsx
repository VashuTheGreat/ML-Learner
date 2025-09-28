import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Brain, MessageCircle, CheckCircle, Clock, Star } from "lucide-react";

const Interview = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const mcqQuestions = [
    {
      id: 1,
      question: "What is the primary purpose of regularization in machine learning?",
      options: [
        "To increase model complexity",
        "To prevent overfitting",
        "To speed up training",
        "To increase training accuracy"
      ],
      correctAnswer: 1,
      explanation: "Regularization helps prevent overfitting by adding a penalty term to the loss function."
    },
    {
      id: 2,
      question: "Which algorithm is best suited for linearly separable data?",
      options: [
        "K-Means",
        "Decision Tree",
        "SVM with linear kernel",
        "Random Forest"
      ],
      correctAnswer: 2,
      explanation: "SVM with linear kernel is optimal for linearly separable data."
    },
    {
      id: 3,
      question: "What does the bias-variance tradeoff represent?",
      options: [
        "Speed vs accuracy",
        "Simplicity vs complexity",
        "Underfitting vs overfitting balance",
        "Training vs testing performance"
      ],
      correctAnswer: 2,
      explanation: "The bias-variance tradeoff represents the balance between underfitting (high bias) and overfitting (high variance)."
    }
  ];

  const interviewTopics = [
    {
      category: "Machine Learning Fundamentals",
      topics: ["Supervised vs Unsupervised Learning", "Bias-Variance Tradeoff", "Cross-Validation", "Feature Selection"],
      level: "Beginner"
    },
    {
      category: "Algorithms",
      topics: ["Linear Regression", "Logistic Regression", "Decision Trees", "Random Forest", "SVM", "K-Means"],
      level: "Intermediate"
    },
    {
      category: "Deep Learning",
      topics: ["Neural Networks", "Backpropagation", "CNN", "RNN", "LSTM", "Transformers"],
      level: "Advanced"
    },
    {
      category: "Model Evaluation",
      topics: ["Accuracy vs Precision", "ROC Curves", "Confusion Matrix", "A/B Testing"],
      level: "Intermediate"
    }
  ];

  const chatbotQuestions = [
    "Explain the difference between bagging and boosting",
    "How would you handle missing data in a dataset?",
    "What are the assumptions of linear regression?",
    "Explain the concept of gradient descent",
    "How do you prevent overfitting in neural networks?"
  ];

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < mcqQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === mcqQuestions[index].correctAnswer) {
        correct++;
      }
    });
    return (correct / mcqQuestions.length) * 100;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner": return "default";
      case "Intermediate": return "secondary";
      case "Advanced": return "destructive";
      default: return "default";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Interview Preparation
          </h1>
          <p className="text-lg text-muted-foreground">
            Practice ML concepts and prepare for technical interviews
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="mcq" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mcq">MCQ Practice</TabsTrigger>
            <TabsTrigger value="topics">Study Topics</TabsTrigger>
            <TabsTrigger value="chatbot">AI Interview Chat</TabsTrigger>
          </TabsList>

          {/* MCQ Section */}
          <TabsContent value="mcq">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Question Panel */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        Question {currentQuestionIndex + 1} of {mcqQuestions.length}
                      </CardTitle>
                      <Badge variant="outline">
                        {Math.round(((currentQuestionIndex + 1) / mcqQuestions.length) * 100)}% Complete
                      </Badge>
                    </div>
                    <Progress value={((currentQuestionIndex + 1) / mcqQuestions.length) * 100} />
                  </CardHeader>
                  <CardContent>
                    {!showResults ? (
                      <div className="space-y-6">
                        <h3 className="text-lg font-medium">
                          {mcqQuestions[currentQuestionIndex].question}
                        </h3>
                        
                        <div className="space-y-3">
                          {mcqQuestions[currentQuestionIndex].options.map((option, index) => (
                            <button
                              key={index}
                              onClick={() => handleAnswerSelect(index)}
                              className={`w-full p-4 text-left rounded-lg border transition-colors ${
                                selectedAnswers[currentQuestionIndex] === index
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:bg-muted/50"
                              }`}
                            >
                              <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                              {option}
                            </button>
                          ))}
                        </div>

                        <div className="flex justify-between">
                          <Button 
                            variant="outline" 
                            disabled={currentQuestionIndex === 0}
                            onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                          >
                            Previous
                          </Button>
                          <Button 
                            onClick={handleNextQuestion}
                            disabled={selectedAnswers[currentQuestionIndex] === undefined}
                          >
                            {currentQuestionIndex === mcqQuestions.length - 1 ? "Finish" : "Next"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-6">
                        <div className="text-6xl font-bold text-primary">
                          {calculateScore().toFixed(0)}%
                        </div>
                        <h3 className="text-xl font-semibold">Quiz Complete!</h3>
                        <p className="text-muted-foreground">
                          You scored {selectedAnswers.filter((answer, index) => answer === mcqQuestions[index].correctAnswer).length} out of {mcqQuestions.length} questions correctly.
                        </p>
                        <Button onClick={() => {
                          setCurrentQuestionIndex(0);
                          setSelectedAnswers([]);
                          setShowResults(false);
                        }}>
                          Retake Quiz
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Progress Panel */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Questions Answered</span>
                        <span className="font-semibold">{selectedAnswers.filter(a => a !== undefined).length}/{mcqQuestions.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Current Streak</span>
                        <span className="font-semibold">5 days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Best Score</span>
                        <span className="font-semibold">95%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-2 text-muted-foreground">
                      <li>• Read each question carefully</li>
                      <li>• Consider all options before answering</li>
                      <li>• Review explanations after each quiz</li>
                      <li>• Practice regularly for best results</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Study Topics Section */}
          <TabsContent value="topics">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Interview Study Topics</h2>
                <p className="text-muted-foreground">
                  Master these key areas to excel in ML interviews
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {interviewTopics.map((topic, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <CardTitle className="text-lg">{topic.category}</CardTitle>
                        <Badge variant={getLevelColor(topic.level) as any}>
                          {topic.level}
                        </Badge>
                      </div>
                      <CardDescription>
                        Essential concepts for {topic.level.toLowerCase()} level interviews
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {topic.topics.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-success" />
                            {item}
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" className="w-full mt-4">
                        Study This Topic
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Chatbot Section */}
          <TabsContent value="chatbot">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      AI Interview Assistant
                    </CardTitle>
                    <CardDescription>
                      Practice answering interview questions with our AI assistant
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="flex-1 bg-muted/30 rounded-lg p-4 mb-4 overflow-y-auto">
                      <div className="space-y-4">
                        <div className="bg-primary/10 rounded-lg p-3 max-w-[80%]">
                          <p className="text-sm">
                            <strong>AI Assistant:</strong> Hello! I'm here to help you practice for ML interviews. 
                            I can ask you technical questions and provide feedback on your answers. Ready to start?
                          </p>
                        </div>
                        <div className="bg-card rounded-lg p-3 max-w-[80%] ml-auto">
                          <p className="text-sm">
                            <strong>You:</strong> Yes, I'm ready! Let's start with some fundamental questions.
                          </p>
                        </div>
                        <div className="bg-primary/10 rounded-lg p-3 max-w-[80%]">
                          <p className="text-sm">
                            <strong>AI Assistant:</strong> Great! Let's begin with this question: "Explain the difference between bagging and boosting in ensemble methods."
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type your answer here..."
                        className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <Button>Send</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sample Questions</CardTitle>
                    <CardDescription>Click to practice with these questions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {chatbotQuestions.map((question, index) => (
                        <button
                          key={index}
                          className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-sm"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Session Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Questions Practiced</span>
                        <span className="font-semibold">8</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Session Time</span>
                        <span className="font-semibold">25 min</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Avg Response Quality</span>
                        <div className="flex items-center gap-1">
                          {[...Array(4)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-current text-warning" />
                          ))}
                          <Star className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Interview;