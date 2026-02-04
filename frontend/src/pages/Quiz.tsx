import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock, Code2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const Quiz = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showCode, setShowCode] = useState(true);

  const questions = [
    {
      id: 1,
      title: "Two Sum",
      difficulty: "Easy",
      category: "Array",
      question: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      code: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      options: [
        "O(n²) - Brute Force",
        "O(n) - Hash Map",
        "O(n log n) - Sorting",
        "O(1) - Constant"
      ],
      correctAnswer: 1
    },
    {
      id: 2,
      title: "Reverse String",
      difficulty: "Easy",
      category: "String",
      question: "Write a function that reverses a string. The input string is given as an array of characters.",
      code: `function reverseString(s: string[]): void {
  let left = 0;
  let right = s.length - 1;
  while (left < right) {
    [s[left], s[right]] = [s[right], s[left]];
    left++;
    right--;
  }
}`,
      options: [
        "O(n) - Two Pointers",
        "O(n²) - Nested Loop",
        "O(n log n) - Recursive",
        "O(1) - Single Pass"
      ],
      correctAnswer: 0
    },
    {
      id: 3,
      title: "Valid Parentheses",
      difficulty: "Medium",
      category: "Stack",
      question: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
      code: `function isValid(s: string): boolean {
  const stack: string[] = [];
  const pairs: Record<string, string> = {
    ')': '(',
    '}': '{',
    ']': '['
  };
  
  for (const char of s) {
    if (char in pairs) {
      if (stack.pop() !== pairs[char]) {
        return false;
      }
    } else {
      stack.push(char);
    }
  }
  return stack.length === 0;
}`,
      options: [
        "O(n²) - Nested Loops",
        "O(n) - Stack",
        "O(log n) - Binary Search",
        "O(n) - Two Pointers"
      ],
      correctAnswer: 1
    }
  ];

  const currentQ = questions[currentQuestion];

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion]: answerIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      navigate("/thanks-participating");
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-code text-code-foreground">
      {/* Header */}
      <div className="border-b border-code-foreground/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <Code2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">
              <span className="gradient-text">ML</span> Learner
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-code-foreground/70">
              <Clock className="w-4 h-4" />
              <span>15:00</span>
            </div>
            <span className="text-sm">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Panel - Question */}
        <div className={cn(
          "border-r border-code-foreground/10 overflow-y-auto transition-all",
          showCode ? "w-1/2" : "w-full"
        )}>
          <div className="p-6">
            {/* Question Header */}
            <div className="flex items-center gap-4 mb-6">
              <h1 className="text-2xl font-bold">{currentQ.id}. {currentQ.title}</h1>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-medium",
                currentQ.difficulty === "Easy" && "bg-green-500/20 text-green-400",
                currentQ.difficulty === "Medium" && "bg-yellow-500/20 text-yellow-400",
                currentQ.difficulty === "Hard" && "bg-red-500/20 text-red-400"
              )}>
                {currentQ.difficulty}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                {currentQ.category}
              </span>
            </div>

            {/* Question Text */}
            <div className="prose prose-invert mb-8">
              <p className="text-code-foreground/80 leading-relaxed">
                {currentQ.question}
              </p>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-code-foreground/60 mb-4">
                What is the optimal time complexity for this problem?
              </h3>
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-all",
                    selectedAnswers[currentQuestion] === index
                      ? "border-primary bg-primary/10"
                      : "border-code-foreground/20 hover:border-code-foreground/40"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium",
                      selectedAnswers[currentQuestion] === index
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-code-foreground/40"
                    )}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-code-foreground/10">
              <button
                onClick={handlePrev}
                disabled={currentQuestion === 0}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                  currentQuestion === 0
                    ? "text-code-foreground/30 cursor-not-allowed"
                    : "text-code-foreground/70 hover:text-code-foreground"
                )}
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              <button
                onClick={handleNext}
                className="btn-primary flex items-center gap-2"
              >
                {currentQuestion === questions.length - 1 ? "Submit" : "Next"}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel - Code */}
        {showCode && (
          <div className="w-1/2 overflow-y-auto">
            <div className="p-4 border-b border-code-foreground/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm font-medium">Solution Code</span>
              </div>
              <button 
                onClick={() => setShowCode(false)}
                className="text-xs text-code-foreground/50 hover:text-code-foreground"
              >
                Hide Code
              </button>
            </div>
            <div className="p-6">
              <pre className="bg-code-foreground/5 rounded-xl p-4 overflow-x-auto">
                <code className="text-sm font-mono text-code-foreground/90 whitespace-pre">
                  {currentQ.code}
                </code>
              </pre>
            </div>
          </div>
        )}

        {!showCode && (
          <button 
            onClick={() => setShowCode(true)}
            className="fixed right-4 bottom-4 btn-primary flex items-center gap-2"
          >
            <Code2 className="w-4 h-4" />
            Show Code
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
