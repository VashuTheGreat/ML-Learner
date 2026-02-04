import React, { useEffect, useState } from 'react';
import { Layout, Search, Filter, ArrowRight, Loader2 } from 'lucide-react';
import templateApi from '@/Services/templateApi';
import Navbar from '@/components/layout/Navbar';
import { Link, useNavigate } from 'react-router-dom';

interface Template {
  _id: string;
  title: string;
  to_render: string;
  // Add other fields if available in the API response
}

export const Templates = () => {
  const navigate=useNavigate()
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const useTemplate=(template:Template)=>{
    console.log("use Template",template)
    navigate(`/create-resume/${template._id}`)
    
  }

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await templateApi.getAllTemplates();
        // Ensure we're setting an array, even if response.data is null/undefined
        setTemplates(Array.isArray(response) ? response : []);
      } catch (error) {
        console.error("Failed to fetch templates:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-float">
            <Layout className="w-4 h-4" />
            <span>Premium Collection</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Choose Your <span className="gradient-text">Perfect Resume</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
            Stand out from the crowd with our professionally designed templates. 
            ATS-friendly, modern, and easy to customize.
          </p>
        </div>

        {/* Search & Filter (Visual only for now) */}
        <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search templates..." 
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-secondary/5 border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:border-primary/50 hover:bg-secondary/5 transition-all">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Templates Grid */}
        {templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template) => (
              <div key={template._id} className="group relative bg-card rounded-2xl border border-border overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2">
                {/* Preview Window */}
                <div className="relative aspect-[1/1.414] bg-white overflow-hidden">
                  <div className="absolute inset-0 z-10 bg-transparent"></div> {/* Overlay to prevent iframe interaction */}
                  <iframe
                    srcDoc={template.to_render}
                    title={template.title}
                    className="w-[200%] h-[200%] origin-top-left scale-50 border-none pointer-events-none"
                    tabIndex={-1}
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20 backdrop-blur-sm">
                    <button className="btn-primary transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2" onClick={()=>useTemplate(template)}>
                      Use Template <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-5 border-t border-border bg-card/50 backdrop-blur-sm">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{template.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Professional</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <div key={star} className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">No templates found. Please check back later.</p>
          </div>
        )}
      </main>
    </div>
  );
};
