import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Play, Settings, Clock, BarChart2, BookOpen } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { EditorView } from "@codemirror/view";

const Solve = ({ problemData }: { problemData?: any }) => {
  const [problem, setProblem] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"description" | "editorial" | "solutions">("description");
  const [code, setCode] = useState(`# Write your solution here\nimport numpy as np\n\ndef batch_iterator(X, y=None, batch_size=64):\n    pass\n`);
  const [isDark, setIsDark] = useState(true);
  const [output, setOutput] = useState("Ready to run...");

  useEffect(() => {
    if (problemData) {
      setProblem(problemData);
      return;
    }
    try {
      const storedProblem = sessionStorage.getItem("currentProblem");
      if (storedProblem) {
        const parsedProblem = JSON.parse(storedProblem);
        setProblem(parsedProblem);
      }
    } catch (error) {
      console.error("Error loading problem:", error);
    }
  }, [problemData]);

  if (!problem)
    return (
      <div className={`flex items-center justify-center h-screen ${isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}>
        <div className="text-center">
          <div className="text-lg mb-2">No problem data found</div>
          <a href="/problems" className="text-blue-500 hover:text-blue-400 text-sm">
            ← Go back to problems
          </a>
        </div>
      </div>
    );

  const problemSections = problem.data?.sections?.filter((sec: any) =>
    sec.title.toLowerCase().includes("problem") || sec.title.toLowerCase().includes("example") || sec.title.toLowerCase().includes("learn")
  ) || [];

  const solutionSections = problem.data?.sections?.filter((sec: any) =>
    sec.title.toLowerCase().includes("solution") || sec.title.toLowerCase().includes("implementation") || sec.title.toLowerCase().includes("code explanation")
  ) || [];

  const bgMain = isDark ? "bg-gray-900" : "bg-white";
  const bgSecondary = isDark ? "bg-gray-800" : "bg-gray-50";
  const bgCode = isDark ? "bg-gray-950" : "bg-gray-100";
  const textPrimary = isDark ? "text-gray-100" : "text-gray-900";
  const textSecondary = isDark ? "text-gray-400" : "text-gray-600";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";
  const hoverBg = isDark ? "hover:bg-gray-700" : "hover:bg-gray-100";
  const tabActive = isDark ? "border-white text-white" : "border-blue-600 text-blue-600";
  const tabInactive = isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900";

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty?.toLowerCase().includes("easy")) return "bg-green-500";
    if (difficulty?.toLowerCase().includes("medium")) return "bg-yellow-500";
    if (difficulty?.toLowerCase().includes("hard")) return "bg-red-500";
    return "bg-gray-500";
  };

  const handleRun = async () => {
    try {
      const encodedCode = btoa(code); // Base64 encode
      const res = await fetch("http://localhost:3000/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: encodedCode }),
      });
      const data = await res.json();
      setOutput(data.output || data.error || "No output");
    } catch (err) {
      setOutput("Error running code");
    }
  };

  return (
    <div className={`flex h-screen ${bgMain} ${textPrimary}`}>
      {/* LEFT PANEL */}
      <div className={`w-1/2 flex flex-col border-r ${borderColor}`}>
        <div className={`p-4 border-b ${borderColor}`}>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-lg font-semibold">{problem.data?.title || problem.folder || "Problem"}</h1>
            <button onClick={() => setIsDark(!isDark)} className={`p-2 rounded ${hoverBg}`}>
              {isDark ? "☀️" : "🌙"}
            </button>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Badge className={`${getDifficultyColor(problem.difficulty)} text-white`}>{problem.difficulty || "Unknown"}</Badge>
            <span className={textSecondary}>Acceptance: {problem.data?.acceptanceRate ? `${problem.data.acceptanceRate}%` : "N/A"}</span>
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
            <div className="flex items-center gap-1">
              <BookOpen size={16} /> Editorial
            </div>
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
              {problemSections.length > 0
                ? problemSections.map((section: any, idx: number) => (
                    <div key={idx}>
                      {section.title !== "Problem Statement" && <h2 className="text-lg font-semibold mb-3">{section.title}</h2>}
                      <div className={`prose ${isDark ? "prose-invert" : ""} max-w-none`} dangerouslySetInnerHTML={{ __html: section.content }} />
                    </div>
                  ))
                : <div className={textSecondary}><p>{problem.data?.description || "No description available."}</p></div>}
            </div>
          )}

          {activeTab === "editorial" && <div className="space-y-6">Editorial content...</div>}
          {activeTab === "solutions" && <div className="space-y-6">Solution content...</div>}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className={`w-1/2 flex flex-col ${bgSecondary}`}>
        {/* Editor Header */}
        <div className={`flex items-center justify-between p-3 border-b ${borderColor}`}>
          <select className={`px-3 py-1.5 rounded ${bgMain} ${textPrimary} border ${borderColor} text-sm font-medium`}>
            <option>Python3</option>
            <option>JavaScript</option>
            <option>Java</option>
            <option>C++</option>
          </select>
          <div className="flex items-center gap-2">
            <button className={`p-2 rounded ${hoverBg}`} title="Settings"><Settings size={18} /></button>
            <button className={`p-2 rounded ${hoverBg}`} title="Full Screen"><BarChart2 size={18} /></button>
          </div>
        </div>

        {/* Code Editor */}
        <div className="flex-1 p-4 overflow-hidden">
          <CodeMirror
            value={code}
            height="100%"
            theme={isDark ? "dark" : "light"}
            extensions={[python(), EditorView.lineWrapping]}
            onChange={(value) => setCode(value)}
          />
        </div>

        {/* Console */}
        <div className={`border-t ${borderColor} p-4`}>
          <h3 className="text-sm font-semibold">Console</h3>
          <div className={`${bgCode} p-3 rounded text-xs font-mono h-24 overflow-auto ${textSecondary}`}>
            {output}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${borderColor} flex items-center justify-between`}>
          <button className={`px-4 py-2 rounded ${hoverBg} text-sm font-medium`} onClick={() => setCode("")}>
            Reset
          </button>
          <div className="flex gap-3">
            <button className={`px-5 py-2 rounded ${hoverBg} text-sm font-medium flex items-center gap-2 border ${borderColor}`} onClick={handleRun}>
              <Clock size={16} /> Run
            </button>
            <button className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium flex items-center gap-2">
              <Play size={16} /> Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Solve;
