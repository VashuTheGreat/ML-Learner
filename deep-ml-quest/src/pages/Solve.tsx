
import { useState, useEffect, useRef } from "react";

import { Badge } from "@/components/ui/badge";
import { Play, Settings, Clock, BarChart2, BookOpen, ChevronLeft, ChevronRight, RotateCcw, CheckCircle2, XCircle } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { EditorView } from "@codemirror/view";
import { useNavigate } from "react-router-dom";


const ProblemList = ({ problems = [], onSelectProblem }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isDark, setIsDark] = useState(true);
  const problemsPerPage = 10;
  
  if (!problems || problems.length === 0) {
    const bgMain = isDark ? 'bg-gray-900' : 'bg-white';
    const textPrimary = isDark ? 'text-gray-100' : 'text-gray-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
    
    return (
      <div className={`min-h-screen ${bgMain} ${textPrimary} flex items-center justify-center`}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Problems Available</h2>
          <p className={textSecondary}>Please pass problems array as prop</p>
          <pre className={`mt-4 ${textSecondary} text-xs`}>
            {'<App problems={problemsArray} />'}
          </pre>
        </div>
      </div>
    );
  }
  
  const totalPages = Math.ceil(problems.length / problemsPerPage);
  const startIdx = (currentPage - 1) * problemsPerPage;
  const currentProblems = problems.slice(startIdx, startIdx + problemsPerPage);

  const getDifficultyColor = (difficulty) => {
    if (difficulty?.toLowerCase().includes('easy')) return 'bg-green-500';
    if (difficulty?.toLowerCase().includes('medium')) return 'bg-yellow-500';
    if (difficulty?.toLowerCase().includes('hard')) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const bgMain = isDark ? 'bg-gray-900' : 'bg-white';
  const bgSecondary = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const hoverBg = isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100';

  return (
    <div className={`min-h-screen ${bgMain} ${textPrimary}`}>
      <div className={`border-b ${borderColor} ${bgSecondary}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">ML Problem Set</h1>
          <button 
            onClick={() => setIsDark(!isDark)}
            className={`p-2 rounded ${hoverBg}`}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className={`${bgSecondary} rounded-lg border ${borderColor} overflow-hidden`}>
          <table className="w-full">
            <thead className={`border-b ${borderColor}`}>
              <tr className={textSecondary}>
                <th className="text-left px-6 py-4 font-medium">#</th>
                <th className="text-left px-6 py-4 font-medium">Title</th>
                <th className="text-left px-6 py-4 font-medium">Category</th>
                <th className="text-left px-6 py-4 font-medium">Difficulty</th>
                <th className="text-left px-6 py-4 font-medium">Acceptance</th>
              </tr>
            </thead>
            <tbody>
              {currentProblems.map((problem, idx) => (
                <tr 
                  key={problem.id}
                  className={`border-b ${borderColor} ${hoverBg} cursor-pointer transition-colors`}
                  onClick={() => onSelectProblem(problem)}
                >
                  <td className="px-6 py-4">{startIdx + idx + 1}</td>
                  <td className="px-6 py-4 font-medium">{problem.title}</td>
                  <td className="px-6 py-4">{problem.category}</td>
                  <td className="px-6 py-4">
                    <Badge className={`${getDifficultyColor(problem.difficulty)} text-white`}>
                      {problem.difficulty}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">{problem.acceptanceRate || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-2 rounded ${hoverBg} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <ChevronLeft size={20} />
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  currentPage === i + 1 
                    ? 'bg-blue-600 text-white' 
                    : `${hoverBg}`
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-2 rounded ${hoverBg} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Solve = ({ problem: propProblem, onBack }) => {
  const [problem, setProblem] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [code, setCode] = useState("");
  const [isDark, setIsDark] = useState(true);
  const [output, setOutput] = useState("");
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  
  // Use ref to track if code has been initialized

  const codeInitialized = useRef(false);
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
    // 👇 Check session token
    useEffect(() => {
      const tokenData = sessionStorage.getItem("token");
      if (tokenData) {
        try {
          const parsed = JSON.parse(tokenData);
          setSession(parsed.user);
        } catch {
          setSession(null);
        }
      }
    }, []);


  useEffect(() => {
    if (propProblem && !codeInitialized.current) {
      setProblem(propProblem);
      
      try {
        const starterCode = propProblem.starter_code 
          ? atob(propProblem.starter_code)
          : propProblem.starterCode || "# Write your code here\n";
        setCode(starterCode);
      } catch (e) {
        setCode(propProblem.starter_code || propProblem.starterCode || "# Write your code here\n");
      }
      
      codeInitialized.current = true;
    }
  }, [propProblem]);

  if (!problem) return null;

  const bgMain = isDark ? 'bg-gray-900' : 'bg-white';
  const bgSecondary = isDark ? 'bg-gray-800' : 'bg-gray-50';
  const bgCode = isDark ? 'bg-gray-950' : 'bg-gray-100';
  const textPrimary = isDark ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const hoverBg = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100';
  const tabActive = isDark ? 'border-blue-500 text-blue-500' : 'border-blue-600 text-blue-600';
  const tabInactive = isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900';

  const getDifficultyColor = (difficulty) => {
    if (difficulty?.toLowerCase().includes('easy')) return 'bg-green-500';
    if (difficulty?.toLowerCase().includes('medium')) return 'bg-yellow-500';
    if (difficulty?.toLowerCase().includes('hard')) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const testCases = problem.test_cases || problem.testCases || [];
  
  const example = problem.example || null;

  const description = problem.description 
    ? (() => {
        try {
          const decoded = atob(problem.description);
          return decoded;
        } catch (e) {
          return problem.description;
        }
      })()
    : "No description available";

  const learnSection = problem.learn_section 
    ? (() => {
        try {
          const decoded = atob(problem.learn_section);
          return decoded;
        } catch (e) {
          return problem.learn_section;
        }
      })()
    : null;

  const solution = problem.solution 
    ? (() => {
        try {
          return atob(problem.solution);
        } catch (e) {
          return problem.solution;
        }
      })()
    : null;

  const handleRun = async () => {
    setIsRunning(true);
    setOutput("Running tests...\n");
    setTestResults([]);

    try {
      const results = [];
      
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const testInput = testCase.test || testCase.input;
        const expectedOutput = testCase.expected_output || testCase.expectedOutput;
        
        const testCode = `${code}\n\n${testInput}`;
        
        try {
          const encodedCode = btoa(testCode);
          console.log("Sending code to backend:", { code: encodedCode });
          
          const res = await fetch("http://localhost:3000/run", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: encodedCode }),
          });
          
          if (!res.ok) {
            throw new Error(`Backend returned ${res.status}: ${res.statusText}`);
          }
          
          const data = await res.json();
          console.log("Backend response:", data);
          
          const actualOutput = (data.output || data.error || "No output").trim();
          const expectedTrimmed = (expectedOutput || "").toString().trim();
function arraysEqual(a, b) {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  return a.every((val, idx) => Math.abs(val - b[idx]) < 1e-6);
}

const actualArray = actualOutput.match(/-?\d+(\.\d+)?/g).map(Number);
const expectedArray = expectedTrimmed.match(/-?\d+(\.\d+)?/g).map(Number);

const passed = arraysEqual(actualArray, expectedArray);
          
          results.push({
            testNum: i + 1,
            input: testInput,
            expected: expectedTrimmed,
            actual: actualOutput,
            passed
          });
        } catch (err) {
          console.error(`Test ${i + 1} failed:`, err);
          results.push({
            testNum: i + 1,
            input: testInput,
            expected: expectedOutput,
            actual: `Error: ${err.message}`,
            passed: false
          });
        }
      }
      
      setTestResults(results);
      const passedCount = results.filter(r => r.passed).length;
      setOutput(`Completed: ${passedCount}/${results.length} test cases passed\n\n${
        results.map(r => 
          `Test ${r.testNum}: ${r.passed ? '✓ PASSED' : '✗ FAILED'}\n` +
          `Input: ${r.input}\n` +
          `Expected: ${r.expected}\n` +
          `Got: ${r.actual}\n`
        ).join('\n')
      }`);
      
    } catch (err) {
      console.error("Run error:", err);
      setOutput(`Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

const handleSubmit = async () => {
  if (session) {
    try {
      await handleRun();
    } catch (err) {
      console.error("Action failed:", err);
    }
  } else {
    navigate("/login");
  }
};

  const handleReset = () => {
    try {
      const starterCode = problem.starter_code 
        ? atob(problem.starter_code)
        : problem.starterCode || "# Write your code here\n";
      setCode(starterCode);
    } catch (e) {
      setCode(problem.starter_code || problem.starterCode || "# Write your code here\n");
    }
  };

  return (
    <div className={`flex h-screen ${bgMain} ${textPrimary}`}>
      <div className={`w-1/2 flex flex-col border-r ${borderColor}`}>
        <div className={`p-4 border-b ${borderColor}`}>
          <div className="flex items-center justify-between mb-3">
            <button 
              onClick={onBack}
              className={`px-3 py-1 rounded ${hoverBg} text-sm flex items-center gap-1`}
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button 
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded ${hoverBg}`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
          <h1 className="text-xl font-bold mb-2">{problem.title}</h1>
          <div className="flex items-center gap-3 text-sm">
            <Badge className={`${getDifficultyColor(problem.difficulty)} text-white`}>
              {problem.difficulty}
            </Badge>
            <span className={textSecondary}>{problem.category}</span>
          </div>
        </div>

        <div className={`flex border-b ${borderColor} px-4`}>
          <button
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "description" ? tabActive : `border-transparent ${tabInactive}`
            }`}
            onClick={() => setActiveTab("description")}
          >
            Description
          </button>
          <button
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "editorial" ? tabActive : `border-transparent ${tabInactive}`
            }`}
            onClick={() => setActiveTab("editorial")}
          >
            Editorial
          </button>
          <button
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "solutions" ? tabActive : `border-transparent ${tabInactive}`
            }`}
            onClick={() => setActiveTab("solutions")}
          >
            Solutions
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "description" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-3">Problem Description</h2>
                <p className={textSecondary}>{description}</p>
              </div>

              {example && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Example</h2>
                  <div className={`${bgSecondary} p-4 rounded-lg space-y-2`}>
                    <div><span className="font-medium">Input:</span> {example.input}</div>
                    <div><span className="font-medium">Output:</span> {example.output}</div>
                    {example.reasoning && (
                      <div><span className="font-medium">Explanation:</span> {example.reasoning}</div>
                    )}
                  </div>
                </div>
              )}

              {testCases.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Test Cases</h2>
                  <div className="space-y-3">
                    {testCases.map((tc, i) => (
                      <div key={i} className={`${bgSecondary} p-4 rounded-lg`}>
                        <div className="font-medium mb-1">Test Case {i + 1}</div>
                        <div className={`${textSecondary} text-sm space-y-1`}>
                          <div>Input: <code className={`${bgCode} px-2 py-0.5 rounded`}>{tc.test || tc.input}</code></div>
                          <div>Expected: <code className={`${bgCode} px-2 py-0.5 rounded`}>{tc.expected_output || tc.expectedOutput}</code></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "editorial" && (
            <div className="space-y-6">
              {learnSection ? (
                <div className={`prose ${isDark ? 'prose-invert' : ''} max-w-none`}>
                  <div dangerouslySetInnerHTML={{ __html: learnSection }} />
                </div>
              ) : (
                <div className={`p-6 text-center ${bgSecondary} rounded-lg`}>
                  <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                  <p className={textSecondary}>Editorial coming soon!</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "solutions" && (
            <div className="space-y-6">
              {solution ? (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Solution</h2>
                  <div className={`${bgCode} p-4 rounded-lg overflow-auto`}>
                    <pre className={`text-sm font-mono ${textPrimary}`}>
                      <code>{solution}</code>
                    </pre>
                  </div>
                </div>
              ) : (
                <div className={`p-6 text-center ${bgSecondary} rounded-lg`}>
                  <p className={textSecondary}>Solutions will be available after you solve the problem.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={`w-1/2 flex flex-col ${bgSecondary}`}>
        <div className={`flex items-center justify-between p-3 border-b ${borderColor}`}>
          <select className={`px-3 py-1.5 rounded ${bgMain} ${textPrimary} border ${borderColor} text-sm`}>
            <option>Python3</option>
          </select>
          <button 
            onClick={handleReset}
            className={`p-2 rounded ${hoverBg}`}
            title="Reset Code"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <CodeMirror
            value={code}
            height="100%"
            theme={isDark ? "dark" : "light"}
            extensions={[python(), EditorView.lineWrapping]}
            onChange={(value) => setCode(value)}
            className="h-full"
          />
        </div>

        <div className={`border-t ${borderColor} flex flex-col`} style={{ height: '40%' }}>
          <div className="p-3 border-b border-gray-700">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              Console
              {testResults.length > 0 && (
                <span className="text-xs">
                  ({testResults.filter(r => r.passed).length}/{testResults.length} passed)
                </span>
              )}
            </h3>
          </div>
          <div className={`flex-1 ${bgCode} p-4 overflow-auto`}>
            <pre className={`text-xs font-mono ${textSecondary} whitespace-pre-wrap`}>
       
     <div className="space-y-4">
  {testResults && testResults.length > 0 ? (
    testResults.map((r, index) => (
      <div
        key={index}
        className={`border rounded-md p-4 shadow-sm ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
        }`}
      >
        <div
          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
            r.passed ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          Test {r.testNum}: {r.passed ? "✓ PASSED" : "✗ FAILED"}
        </div>

        <div className="mt-4">
          <span className={`font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>
            Input:
          </span>
          <pre
            className={`mt-1 bg-gray-100 rounded p-2 text-sm ${
              isDark ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
            } whitespace-pre-wrap`}
          >
            {r.input}
          </pre>
        </div>

        <div className="mt-4">
          <span className={`font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>
            Expected:
          </span>
          <pre
            className={`mt-1 bg-gray-100 rounded p-2 text-sm ${
              isDark ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
            } whitespace-pre-wrap`}
          >
            {r.expected}
          </pre>
        </div>

        <div className="mt-4">
          <span className={`font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>
            Got:
          </span>
          <pre
            className={`mt-1 bg-gray-100 rounded p-2 text-sm ${
              isDark ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
            } whitespace-pre-wrap`}
          >
            {r.actual}
          </pre>
        </div>
      </div>
    ))
  ) : (
    <div
      className={`text-center p-4 rounded ${
        isDark ? "text-red-400" : "text-red-600"
      }`}
    >
      Click 'Run' to test your code...
    </div>
  )}
</div>


            </pre>
          </div>
        </div>

        <div className={`p-4 border-t ${borderColor} flex items-center justify-end gap-3`}>
          <button 
            onClick={handleRun}
            disabled={isRunning}
            className={`px-5 py-2 rounded ${hoverBg} text-sm font-medium flex items-center gap-2 border ${borderColor} disabled:opacity-50`}
          >
            <Clock size={16} /> {isRunning ? 'Running...' : 'Run'}
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isRunning}
            className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium flex items-center gap-2 disabled:opacity-50"
          >
            <Play size={16} /> Submit
          </button>
        </div>
      </div>
    </div>
  );
};

const App = ({ problems = [], problemData = null }) => {
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [allProblems, setAllProblems] = useState(problems);

const navigate = useNavigate();
  const [session, setSession] = useState(null);
    // 👇 Check session token
    useEffect(() => {
      const tokenData = sessionStorage.getItem("token");
      if (tokenData) {
        try {
          const parsed = JSON.parse(tokenData);
          setSession(parsed.user);
        } catch {
          setSession(null);
        }
      }
    }, []);

  useEffect(() => {
    if (problemData) {
      setSelectedProblem(problemData);
      return;
    }

    try {
      const storedProblem = sessionStorage.getItem('currentProblem');
      if (storedProblem) {
        const parsedProblem = JSON.parse(storedProblem);
        setSelectedProblem(parsedProblem);
        console.log("Problem loaded from sessionStorage:", parsedProblem);
      }
    } catch (error) {
      console.error("Error loading problem from sessionStorage:", error);
    }

    if (!problems || problems.length === 0) {
      try {
        const storedProblems = sessionStorage.getItem('problemsData');
        if (storedProblems) {
          const parsedProblems = JSON.parse(storedProblems);
          setAllProblems(Array.isArray(parsedProblems) ? parsedProblems : []);
        }
      } catch (error) {
        console.error("Error loading problems from sessionStorage:", error);
      }
    }
  }, [problemData, problems]);

  const handleBack = () => {
    setSelectedProblem(null);
    sessionStorage.removeItem('currentProblem');
    window.location.href = '/problems';
  };

  return selectedProblem ? (
    <Solve problem={selectedProblem} onBack={handleBack} />
  ) : (
    <ProblemList problems={allProblems} onSelectProblem={setSelectedProblem} />
  );
};

export default App;
