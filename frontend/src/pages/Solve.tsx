import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import questionApi, { type Question } from '../services/questionApi';
import {
  Play, RotateCcw, CheckCircle2, XCircle, Loader2, ChevronLeft,
  BookOpen, Code2, Lightbulb, Check, Maximize2, Minimize2,
  PanelLeftClose, PanelLeft, AlignLeft
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import Editor from '@monaco-editor/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useToast } from "@/components/ui/use-toast";

const SESSION_KEY_PREFIX = 'solve_code_';

const Solve: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { isDark } = useTheme();
    const [question, setQuestion] = useState<Question | null>(null);
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);
    const [results, setResults] = useState<any[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'description' | 'learn' | 'solution'>('description');
    const [copied, setCopied] = useState(false);
    const [showDescription, setShowDescription] = useState(true);
    const [fullscreen, setFullscreen] = useState(false);
    // On mobile we switch between 'description' view and 'editor' view
    const [mobileView, setMobileView] = useState<'description' | 'editor'>('description');
    
    // Auto-persist ID if coming from AI Interview flow
    useEffect(() => {
        if (slug) {
            localStorage.setItem('last_interview_slug', slug);
            sessionStorage.setItem('interview_slug', slug);
        }
    }, [slug]);

    // Load code from sessionStorage when slug changes
    useEffect(() => {
        if (!slug) return;
        const saved = sessionStorage.getItem(`${SESSION_KEY_PREFIX}${slug}`);
        if (saved) setCode(saved);
    }, [slug]);

    // Save code to sessionStorage on every change
    const handleCodeChange = useCallback((value: string | undefined) => {
        const val = value || '';
        setCode(val);
        if (slug) sessionStorage.setItem(`${SESSION_KEY_PREFIX}${slug}`, val);
    }, [slug]);

    useEffect(() => {
        const fetchQuestion = async () => {
            if (!slug) return;
            try {
                const res = await questionApi.fetchQuestionById(slug);
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
                    // Only set starter code if no saved code exists
                    const saved = sessionStorage.getItem(`${SESSION_KEY_PREFIX}${slug}`);
                    if (!saved) setCode(q.starter_code);
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

    useEffect(() => {
        const syncCodingSchema = async () => {
            if (!slug || !question) return;
            try {
                await questionApi.createCodingSchema();
                const res = await questionApi.getCodingSchema();
                if (res.success && res.data) {
                    const schema = Array.isArray(res.data) ? res.data[0] : res.data;
                    const visited = schema.recently_visited || [];
                    if (!visited.includes(slug)) {
                        const newVisited = [slug, ...visited].slice(0, 10);
                        await questionApi.updateCodingSchema({ recently_visited: newVisited });
                    }
                }
            } catch (err) {
                console.error("Failed to sync coding schema:", err);
            }
        };
        if (question) syncCodingSchema();
    }, [slug, question]);

    const handleRun = async () => {
        if (!question) return;
        setRunning(true);
        setResults(null);
        setError(null);
        // On mobile, switch to editor view to see results
        setMobileView('editor');
        try {
            const functionNameMatch = question.starter_code.match(/def\s+(\w+)\s*\(/);
            const functionName = functionNameMatch ? functionNameMatch[1] : 'solution';

            const res = await questionApi.submitCode(code, question.test_cases, functionName);

            let runResults = [];
            if (res && res.data && Array.isArray(res.data)) {
                runResults = res.data;
            } else if (res && Array.isArray(res)) {
                runResults = res;
            } else if (res && res.data && res.data.data && Array.isArray(res.data.data)) {
                runResults = res.data.data;
            } else {
                runResults = res ? (res.data || res) : [];
            }

            if (!Array.isArray(runResults)) runResults = [];
            setResults(runResults);

            const allPassed = runResults.length > 0 && runResults.every((r: any) => !!r.pass);

            if (allPassed) {
                toast({ title: "All Tests Passed!", description: "Syncing progress..." });
                try {
                    await questionApi.createCodingSchema();
                    const schemaRes = await questionApi.getCodingSchema();

                    if (schemaRes.success && schemaRes.data) {
                        const schema = Array.isArray(schemaRes.data) ? schemaRes.data[0] : schemaRes.data;
                        if (!schema) throw new Error("Schema record not returned");

                        const solved = schema.all_questions_solved || [];
                        const currentId = String(question.id);

                        if (!solved.includes(currentId)) {
                            const newSolved = [currentId, ...solved];
                            const recentSolved = [currentId, ...(schema.recently_solved || [])].slice(0, 10);
                            const updateData: any = { all_questions_solved: newSolved, recently_solved: recentSolved };
                            const diff = (question.difficulty || 'easy').toLowerCase();
                            if (diff === 'easy') updateData.easy = (schema.easy || 0) + 1;
                            else if (diff === 'medium') updateData.medium = (schema.medium || 0) + 1;
                            else if (diff === 'hard') updateData.hard = (schema.hard || 0) + 1;
                            await questionApi.updateCodingSchema(updateData);
                            toast({ title: "Success!", description: "Achievement unlocked!" });
                        } else {
                            toast({ title: "Correct!", description: "Already in your solved list." });
                        }
                    }
                } catch (schemaErr: any) {
                    console.error("Sync error:", schemaErr);
                    toast({ title: "Sync Failed", description: "Passed, but couldn't sync progress.", variant: "destructive" });
                }
            }
        } catch (err: any) {
            console.error("Solve page: Failed to run code:", err);
            const isNetworkError = err?.code === 'ERR_NETWORK' || err?.message?.includes('Network Error');
            setError(
                isNetworkError
                    ? "Network Error: Could not reach the code execution server. Please make sure the Python backend is running."
                    : "An error occurred while running your code."
            );
        } finally {
            setRunning(false);
        }
    };

    const decodeBase64 = (base64Str: string) => {
        if (!base64Str) return '';
        try { return decodeURIComponent(escape(atob(base64Str))); }
        catch (e) { try { return atob(base64Str); } catch { return base64Str; } }
    };

    const handleCopySolution = () => {
        if (question?.solution_code) {
            navigator.clipboard.writeText(question.solution_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleReset = () => {
        if (!question) return;
        setCode(question.starter_code);
        if (slug) sessionStorage.setItem(`${SESSION_KEY_PREFIX}${slug}`, question.starter_code);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground animate-pulse">Loading challenge...</p>
                </div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center glass-card p-12 rounded-3xl border-dashed border-2 border-border">
                    <p className="text-xl text-muted-foreground mb-6">Question not found.</p>
                    <button onClick={() => navigate('/practice')} className="btn-primary">Back to Practice</button>
                </div>
            </div>
        );
    }

    // Editor panel content (shared between desktop and mobile)
    const EditorPanel = (
        <div className={cn(
            "flex flex-col gap-3 transition-all duration-300",
            fullscreen ? "fixed inset-0 z-[100] bg-background" : "flex-1"
        )}>
            {/* Editor Card */}
            <div className={cn(
                "glass-card border border-border/50 flex flex-col overflow-hidden min-h-0",
                fullscreen ? "flex-1 rounded-none" : "flex-1 rounded-2xl"
            )}>
                <div className="px-4 py-2.5 border-b border-border/50 bg-secondary/5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <Code2 size={15} className="text-primary" />
                        <span className="text-xs font-bold uppercase tracking-wider">Python Editor</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest hidden sm:inline">Saved</span>
                        </div>
                        <button
                            onClick={() => setFullscreen(!fullscreen)}
                            className="p-1.5 rounded-lg hover:bg-secondary/10 text-muted-foreground hover:text-foreground transition-colors"
                            title={fullscreen ? "Exit Fullscreen" : "Fullscreen Editor"}
                        >
                            {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                        </button>
                        {fullscreen && (
                            <button
                                onClick={handleRun}
                                disabled={running}
                                className="btn-primary flex items-center gap-1.5 px-4 py-1 text-sm font-bold"
                            >
                                {running ? <Loader2 className="animate-spin" size={15} /> : <Play size={15} fill="currentColor" />}
                                Run
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex-1 min-h-0">
                    <Editor
                        height="100%"
                        defaultLanguage="python"
                        theme={isDark ? "vs-dark" : "light"}
                        value={code}
                        onChange={handleCodeChange}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 13,
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            padding: { top: 16, bottom: 16 },
                            fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
                            fontLigatures: true,
                            cursorSmoothCaretAnimation: 'on',
                            smoothScrolling: true,
                            wordWrap: 'on',
                        }}
                    />
                </div>
            </div>

            {/* Results Panel */}
            {!fullscreen && (
                <div className="h-[220px] sm:h-[30%] min-h-[150px] glass-card rounded-2xl border border-border/50 flex flex-col overflow-hidden shrink-0">
                    <div className="px-4 py-2.5 border-b border-border/50 bg-secondary/5 flex items-center justify-between sticky top-0 z-10 shrink-0">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Test Results</h3>
                        {results && (
                            <span className="text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                                {results.filter(r => r.pass).length} / {results.length} Passed
                            </span>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl text-destructive flex items-start gap-3 animate-in fade-in">
                                <XCircle size={20} className="shrink-0 mt-0.5" />
                                <div className="space-y-1 min-w-0">
                                    <p className="font-bold text-xs uppercase tracking-wider">Execution Error</p>
                                    <p className="text-xs opacity-90 font-mono break-words">{error}</p>
                                </div>
                            </div>
                        )}

                        {results && Array.isArray(results) && (
                            <div className="space-y-3">
                                {results.map((res, idx) => (
                                    <div key={idx} className={cn(
                                        "p-4 rounded-xl border",
                                        res.pass
                                            ? 'bg-green-500/5 border-green-500/20'
                                            : 'bg-destructive/5 border-destructive/20'
                                    )}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "w-6 h-6 rounded-lg flex items-center justify-center",
                                                    res.pass ? 'bg-green-500/20 text-green-500' : 'bg-destructive/20 text-destructive'
                                                )}>
                                                    {res.pass ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                                                </div>
                                                <span className={cn(
                                                    "font-black text-xs uppercase tracking-wider",
                                                    res.pass ? 'text-green-500' : 'text-destructive'
                                                )}>
                                                    Test Case {idx + 1}
                                                </span>
                                            </div>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase">{res.pass ? 'Success' : 'Failed'}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">Expected</span>
                                                <pre className="bg-background/40 p-2 rounded-lg border border-border/30 text-[11px] font-mono text-foreground overflow-x-auto">
                                                    {JSON.stringify(res.expected_res || res.expected_output)}
                                                </pre>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">Actual</span>
                                                <pre className={cn(
                                                    "p-2 rounded-lg border text-[11px] font-mono overflow-x-auto",
                                                    res.pass ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-destructive/10 border-destructive/20 text-destructive'
                                                )}>
                                                    {res.test_res !== undefined && res.test_res !== null
                                                        ? JSON.stringify(res.test_res)
                                                        : res.actual_output !== undefined && res.actual_output !== null
                                                        ? JSON.stringify(res.actual_output)
                                                        : res.stderr || res.error
                                                        ? `⚠ Runtime Error: ${res.stderr || res.error}`
                                                        : '⚠ null / no output returned'}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!results && !error && !running && (
                            <div className="h-full flex flex-col items-center justify-center text-center py-6 opacity-40">
                                <Play size={20} className="text-muted-foreground mb-2" />
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Run code to see results</p>
                            </div>
                        )}

                        {running && (
                            <div className="h-full flex flex-col items-center justify-center py-6 gap-3">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                                    <Loader2 className="animate-spin text-primary relative z-10" size={32} />
                                </div>
                                <p className="text-xs font-black uppercase tracking-[0.2em] text-primary animate-pulse">Executing...</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    // Description panel content (shared between desktop and mobile)
    const DescriptionPanel = (
        <div className="flex flex-col glass-card rounded-2xl border border-border/50 overflow-hidden h-full">
            <div className="flex border-b border-border/50 bg-secondary/5 shrink-0">
                <button
                    onClick={() => setActiveTab('description')}
                    className={cn(
                        "px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-1.5",
                        activeTab === 'description'
                            ? "text-primary border-b-2 border-primary bg-primary/5"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/5"
                    )}
                >
                    <BookOpen size={13} /> Description
                </button>
                {question.learn_content && (
                    <button
                        onClick={() => setActiveTab('learn')}
                        className={cn(
                            "px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-1.5",
                            activeTab === 'learn'
                                ? "text-primary border-b-2 border-primary bg-primary/5"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/5"
                        )}
                    >
                        <Lightbulb size={13} /> Learn
                    </button>
                )}
                {question.solution_code && (
                    <button
                        onClick={() => setActiveTab('solution')}
                        className={cn(
                            "px-4 py-2.5 text-xs font-bold transition-all flex items-center gap-1.5",
                            activeTab === 'solution'
                                ? "text-primary border-b-2 border-primary bg-primary/5"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/5"
                        )}
                    >
                        <CheckCircle2 size={13} /> Solution
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-8 custom-scrollbar">
                {activeTab === 'description' ? (
                    <div className={cn("prose max-w-none text-sm", isDark ? "prose-invert" : "prose-slate")}>
                        <h3 className="text-xl font-bold mb-4 gradient-text">Problem Description</h3>
                        <div className="text-muted-foreground leading-relaxed mb-8">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                                components={{
                                    code({ node, inline, className, children, ...props }: any) {
                                        const match = /language-(\w+)/.exec(className || '')
                                        return !inline && match ? (
                                            <SyntaxHighlighter style={atomDark} language={match[1]} PreTag="div" {...props}>
                                                {String(children).replace(/\n$/, '')}
                                            </SyntaxHighlighter>
                                        ) : (
                                            <code className={className} {...props}>{children}</code>
                                        )
                                    }
                                }}
                            >
                                {decodeBase64(question.problem_description)}
                            </ReactMarkdown>
                        </div>

                        <div className="bg-secondary/5 p-5 rounded-2xl border border-border/50 mb-6">
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Example Case</h4>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <span className="text-blue-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Input
                                    </span>
                                    <pre className="bg-background/50 p-3 rounded-xl border border-border/50 text-foreground font-mono text-xs overflow-x-auto">
                                        {question.example_input}
                                    </pre>
                                </div>
                                <div className="space-y-1.5">
                                    <span className="text-green-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div> Output
                                    </span>
                                    <pre className="bg-background/50 p-3 rounded-xl border border-border/50 text-foreground font-mono text-xs overflow-x-auto">
                                        {question.example_output}
                                    </pre>
                                </div>
                                {question.example_reasoning && (
                                    <div className="space-y-1.5">
                                        <span className="text-purple-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div> Explanation
                                        </span>
                                        <p className="text-muted-foreground text-xs italic leading-relaxed pl-3 border-l-2 border-purple-400/30">
                                            {question.example_reasoning}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'learn' ? (
                    <div className={cn("prose max-w-none text-sm", isDark ? "prose-invert" : "prose-slate")}>
                        <h3 className="text-xl font-bold mb-4 gradient-text">Learning Material</h3>
                        <div className="text-muted-foreground leading-relaxed">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                                components={{
                                    code({ node, inline, className, children, ...props }: any) {
                                        const match = /language-(\w+)/.exec(className || '')
                                        return !inline && match ? (
                                            <SyntaxHighlighter style={atomDark} language={match[1]} PreTag="div" {...props}>
                                                {String(children).replace(/\n$/, '')}
                                            </SyntaxHighlighter>
                                        ) : (
                                            <code className={className} {...props}>{children}</code>
                                        )
                                    }
                                }}
                            >
                                {decodeBase64(question.learn_content || '')}
                            </ReactMarkdown>
                        </div>
                    </div>
                ) : (
                    <div className={cn("prose max-w-none text-sm", isDark ? "prose-invert" : "prose-slate")}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold gradient-text">Reference Solution</h3>
                            <button
                                onClick={handleCopySolution}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/10 hover:bg-secondary/20 text-xs font-bold transition-all border border-border/50"
                            >
                                {copied ? <Check size={13} className="text-green-500" /> : <Code2 size={13} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <div className="rounded-xl overflow-hidden border border-border/50">
                            <SyntaxHighlighter
                                style={atomDark}
                                language="python"
                                customStyle={{ margin: 0, padding: '1.25rem', fontSize: '0.82rem' }}
                            >
                                {question.solution_code || ''}
                            </SyntaxHighlighter>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Sub-header — accounts for mobile top header (lg:pt-0 since AppLayout handles desktop) */}
            <div className="h-14 mt-16 lg:mt-0 border-b border-border/50 bg-background/40 backdrop-blur-xl flex items-center justify-between px-3 sm:px-6 shrink-0">
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <button
                        onClick={() => navigate('/practice')}
                        className="p-2 hover:bg-secondary/10 rounded-lg text-muted-foreground hover:text-primary transition-colors shrink-0"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <div className="h-4 w-px bg-border hidden sm:block"></div>
                    <h2 className="font-bold text-sm sm:text-base gradient-text truncate max-w-[120px] sm:max-w-[200px]">{question.title}</h2>
                    <span className={cn(
                        "text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest font-black border shrink-0",
                        question.difficulty === 'easy' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        question.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                        'bg-red-500/10 text-red-500 border-red-500/20'
                    )}>
                        {question.difficulty}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {/* Hide/Show panel (desktop only) */}
                    <button
                        onClick={() => setShowDescription(!showDescription)}
                        className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-secondary/10 rounded-xl text-muted-foreground hover:text-foreground transition-all border border-border/50"
                        title={showDescription ? "Hide Question" : "Show Question"}
                    >
                        {showDescription ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
                        <span className="text-xs font-medium hidden lg:inline">{showDescription ? "Hide" : "Show"}</span>
                    </button>

                    {/* Mobile view toggle */}
                    <button
                        onClick={() => setMobileView(mobileView === 'description' ? 'editor' : 'description')}
                        className="flex md:hidden items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-muted-foreground hover:text-foreground transition-all border border-border/50 hover:bg-secondary/10"
                        title={mobileView === 'description' ? "Open Editor" : "Open Description"}
                    >
                        {mobileView === 'description' ? <Code2 size={15} /> : <AlignLeft size={15} />}
                        <span className="text-xs font-medium">{mobileView === 'description' ? 'Editor' : 'Problem'}</span>
                    </button>

                    <div className="h-4 w-px bg-border"></div>
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-1 px-2 sm:px-3 py-1.5 hover:bg-secondary/10 rounded-xl text-muted-foreground hover:text-foreground transition-all border border-transparent hover:border-border"
                        title="Reset Code"
                    >
                        <RotateCcw size={14} />
                        <span className="text-xs font-medium hidden sm:inline">Reset</span>
                    </button>
                    <button
                        onClick={handleRun}
                        disabled={running}
                        className="btn-primary flex items-center gap-1.5 px-3 sm:px-5 py-1.5 shadow-lg shadow-primary/20"
                    >
                        {running ? <Loader2 className="animate-spin" size={15} /> : <Play size={15} fill="currentColor" />}
                        <span className="font-bold text-sm">Run</span>
                    </button>
                </div>
            </div>

            {/* Main content */}
            <main className="flex-1 overflow-hidden p-2 sm:p-4 pt-3 sm:pt-5 gap-3 sm:gap-4">

                {/* Desktop layout */}
                <div className="hidden md:flex h-full gap-4">
                    {showDescription && (
                        <div className="w-1/2 animate-in slide-in-from-left duration-300">
                            {DescriptionPanel}
                        </div>
                    )}
                    <div className={cn(
                        "flex flex-col gap-3 transition-all duration-300",
                        showDescription ? "w-1/2" : "w-full"
                    )}>
                        {EditorPanel}
                    </div>
                </div>

                {/* Mobile layout */}
                <div className="flex md:hidden h-full">
                    {mobileView === 'description' ? (
                        <div className="w-full animate-in fade-in duration-200">
                            {DescriptionPanel}
                        </div>
                    ) : (
                        <div className="w-full flex flex-col gap-2 animate-in fade-in duration-200">
                            {EditorPanel}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Solve;
