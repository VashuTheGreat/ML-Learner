import React, { useEffect, useState } from 'react';
import { Layout, Search, Filter, ArrowRight, Loader2, Upload, X, FileJson, FileCode } from 'lucide-react';
import templateApi from '@/services/templateApi';

import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Template {
  _id: string;
  title: string;
  to_render: string;
}

export const Templates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  
  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [tempDataFile, setTempDataFile] = useState<File | null>(null);

  const useTemplate = (template: Template) => {
    navigate(`/create-resume/${template._id}`);
  };

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await templateApi.getAllTemplates();
      console.log("Templates API Response:", response);
      setTemplates(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle || !templateFile || !tempDataFile) {
      toast.error("Please fill all fields and select both files");
      return;
    }

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadTitle);
      formData.append('template', templateFile);
      formData.append('temp_data', tempDataFile);

      await templateApi.createTemplate(formData);
      toast.success("Template uploaded successfully!");
      setShowUploadModal(false);
      
      // Reset form
      setUploadTitle('');
      setTemplateFile(null);
      setTempDataFile(null);
      
      // Refresh templates
      fetchTemplates();
    } catch (error: any) {
      console.error("Upload failed:", error);
      toast.error(error.response?.data?.message || "Failed to upload template");
    } finally {
      setUploadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent selection:bg-primary/20">
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
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-8">
            Stand out from the crowd with our professionally designed templates. 
            ATS-friendly, modern, and easy to customize.
          </p>
          
          <button 
            onClick={() => setShowUploadModal(true)}
            className="btn-primary flex items-center gap-2 mx-auto px-8 py-3 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Custom Template</span>
          </button>
        </div>

        {/* Search & Filter */}
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
                  <div className="absolute inset-0 z-10 bg-transparent"></div>
                  <iframe
                    srcDoc={template.to_render}
                    title={template.title}
                    className="w-[200%] h-[200%] origin-top-left scale-50 border-none pointer-events-none"
                    tabIndex={-1}
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20 backdrop-blur-sm">
                    <button className="btn-primary transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex items-center gap-2" onClick={() => useTemplate(template)}>
                      Use Template <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-5 border-t border-border bg-card/50 backdrop-blur-sm">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{template.title || 'Untitled Template'}</h3>
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
          <div className="text-center py-24 glass-card rounded-3xl border-dashed border-2 border-border/50 max-w-2xl mx-auto">
            <div className="w-20 h-20 mx-auto rounded-full bg-secondary/10 flex items-center justify-center mb-6">
              <Layout className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-8">
              We couldn't find any templates in the collection. You can upload your own custom template to get started.
            </p>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="text-primary font-bold hover:underline flex items-center gap-2 mx-auto"
            >
              <Upload size={18} />
              Upload your first template
            </button>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Upload className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold">Upload Custom Template</h2>
                </div>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 rounded-xl hover:bg-secondary/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleUpload} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold ml-1">Template Title</label>
                  <input 
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g., Modern Software Engineer"
                    className="w-full px-4 py-3 rounded-xl bg-secondary/5 border border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold ml-1">Template File (.ejs/.html)</label>
                    <div className="relative group">
                      <input 
                        type="file"
                        required
                        accept=".ejs,.html"
                        onChange={(e) => setTemplateFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="template-upload"
                      />
                      <label 
                        htmlFor="template-upload"
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer",
                          templateFile 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50 hover:bg-secondary/5"
                        )}
                      >
                        <FileCode className={cn("w-8 h-8", templateFile ? "text-primary" : "text-muted-foreground")} />
                        <span className="text-xs font-medium text-center truncate w-full px-2">
                          {templateFile ? templateFile.name : "Select Template"}
                        </span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold ml-1">Sample Data (.json)</label>
                    <div className="relative group">
                      <input 
                        type="file"
                        required
                        accept=".json"
                        onChange={(e) => setTempDataFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="data-upload"
                      />
                      <label 
                        htmlFor="data-upload"
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer",
                          tempDataFile 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50 hover:bg-secondary/5"
                        )}
                      >
                        <FileJson className={cn("w-8 h-8", tempDataFile ? "text-primary" : "text-muted-foreground")} />
                        <span className="text-xs font-medium text-center truncate w-full px-2">
                          {tempDataFile ? tempDataFile.name : "Select Data"}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-6 py-3 rounded-xl border border-border font-bold hover:bg-secondary/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={uploadLoading}
                    className="flex-1 btn-primary px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  >
                    {uploadLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        <span>Upload Now</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
