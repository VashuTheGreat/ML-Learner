import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import questionApi, {type Question } from '../Services/questionApi';
import { Play, RotateCcw, CheckCircle2, XCircle, Loader2, ChevronLeft, BookOpen, Code2, Lightbulb, Check } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import Editor from '@monaco-editor/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const Solve: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [question, setQuestion] = useState<Question | null>(null);
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);
    const [results, setResults] = useState<any[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'description' | 'learn' | 'solution'>('description');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchQuestion = async () => {
            if (!slug) return;
            try {
                console.log(`Solve page: Fetching question with slug: ${slug}`);
                const res = await questionApi.fetchQuestionById(slug);
                console.log("Solve page: Received response:", res);
                
                let q: Question | null = null;
                if (res.success && Array.isArray(res.data) && res.data.length > 0) {
                    q = res.data[0];
                } else if (res.success && res.data && !Array.isArray(res.data)) {
                    q = res.data;
                } else if (!res.success && res.id) {
                    q = res;
                }

                if (q) {
                    setQuestion(q);
                    setCode(q.starter_code);
                }
            } catch (err) {
                console.error("Solve page: Failed to fetch question:", err);
                setError("Failed to load question.");
            } finally {
                setLoading(false);
            }
        };

        fetchQuestion();
    }, [slug]);

    const handleRun = async () => {
        if (!question) return;
        setRunning(true);
        setResults(null);
        setError(null);
        try {
            const functionNameMatch = question.starter_code.match(/def\s+(\w+)\s*\(/);
            const functionName = functionNameMatch ? functionNameMatch[1] : 'solution';

            const res = await questionApi.submitCode(code, question.test_cases, functionName);
            if (res.data && res.data.error) {
                setError(res.data.error);
            } else {
                setResults(res.data || res);
            }
        } catch (err) {
            console.error("Solve page: Failed to run code:", err);
            setError("An error occurred while running your code.");
        } finally {
            setRunning(false);
        }
    };

    const decodeBase64 = (base64Str: string) => {
        if (!base64Str) return '';
        try {
            return decodeURIComponent(escape(atob(base64Str)));
        } catch (e) {
            try {
                return atob(base64Str);
            } catch (e2) {
                return base64Str;
            }
        }
    };

    const handleCopySolution = () => {
        if (question?.solution_code) {
            navigator.clipboard.writeText(question.solution_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground animate-pulse">Loading challenge...</p>
                </div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center glass-card p-12 rounded-3xl border-dashed border-2 border-border">
                    <p className="text-xl text-muted-foreground mb-6">Question not found.</p>
                    <button onClick={() => navigate('/practice')} className="btn-primary">
                        Back to Practice
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            
            {/* Sub-header / Breadcrumbs */}
            <div className="pt-20 h-14 border-b border-border/50 bg-background/50 backdrop-blur-xl flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/practice')}
                        className="p-2 hover:bg-secondary/10 rounded-lg text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="h-4 w-px bg-border mx-2"></div>
                    <h2 className="font-bold text-lg gradient-text">{question.title}</h2>
                    <span className={cn(
                        "text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-widest font-black border",
                        question.difficulty === 'easy' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        question.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                        'bg-red-500/10 text-red-500 border-red-500/20'
                    )}>
                        {question.difficulty}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setCode(question.starter_code)}
                        className="flex items-center gap-2 px-4 py-1.5 hover:bg-secondary/10 rounded-xl text-muted-foreground hover:text-foreground transition-all border border-transparent hover:border-border"
                        title="Reset Code"
                    >
                        <RotateCcw size={16} />
                        <span className="text-sm font-medium">Reset</span>
                    </button>
                    <button 
                        onClick={handleRun}
                        disabled={running}
                        className="btn-primary flex items-center gap-2 px-6 py-1.5 shadow-lg shadow-primary/20"
                    >
                        {running ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} fill="currentColor" />}
                        <span className="font-bold">Run Code</span>
                    </button>
                </div>
            </div>

            <main className="flex-1 flex overflow-hidden p-4 gap-4">
                {/* Left Panel: Description & Learn & Solution */}
                <div className="w-1/2 flex flex-col glass-card rounded-2xl border border-border/50 overflow-hidden">
                    <div className="flex border-b border-border/50 bg-secondary/5">
                        <button 
                            onClick={() => setActiveTab('description')}
                            className={cn(
                                "px-6 py-3 text-sm font-bold transition-all flex items-center gap-2",
                                activeTab === 'description' 
                                    ? "text-primary border-b-2 border-primary bg-primary/5" 
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/5"
                            )}
                        >
                            <BookOpen size={16} />
                            Description
                        </button>
                        {question.learn_content && (
                            <button 
                                onClick={() => setActiveTab('learn')}
                                className={cn(
                                    "px-6 py-3 text-sm font-bold transition-all flex items-center gap-2",
                                    activeTab === 'learn' 
                                        ? "text-primary border-b-2 border-primary bg-primary/5" 
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/5"
                                )}
                            >
                                <Lightbulb size={16} />
                                Learn
                            </button>
                        )}
                        {question.solution_code && (
                            <button 
                                onClick={() => setActiveTab('solution')}
                                className={cn(
                                    "px-6 py-3 text-sm font-bold transition-all flex items-center gap-2",
                                    activeTab === 'solution' 
                                        ? "text-primary border-b-2 border-primary bg-primary/5" 
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/5"
                                )}
                            >
                                <CheckCircle2 size={16} />
                                Solution
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                        {activeTab === 'description' ? (
                            <div className="prose prose-invert max-w-none">
                                <h3 className="text-2xl font-bold mb-6 gradient-text">Problem Description</h3>
                                <div className="text-muted-foreground leading-relaxed mb-10 text-lg">
                                    <ReactMarkdown 
                                        remarkPlugins={[remarkGfm, remarkMath]} 
                                        rehypePlugins={[rehypeKatex]}
                                        components={{
                                            code({node, inline, className, children, ...props}: any) {
                                                const match = /language-(\w+)/.exec(className || '')
                                                return !inline && match ? (
                                                    <SyntaxHighlighter
                                                        style={atomDark}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        {...props}
                                                    >
                                                        {String(children).replace(/\n$/, '')}
                                                    </SyntaxHighlighter>
                                                ) : (
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                )
                                            }
                                        }}
                                    >
                                        {decodeBase64(question.problem_description)}
                                    </ReactMarkdown>
                                </div>

                                <div className="bg-secondary/5 p-8 rounded-3xl border border-border/50 mb-8 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                    <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-6">Example Case</h4>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <span className="text-blue-400 text-xs font-black uppercase tracking-wider flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                                Input
                                            </span>
                                            <pre className="bg-background/50 p-4 rounded-xl border border-border/50 text-foreground font-mono text-sm">
                                                {question.example_input}
                                            </pre>
                                        </div>
                                        <div className="space-y-2">
                                            <span className="text-green-400 text-xs font-black uppercase tracking-wider flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                                Output
                                            </span>
                                            <pre className="bg-background/50 p-4 rounded-xl border border-border/50 text-foreground font-mono text-sm">
                                                {question.example_output}
                                            </pre>
                                        </div>
                                        {question.example_reasoning && (
                                            <div className="space-y-2">
                                                <span className="text-purple-400 text-xs font-black uppercase tracking-wider flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                                                    Explanation
                                                </span>
                                                <p className="text-muted-foreground text-sm italic leading-relaxed pl-4 border-l-2 border-purple-400/30">
                                                    {question.example_reasoning}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : activeTab === 'learn' ? (
                            <div className="prose prose-invert max-w-none">
                                <h3 className="text-2xl font-bold mb-6 gradient-text">Learning Material</h3>
                                <div className="text-muted-foreground leading-relaxed text-lg">
                                    <ReactMarkdown 
                                        remarkPlugins={[remarkGfm, remarkMath]} 
                                        rehypePlugins={[rehypeKatex]}
                                        components={{
                                            code({node, inline, className, children, ...props}: any) {
                                                const match = /language-(\w+)/.exec(className || '')
                                                return !inline && match ? (
                                                    <SyntaxHighlighter
                                                        style={atomDark}
                                                        language={match[1]}
                                                        PreTag="div"
                                                        {...props}
                                                    >
                                                        {String(children).replace(/\n$/, '')}
                                                    </SyntaxHighlighter>
                                                ) : (
                                                    <code className={className} {...props}>
                                                        {children}
                                                    </code>
                                                )
                                            }
                                        }}
                                    >
                                        {decodeBase64(question.learn_content || '')}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ) : (
                            <div className="prose prose-invert max-w-none">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-bold gradient-text">Reference Solution</h3>
                                    <button 
                                        onClick={handleCopySolution}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-xs font-bold transition-all border border-border/50"
                                    >
                                        {copied ? <Check size={14} className="text-green-500" /> : <Code2 size={14} />}
                                        {copied ? 'Copied!' : 'Copy Code'}
                                    </button>
                                </div>
                                <div className="rounded-2xl overflow-hidden border border-border/50">
                                    <SyntaxHighlighter
                                        style={atomDark}
                                        language="python"
                                        customStyle={{ margin: 0, padding: '2rem', fontSize: '0.9rem' }}
                                    >
                                        {question.solution_code || ''}
                                    </SyntaxHighlighter>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: Editor & Results */}
                <div className="w-1/2 flex flex-col gap-4">
                    {/* Editor Container */}
                    <div className="flex-1 glass-card rounded-2xl border border-border/50 flex flex-col overflow-hidden">
                        <div className="px-6 py-3 border-b border-border/50 bg-secondary/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Code2 size={16} className="text-primary" />
                                <span className="text-sm font-bold uppercase tracking-wider">Python Editor</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Auto-save active</span>
                            </div>
                        </div>
                        <div className="flex-1">
                            <Editor
                                height="100%"
                                defaultLanguage="python"
                                theme="vs-dark"
                                value={code}
                                onChange={(value) => setCode(value || '')}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    padding: { top: 20, bottom: 20 },
                                    fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                                    fontLigatures: true,
                                    cursorSmoothCaretAnimation: 'on',
                                    smoothScrolling: true,
                                }}
                            />
                        </div>
                    </div>

                    {/* Results Panel */}
                    <div className="h-[35%] glass-card rounded-2xl border border-border/50 flex flex-col overflow-hidden">
                        <div className="px-6 py-3 border-b border-border/50 bg-secondary/5 flex items-center justify-between sticky top-0 z-10">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Test Results</h3>
                            {results && (
                                <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                                    {results.filter(r => r.pass).length} / {results.length} Passed
                                </span>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            {error && (
                                <div className="bg-destructive/10 border border-destructive/20 p-5 rounded-2xl text-destructive flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
                                    <XCircle size={24} className="shrink-0" />
                                    <div className="space-y-1">
                                        <p className="font-bold text-sm uppercase tracking-wider">Execution Error</p>
                                        <p className="text-sm opacity-90 font-mono">{error}</p>
                                    </div>
                                </div>
                            )}

                            {results && Array.isArray(results) && (
                                <div className="space-y-4">
                                    {results.map((res, idx) => (
                                        <div key={idx} className={cn(
                                            "p-5 rounded-2xl border transition-all duration-300",
                                            res.pass 
                                                ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40' 
                                                : 'bg-destructive/5 border-destructive/20 hover:border-destructive/40'
                                        )}>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-8 h-8 rounded-xl flex items-center justify-center",
                                                        res.pass ? 'bg-green-500/20 text-green-500' : 'bg-destructive/20 text-destructive'
                                                    )}>
                                                        {res.pass ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                                                    </div>
                                                    <span className={cn(
                                                        "font-black text-xs uppercase tracking-[0.15em]",
                                                        res.pass ? 'text-green-500' : 'text-destructive'
                                                    )}>
                                                        Test Case {idx + 1}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                    {res.pass ? 'Success' : 'Failed'}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-1.5">
                                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Expected</span>
                                                    <pre className="bg-background/40 p-3 rounded-xl border border-border/30 text-xs font-mono text-foreground overflow-x-auto">
                                                        {JSON.stringify(res.expected_res || res.expected_output)}
                                                    </pre>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">Actual</span>
                                                    <pre className={cn(
                                                        "p-3 rounded-xl border text-xs font-mono overflow-x-auto",
                                                        res.pass ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-destructive/10 border-destructive/20 text-destructive'
                                                    )}>
                                                        {JSON.stringify(res.test_res || res.actual_output)}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!results && !error && !running && (
                                <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-50">
                                    <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                                        <Play size={24} className="text-muted-foreground" />
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Run your code to see results here</p>
                                </div>
                            )}

                            {running && (
                                <div className="h-full flex flex-col items-center justify-center py-10 gap-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                                        <Loader2 className="animate-spin text-primary relative z-10" size={40} />
                                    </div>
                                    <div className="space-y-1 text-center">
                                        <p className="text-sm font-black uppercase tracking-[0.2em] text-primary animate-pulse">Executing</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Verifying test cases...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Solve;
