import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import questionApi from '../services/questionApi';
import { BookOpen, Code, ChevronRight, Filter, Star, Search, CheckCircle2 } from 'lucide-react';

import Footer from '@/components/layout/Footer';
import { cn } from '@/lib/utils';
import { type Question, type CodingSchema } from '@/types';

const Practice: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [categories, setCategories] = useState<string[]>(["All"]);
    const [activeCategory, setActiveCategory] = useState("All");
    const [activeDifficulty, setActiveDifficulty] = useState("All");
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [solvedIds, setSolvedIds] = useState<string[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSolvedStatus = async () => {
            try {
                const res = await questionApi.getCodingSchema();
                if (res.success && res.data) {
                    const schema = Array.isArray(res.data) ? res.data[0] : res.data;
                    setSolvedIds(schema.all_questions_solved || []);
                }
            } catch (error) {
                console.warn("Coding schema not found");
            }
        };
        fetchSolvedStatus();
    }, []);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await questionApi.fetchAvailableQuestionsCategories();
                if (res && Array.isArray(res.data)) {
                    setCategories(["All", ...res.data]);
                } else if (Array.isArray(res)) {
                    setCategories(["All", ...res]);
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            try {
                let res;
                if (activeCategory === "All" && activeDifficulty === "All") {
                    res = await questionApi.fetchAllQuestions();
                } else if (activeCategory !== "All") {
                    res = await questionApi.fetchQuestionsByCategory(activeCategory);
                } else {
                    res = await questionApi.fetchQuestionsByDifficulty(activeDifficulty.toLowerCase());
                }

                let data = [];
                if (res.success) {
                    data = res.data;
                } else if (Array.isArray(res)) {
                    data = res;
                }

                // Client-side filtering for difficulty if category was selected
                if (activeCategory !== "All" && activeDifficulty !== "All") {
                    data = data.filter((q: Question) => q.difficulty.toLowerCase() === activeDifficulty.toLowerCase());
                }

                setQuestions(data);
            } catch (error) {
                console.error("Failed to fetch questions:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, [activeCategory, activeDifficulty]);

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    const filteredQuestions = questions.filter(q => 
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen">

            
            {/* Header Section */}
            <section className="pt-32 pb-16 mesh-gradient">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                            <Code className="w-4 h-4" />
                            Interactive Coding Practice
                        </div>
                        <h1 className="text-5xl font-extrabold mb-6">
                            Master Your <span className="gradient-text">Coding Skills</span>
                        </h1>
                        <p className="text-lg text-muted-foreground mb-8">
                            Solve curated technical interview questions and improve your problem-solving abilities.
                        </p>

                        {/* Search Bar */}
                        <div className="relative max-w-xl mx-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <input 
                                type="text"
                                placeholder="Search questions by title or category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input-field pl-12 pr-4 bg-background/50 backdrop-blur-md border-border/50 focus:border-primary/50"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <main className="container mx-auto px-4 py-12">
                {/* Filters Section */}
                <div className="space-y-8 mb-12">
                    {/* Category Filter */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-muted-foreground px-1">
                            <Filter className="w-4 h-4" />
                            <span className="text-sm font-medium">Categories:</span>
                        </div>
                        <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-xl text-sm font-medium transition-all border whitespace-nowrap shrink-0",
                                        activeCategory === category 
                                            ? "gradient-bg text-white border-transparent shadow-lg shadow-primary/20" 
                                            : "bg-secondary/5 text-muted-foreground border-border/50 hover:border-primary/30 hover:text-primary"
                                    )}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty Filter */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-muted-foreground px-1">
                            <Star className="w-4 h-4" />
                            <span className="text-sm font-medium">Difficulty:</span>
                        </div>
                        <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
                            {["All", "Easy", "Medium", "Hard"].map((difficulty) => (
                                <button
                                    key={difficulty}
                                    onClick={() => setActiveDifficulty(difficulty)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-xl text-sm font-medium transition-all border whitespace-nowrap shrink-0",
                                        activeDifficulty === difficulty 
                                            ? "bg-primary text-white border-transparent shadow-lg shadow-primary/20" 
                                            : "bg-secondary/5 text-muted-foreground border-border/50 hover:border-primary/30 hover:text-primary"
                                    )}
                                >
                                    {difficulty}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Questions Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        <p className="text-muted-foreground animate-pulse">Loading challenges...</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredQuestions.map((q) => (
                            <div 
                                key={q.id}
                                onClick={() => navigate(`/solve/${q.id}`)}
                                className="group glass-card p-4 sm:p-6 rounded-2xl border border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 card-hover overflow-hidden"
                            >
                                <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl gradient-bg flex items-center justify-center text-white shadow-lg shadow-primary/10 group-hover:scale-110 transition-transform duration-500 shrink-0">
                                        <Code size={24} className="sm:w-7 sm:h-7" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 group-hover:text-primary transition-colors truncate">
                                            {q.title}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                            <span className={cn(
                                                "px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider border whitespace-nowrap",
                                                getDifficultyColor(q.difficulty)
                                            )}>
                                                {q.difficulty}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-[10px] sm:text-sm text-muted-foreground bg-secondary/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg border border-border/50 whitespace-nowrap">
                                                <BookOpen size={12} className="text-primary/60" />
                                                {q.category}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between md:justify-end gap-3 sm:gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-border/30">
                                    <div className="flex flex-col items-start md:items-end md:mr-4">
                                        <span className="text-[9px] sm:text-xs text-muted-foreground uppercase tracking-widest font-bold mb-0.5 sm:mb-1">Status</span>
                                        {solvedIds.includes(String(q.id)) ? (
                                            <span className="text-[10px] sm:text-sm font-bold text-green-500 flex items-center gap-1.5 bg-green-500/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg border border-green-500/20 whitespace-nowrap">
                                                <CheckCircle2 size={12} className="sm:w-3.5 sm:h-3.5" />
                                                Solved
                                            </span>
                                        ) : (
                                            <span className="text-[10px] sm:text-sm font-medium text-primary flex items-center gap-1.5 bg-primary/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg border border-primary/20 whitespace-nowrap">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                                Available
                                            </span>
                                        )}
                                    </div>
                                    <button className={cn(
                                        "px-5 sm:px-8 py-2 sm:py-2.5 rounded-xl flex items-center gap-2 group/btn font-bold text-sm sm:text-base transition-all duration-300 whitespace-nowrap",
                                        solvedIds.includes(String(q.id))
                                            ? "bg-secondary/10 text-muted-foreground hover:bg-secondary/20 border border-border/50"
                                            : "btn-primary shadow-lg shadow-primary/20"
                                    )}>
                                        {solvedIds.includes(String(q.id)) ? 'Review' : 'Solve'}
                                        <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px] group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {filteredQuestions.length === 0 && (
                            <div className="text-center py-24 glass-card rounded-3xl border-dashed border-2 border-border/50">
                                <div className="w-20 h-20 mx-auto rounded-full bg-secondary/10 flex items-center justify-center mb-6">
                                    <Search className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">No questions found</h3>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                    We couldn't find any questions matching your current filters. Try adjusting your search or filter criteria.
                                </p>
                                <button 
                                    onClick={() => {
                                        setActiveCategory("All");
                                        setActiveDifficulty("All");
                                        setSearchQuery("");
                                    }}
                                    className="mt-8 text-primary font-bold hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Practice;
