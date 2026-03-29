import React, { useState } from 'react';
import pythonApi from '@/services/pythonApi';
import {
  Search, Briefcase, Building2, ExternalLink, ClipboardList,
  Loader2, AlertCircle, Linkedin, RefreshCw, ChevronDown, ChevronUp, ImageOff
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Job {
  Title: string;
  Company: string;
  'Job Link': string;
  'Apply Link': string;
  Description: string;
  img_link: string;
}

const JobFetcher: React.FC = () => {
  const { toast } = useToast();
  const [jobTitle, setJobTitle] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [searched, setSearched] = useState(false);

  const handleFetch = async () => {
    if (!jobTitle.trim()) {
      toast({ title: 'Enter a job title', description: 'Please type a role to search for.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setError(null);
    setJobs([]);
    setSearched(true);
    setExpandedIdx(null);
    try {
      const data = await pythonApi.fetchJobs(jobTitle.trim());
      // data can be an array or { jobs: Job[] }
      const parsed: Job[] = Array.isArray(data) ? data : (data?.jobs ?? []);
      setJobs(parsed);
      if (parsed.length === 0) {
        setError('No jobs found. The scraper may still be logging in — try again in a moment.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? err?.message ?? 'An unknown error occurred.';
      setError(msg);
      toast({ title: 'Scraper Error', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (idx: number) =>
    setExpandedIdx(prev => (prev === idx ? null : idx));

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 pt-24 pb-16">

        {/* ── Header ─────────────────────────────────── */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
            <Linkedin className="w-3.5 h-3.5" />
            Live LinkedIn Scraper
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">
            Find Your Next <span className="gradient-text">Dream Job</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Scrape real LinkedIn listings in seconds. Type a role and let the bot do the browsing.
          </p>
        </div>

        {/* ── Search bar ─────────────────────────────── */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex gap-2 p-1.5 glass-card rounded-2xl border border-border/50 shadow-lg">
            <div className="flex-1 flex items-center gap-3 px-4 relative">
              <Search className="w-5 h-5 text-primary/60 shrink-0" />
              <select
                id="job-title-input"
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                className="flex-1 bg-transparent text-sm font-medium text-foreground focus:outline-none py-2 cursor-pointer appearance-none pr-8 w-full"
              >
                <option value="" disabled>Select a role...</option>
                <option value="Machine Learning Intern" className="bg-background text-foreground">Machine Learning Intern</option>
                <option value="Data Science Intern" className="bg-background text-foreground">Data Science Intern</option>
                <option value="AIML Intern" className="bg-background text-foreground">AIML Intern</option>
                <option value="Backend Intern" className="bg-background text-foreground">Backend Intern</option>
                <option value="Frontend Intern" className="bg-background text-foreground">Frontend Intern</option>
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <button
              id="fetch-jobs-btn"
              onClick={handleFetch}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scraping…
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Fetch Jobs
                </>
              )}
            </button>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-2">
            ⚠️ First run may take ~60 s — LinkedIn login happens automatically via Selenium.
          </p>
        </div>

        {/* ── Loading skeleton ───────────────────────── */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 border border-border/30 space-y-4">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-5/6" />
                <div className="h-9 bg-muted rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* ── Error state ────────────────────────────── */}
        {!loading && error && (
          <div className="max-w-lg mx-auto text-center py-16 glass-card rounded-3xl border border-destructive/30 px-8">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Scraper Error</h3>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
        )}

        {/* ── Empty state ────────────────────────────── */}
        {!loading && !error && searched && jobs.length === 0 && (
          <div className="max-w-lg mx-auto text-center py-16 glass-card rounded-3xl border-dashed border-2 px-8">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">No Jobs Found</h3>
            <p className="text-muted-foreground text-sm">Try a different keyword or wait a moment and retry.</p>
          </div>
        )}

        {/* ── Job cards ──────────────────────────────── */}
        {!loading && jobs.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground mb-6 text-center">
              Found <span className="font-bold text-primary">{jobs.length}</span> listings for <span className="font-bold">"{jobTitle}"</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job, idx) => {
                const isExpanded = expandedIdx === idx;
                const hasImg = job.img_link && job.img_link !== 'N/A';
                return (
                  <div
                    key={idx}
                    className="glass-card rounded-2xl border border-border/50 card-hover group flex flex-col overflow-hidden"
                  >
                    {/* Card header */}
                    <div className="p-5 pb-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 min-w-[48px] rounded-xl bg-white border border-border flex items-center justify-center overflow-hidden shadow-sm group-hover:border-primary/40 transition-colors">
                          {hasImg ? (
                            <img
                              src={job.img_link}
                              alt={job.Company}
                              className="w-full h-full object-contain p-1"
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <Building2 className="w-6 h-6 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold leading-tight group-hover:text-primary transition-colors truncate">
                            {job.Title !== 'N/A' ? job.Title : 'Untitled Role'}
                          </h3>
                          <p className="text-sm text-muted-foreground font-medium truncate">
                            {job.Company !== 'N/A' ? job.Company : 'Unknown Company'}
                          </p>
                        </div>
                      </div>

                      {/* Description preview / expand */}
                      {job.Description && job.Description !== 'N/A' && (
                        <div className="mb-3">
                          <p className={`text-xs text-muted-foreground leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
                            {job.Description}
                          </p>
                          <button
                            onClick={() => toggleExpand(idx)}
                            className="mt-1 text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline"
                          >
                            {isExpanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Read more</>}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="mt-auto border-t border-border/30 p-4 flex flex-col gap-2">
                      {(() => {
                        const applyUrl = job['Apply Link'];
                        const jobUrl = job['Job Link'];
                        // Consider a valid apply link only if it's a real URL
                        const isValidApply = applyUrl && applyUrl.startsWith('http');
                        // Best available link for applying
                        const bestApply = isValidApply ? applyUrl : (jobUrl && jobUrl.startsWith('http') ? jobUrl : null);
                        return bestApply ? (
                          <a
                            href={bestApply}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-2.5 flex items-center justify-center gap-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all duration-300"
                          >
                            <ExternalLink className="w-4 h-4" />
                            {isValidApply ? 'Apply Now' : 'Apply on LinkedIn'}
                          </a>
                        ) : null;
                      })()}
                      {job['Job Link'] && job['Job Link'].startsWith('http') && (
                        <a
                          href={job['Job Link']}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-2 flex items-center justify-center gap-2 rounded-xl bg-secondary/10 hover:bg-secondary/20 text-muted-foreground text-xs font-bold transition-all duration-300"
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                          View on LinkedIn
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default JobFetcher;
