import { Link } from "react-router-dom";
import { ArrowRight, Play, Star, Users, BookOpen, Bot, FileText, Code2 } from "lucide-react";
import Footer from "@/components/layout/Footer";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col pt-6 px-4 md:px-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-in fade-in pb-20">

      {/* ── BENTO GRID ───────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[minmax(180px,auto)]">

        {/* BIG HERO – spans 3 cols, 2 rows */}
        <div className="md:col-span-3 md:row-span-2 relative rounded-3xl overflow-hidden p-8 md:p-12 shadow-2xl flex flex-col justify-between group gradient-bg"
        >
          {/* ambient glow orbs */}
          <div className="absolute top-0 right-0 w-[480px] h-[480px] rounded-full blur-[110px] -translate-y-1/3 translate-x-1/4 transition-all duration-700 bg-primary/10" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full blur-[90px] translate-y-1/3 -translate-x-1/4 bg-primary/20" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium mb-8 text-white">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span>Top Rated Tech Platform 2025</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6 text-white">
              Master The <br />
              <span className="gradient-text brightness-125">
                Future of AI.
              </span>
            </h1>

            <p className="text-lg md:text-xl max-w-lg mb-10 leading-relaxed text-white/80">
              Accelerate your tech career with personalized coding
              challenges and real-time AI-driven mock interviews.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <Link
              to="/courses"
              className="btn-primary"
            >
              Start Learning Now
            </Link>
          </div>
        </div>

        {/* STATS STACK – top right, 1 col 2 rows */}
        <div className="md:col-span-1 md:row-span-2 flex flex-col gap-4 md:gap-6">
          <div className="flex-1 rounded-3xl bg-card border border-border p-6 shadow-sm flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all" />
            <Users className="w-8 h-8 text-primary mb-4" />
            <div className="text-4xl font-extrabold text-foreground mb-1">10,000+</div>
            <div className="text-sm text-muted-foreground font-medium">Active Students Worldwide</div>
          </div>

          <div className="flex-1 rounded-3xl bg-primary/5 border border-primary/20 p-6 shadow-sm flex flex-col justify-center group">
            <div className="flex items-center gap-1 mb-3">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />)}
            </div>
            <div className="text-3xl font-extrabold text-foreground mb-1">4.9 / 5.0</div>
            <div className="text-sm text-muted-foreground font-medium">Average Platform Rating</div>
          </div>
        </div>

        {/* FEATURE CARDS – middle row, 3 cards */}
        <Link
          to="/courses"
          className="rounded-3xl p-6 md:p-8 flex flex-col justify-between group hover:-translate-y-1 transition-transform relative overflow-hidden border border-border bg-card"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-primary/5" />
          <BookOpen className="w-8 h-8 text-primary mb-8 relative z-10" />
          <div className="relative z-10">
            <div className="text-3xl font-bold mb-1 text-foreground group-hover:text-primary transition-colors">50+</div>
            <div className="text-lg font-medium text-muted-foreground">Premium Courses</div>
          </div>
        </Link>

        <Link
          to="/ai-interview"
          className="rounded-3xl text-white p-6 md:p-8 flex flex-col justify-between group hover:-translate-y-1 transition-transform relative overflow-hidden shadow-lg gradient-bg glow-primary"
        >
          <div className="absolute top-6 right-6 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold animate-pulse">
            Live Now
          </div>
          <Bot className="w-8 h-8 text-white mb-8" />
          <div>
            <div className="text-2xl font-bold mb-1">AI Interviewer</div>
            <div className="font-medium leading-tight text-white/80">
              Practice with FAANG-level AI
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard"
          className="rounded-3xl bg-card border border-border p-6 md:p-8 flex flex-col justify-between group hover:-translate-y-1 hover:border-primary/50 transition-all"
        >
          <FileText className="w-8 h-8 text-primary mb-8" />
          <div>
            <div className="text-2xl font-bold text-foreground mb-1">Resume Builder</div>
            <div className="text-muted-foreground font-medium leading-tight">ATS-friendly templates</div>
          </div>
        </Link>

        {/* BOTTOM ROW */}
        <div className="md:col-span-2 rounded-3xl border border-border p-8 flex items-center justify-between group cursor-pointer hover:bg-primary/5 transition-colors overflow-hidden relative">
          <div className="absolute -right-10 top-1/2 -translate-y-1/2 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500">
            <Play className="w-64 h-64" />
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-bold italic text-foreground mb-2">See How It Works</h3>
            <p className="text-muted-foreground">Take a 2-minute tour of our learning environment.</p>
          </div>
          <div className="w-14 h-14 rounded-full border-2 border-primary text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors z-10 flex-shrink-0">
            <Play className="w-6 h-6 ml-1 fill-current" />
          </div>
        </div>

        <div className="md:col-span-2 rounded-3xl bg-card border border-border p-6 md:p-8 flex flex-col justify-center">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Trending Paths</h3>
          <div className="flex flex-col gap-3">
            {['Advanced JavaScript & TS', 'React Modern Architecture', 'DSA Mastery for Interviews'].map((course, i) => (
              <Link key={i} to="/courses" className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{course}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>

      </div>

      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
};

export default Home;
