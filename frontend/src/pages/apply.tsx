import React, { useEffect, useState } from 'react'
import pythonApi from '@/Services/pythonApi';
import Navbar from '@/components/layout/Navbar';
import { Briefcase, Calendar, MapPin, Loader2, Tag, Clock, Building2, ShieldCheck, ChevronDown } from 'lucide-react';
import interviewApi from '@/Services/interviewApi';
const COMPANY_LOGOS: { [key: string]: string } = {
    "Google": "https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png",
    "Amazon": "https://upload.wikimedia.org/wikipedia/commons/4/4a/Amazon_icon.svg",
    "Microsoft": "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    "Apple": "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    "Meta": "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
    "Netflix": "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
};

export const Apply = () => {
    const [interviews, setInterviews] = useState<any[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [userAplied,setUserAplied]=useState<any>(null);
    const [isUpdated, setIsUpdated] = useState(false);

    const fetchRunningApplyingInterviews = async (updated: boolean = false) => {
        setLoading(true);
        try {
            const response = await pythonApi.generateInterviewSchemas(3, undefined, undefined, updated);
            setInterviews(response.interviews || []);
            console.log("Fetched interviews:", response);
        } catch (error) {
            console.error("Error fetching interviews:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserAppliedInterviews = async () => {
        setLoading(true);
        try {
            const response = await interviewApi.getUserAppliedInterviews();
            setUserAplied(response || []);
            console.log("Fetched user applied interviews:", response);
        } catch (error) {
            console.error("Error fetching user applied interviews:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRunningApplyingInterviews(isUpdated);
        fetchUserAppliedInterviews();
    }, [isUpdated]);

    const handleUpdateChange = (value: boolean) => {
        if (value === true) {
            const password = prompt("Please enter admin password to enable updated interviews:");
            if (password === "admin") {
                setIsUpdated(true);
            } else {
                alert("Incorrect password!");
            }
        } else {
            setIsUpdated(false);
        }
    };

    const handleApply = async (job: any) => {
        // Temporary function - logic will be added later
        try {
            const response = await interviewApi.scheduleInterview(job);
            console.log(response)
            alert(`Applied for ${job.job_Role} at ${job.companyName}...`);
            window.location.reload();
        } catch (e: any) {
            console.log("Error while registering", e);
            alert(`Error while applying. Try again later.`)
        }
    };
  

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 pt-24 pb-12">
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Available <span className="gradient-text">Opportunities</span></h1>
                        <p className="text-muted-foreground text-lg">Apply for roles that match your AI-generated profile.</p>
                    </div>

                    <div className="flex items-center gap-3 bg-secondary/10 p-1 rounded-xl border border-border/50">
                        <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground mr-2">
                           <ShieldCheck className="w-4 h-4 text-primary" />
                           Admin Mode
                        </div>
                        <div className="flex bg-background rounded-lg shadow-sm">
                            <button 
                                onClick={() => handleUpdateChange(false)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${!isUpdated ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-secondary/20'}`}
                            >
                                Default
                            </button>
                            <button 
                                onClick={() => handleUpdateChange(true)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isUpdated ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-secondary/20'}`}
                            >
                                Updated
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                        <p className="text-muted-foreground animate-pulse">Finding the best matches for you...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {interviews && interviews.length > 0 ? (
                            interviews.map((job, index) => (
                                <div key={index} className="glass-card p-6 rounded-2xl card-hover group border border-border/50">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-white border border-border flex items-center justify-center p-2 shadow-sm group-hover:border-primary/50 transition-colors overflow-hidden">
                                            {COMPANY_LOGOS[job.companyName] ? (
                                                <img 
                                                    src={COMPANY_LOGOS[job.companyName]} 
                                                    alt={job.companyName} 
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                <Building2 className="w-6 h-6 text-primary" />
                                            )}
                                        </div>
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                            job.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' : 'bg-green-500/10 text-green-500'
                                        }`}>
                                            {job.status || 'New'}
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors">
                                        {job.job_Role || "AI Engineer"}
                                    </h3>
                                    <p className="text-muted-foreground font-medium mb-4">{job.companyName || "Tech Corp"}</p>
                                    
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Tag className="w-4 h-4 text-primary/60" />
                                            <span className="font-medium">Topic: {job.topic || "General"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="w-4 h-4 text-primary/60" />
                                            <span>{job.time ? formatDate(job.time) : "Recent"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="w-4 h-4 text-primary/60" />
                                            <span>Remote / On-site</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => handleApply(job)}
                                        disabled={userAplied?.some((applied: any) => applied.companyName === job.companyName && applied.job_Role === job.job_Role)}
                                        className="w-full py-3 rounded-xl bg-secondary/10 hover:bg-primary hover:text-white transition-all duration-300 font-bold text-sm"
                                    >
                                        {userAplied?.some((applied: any) => applied.companyName === job.companyName && applied.job_Role === job.job_Role) ? "Applied" : "Apply Now"}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 glass-card rounded-3xl border-dashed border-2">
                                <p className="text-muted-foreground">No opportunities found at the moment.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

