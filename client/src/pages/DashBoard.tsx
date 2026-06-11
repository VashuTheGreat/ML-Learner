import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Mail, 
  Calendar, 
  FileText, 
  LogOut, 
  User as UserIcon, 
  Plus, 
  Clock,
  Settings,
  ChevronRight,
  Edit2,
  Save,
  X,
  Camera,
  Trash2,
  Upload,
  FlaskConical,
  Trophy,
  Code2,
  Bot,
  RefreshCw,
  Briefcase,
  GraduationCap
} from "lucide-react";

import userApi from "@/services/userApi";
import templateApi from "@/services/templateApi";
import pythonApi from "@/services/pythonApi";
import interviewApi from "@/services/interviewApi";
import questionApi from "@/services/questionApi";
import { useToast } from "@/components/ui/use-toast";
import { User, CodingSchema } from "@/types";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const UploadResumeModal = ({ onUploadSuccess }: { onUploadSuccess: (data: any) => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== 'application/pdf') {
        toast({ title: "Invalid Format", description: "Please upload a PDF file only.", variant: "destructive" });
        return;
      }
      setFile(selected);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      await pythonApi.uploadResume(file);
      const templateData = await templateApi.getResumeTemplate();
      if (templateData && templateData.content) {
        toast({ title: "Success", description: "Resume uploaded and parsed successfully!" });
        onUploadSuccess(templateData.content);
      } else {
        throw new Error("Could not fetch parsed template schema");
      }
    } catch (error) {
      console.error(error);
      toast({ title: "Upload Failed", description: "Could not process resume. Please try again.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md">
      <div className="w-full max-w-md p-8 bg-card border border-border rounded-3xl shadow-2xl space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary">
          <Upload className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Initialize Your Profile</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Please upload your professional resume in PDF format to build your command center and initialize your personalized AI interview profile.
          </p>
        </div>
        <div className="border-2 border-dashed border-border rounded-2xl p-6 relative group hover:border-primary/50 transition-colors">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
            disabled={isUploading}
          />
          {file ? (
            <div className="space-y-1">
              <p className="text-sm font-bold truncate text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-medium">Drag & drop or click to choose file</p>
              <p className="text-xs text-muted-foreground">PDF only (Max 10MB)</p>
            </div>
          )}
        </div>
        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full btn-primary h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Parsing Resume (takes a moment)...
            </>
          ) : (
            "Upload & Parse Resume"
          )}
        </button>
      </div>
    </div>
  );
};

export const DashBoard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutInput, setAboutInput] = useState("");
  const [isSavingAbout, setIsSavingAbout] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isExtractingResume, setIsExtractingResume] = useState(false);
  const [appliedInterviews, setAppliedInterviews] = useState<any[]>([]);
  const [isRefreshingInterviews, setIsRefreshingInterviews] = useState(false);
  const [codingSchema, setCodingSchema] = useState<CodingSchema | null>(null);

  const [resumeTemplate, setResumeTemplate] = useState<any>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isFetchingTemplate, setIsFetchingTemplate] = useState(true);

  const fetchInterviews = async (showSpinner = false) => {
    if (showSpinner) setIsRefreshingInterviews(true);
    try {
      // 1. Gather pending/scheduled interviews from local storage
      const localInterviews: any[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('pending_interview_')) {
          try {
            const val = JSON.parse(localStorage.getItem(key) || '{}');
            if (val && val._id) {
              localInterviews.push(val);
            }
          } catch (e) {
            // ignore
          }
        }
      }

      // 2. Fetch completed interviews from backend database
      const backendInterviews = await interviewApi.getUserAppliedInterviews();
      const mappedBackend = backendInterviews.map((item: any) => ({
        _id: String(item.id),
        id: String(item.id),
        topic: item.topic || 'General',
        companyName: item.companyName || 'Tech Corp',
        job_Role: item.job_Role || item.topic || 'Technical Interview',
        status: 'done',
        time: item.createdAt || new Date().toISOString(),
        performance: item.performance
      }));

      // 3. Merge both sets
      const allInterviews = [...localInterviews, ...mappedBackend];

      const today = new Date().toISOString().split('T')[0];
      
      const updatedInterviews = await Promise.all(allInterviews.map(async (interview: any) => {
        if (interview.status === 'done') return interview;
        
        try {
          const interviewDate = new Date(interview.time).toISOString().split('T')[0];
          const isToday = interviewDate === today;
          const isPassed = new Date(interviewDate) < new Date(today);

          if (isToday && interview.status === 'pending') {
            await interviewApi.updateInterviewStatus({ id: interview._id, status: 'live' });
            return { ...interview, status: 'live' };
          } else if (isPassed && (interview.status === 'live' || interview.status === 'pending')) {
            await interviewApi.updateInterviewStatus({ id: interview._id, status: 'done' });
            return { ...interview, status: 'done' };
          }
        } catch (e) {
          console.error("Error formatting date for interview", interview, e);
        }
        return interview;
      }));

      // 4. Sort by date (newest first)
      updatedInterviews.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

      setAppliedInterviews(updatedInterviews);
    } catch (error) {
      console.error("Failed to fetch interviews", error);
    } finally {
      if (showSpinner) setIsRefreshingInterviews(false);
    }
  };

  const fetchCodingSchema = async () => {
    try {
      const res = await questionApi.getCodingSchema();
      if (res.success && res.data) {
        setCodingSchema(Array.isArray(res.data) ? res.data[0] : res.data);
      }
    } catch (error) {
      console.log("Initial coding schema fetch: No data found.");
    }
  };

  const fetchResumeTemplate = async () => {
    setIsFetchingTemplate(true);
    try {
      const templateData = await templateApi.getResumeTemplate();
      if (templateData && templateData.content) {
        setResumeTemplate(templateData.content);
        setShowUploadModal(false);
        if (templateData.content.summary) {
          setAboutInput(templateData.content.summary);
        }
      } else {
        setShowUploadModal(true);
      }
    } catch (error) {
      console.error("No resume template found:", error);
      setShowUploadModal(true);
    } finally {
      setIsFetchingTemplate(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        if (parsedUser.aboutUser) {
          setAboutInput(parsedUser.aboutUser);
        }
        fetchInterviews();
        fetchCodingSchema();
        fetchResumeTemplate();
      } catch (error) {
        console.error("Failed to parse user data", error);
        navigate("/login");
        setLoading(false);
      }
    } else {
      navigate("/login");
      setLoading(false);
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await userApi.logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
      // Force logout on client side even if server fails
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const saveAboutData = async (text: string, isFromResume: boolean = false) => {
    if (isSavingAbout) return;
    setIsSavingAbout(true);
    try {
      await userApi.addAboutUser({ aboutUser: text });
      const updatedUser = await userApi.getUser();
      
      if (!updatedUser) {
        toast({ title: "Error", description: "Couldn't save about user, please try again", variant: "destructive" });
        return;
      }
      
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      try {
        const schema = await pythonApi.createSchema(updatedUser.aboutUser || text);
        console.log("Generated schema:", schema);
        
        if (schema) {
          const dataToSend = schema.userDetails ? schema.userDetails : schema;
          const updatedUser2 = await userApi.updateUserJson(dataToSend);
          
          if (updatedUser2) {
            setUser(updatedUser2);
            localStorage.setItem("user", JSON.stringify(updatedUser2));
            toast({ title: "Profile Updated", description: `Profile updated successfully with ${isFromResume ? 'text extracted from resume' : 'AI-generated schema'}!` });
          }
        } else if (!isFromResume) {
          console.warn("Schema generation did not return userDetails");
          toast({ title: "Profile Saved", description: "Profile saved, but schema generation was incomplete.", variant: "destructive" });
        }
      } catch (schemaError) {
        console.error("Error generating schema:", schemaError);
        if (!isFromResume) {
          toast({ title: "Profile Saved", description: "Profile saved, but failed to generate AI schema. You can try again later.", variant: "destructive" });
        }
      }
      
      setIsEditingAbout(false);
    } catch (error) {
      console.error("Error saving about user:", error);
      toast({ title: "Error", description: "An error occurred while saving.", variant: "destructive" });
    } finally {
      setIsSavingAbout(false);
    }
  };

  const handleSaveAbout = async () => {
    if (!aboutInput.trim()) return;
    const currentAbout = resumeTemplate?.summary || user?.aboutUser || "";
    if (aboutInput.trim() === currentAbout.trim()) {
      setIsEditingAbout(false);
      return;
    }
    
    setIsSavingAbout(true);
    try {
      await userApi.addAboutUser({ aboutUser: aboutInput });
      const updatedUser = await userApi.getUser();
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      
      if (resumeTemplate) {
        const updatedContent = { ...resumeTemplate, summary: aboutInput };
        await templateApi.updateResumeTemplate(updatedContent);
        setResumeTemplate(updatedContent);
      }
      
      toast({ title: "Profile Summary Updated", description: "Your profile summary has been updated successfully!" });
      setIsEditingAbout(false);
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Failed to update profile summary.", variant: "destructive" });
    } finally {
      setIsSavingAbout(false);
    }
  };

const handleUpdateUser = () => {
    toast({ title: "Coming soon", description: "Profile settings page coming soon!" });
};

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({ title: "Invalid Format", description: "Please upload a PDF file only.", variant: "destructive" });
      return;
    }

    setIsExtractingResume(true);
    try {
      const response = await pythonApi.uploadResume(file);
      console.log("Resume upload response:", response);
      
      // Handle various response structures:
      // 1. { data: { text: "..." } }
      // 2. { text: "..." }
      // 3. Just the text string
      let extractedText = "";
      // Handle different possible JSON structures returned by the LLM / Backend
      if (response?.data?.text) {
        extractedText = response.data.text;
      } else if (response?.text) {
        extractedText = response.text;
      } else if (response?.summary) {
        extractedText = response.summary;
      } else if (response?.data?.summary) {
        extractedText = response.data.summary;
      } else if (typeof response === 'string') {
        extractedText = response;
      } else if (response?.data && typeof response.data === 'string') {
        extractedText = response.data;
      }
      
      if (extractedText) {
        setAboutInput(extractedText);
        await saveAboutData(extractedText, true);
      } else {
        toast({ title: "Extraction Failed", description: "Could not extract text from the resume. Please try again or enter manually.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error uploading resume:", error);
      toast({ title: "Upload Failed", description: "Failed to upload and process resume. Please try again.", variant: "destructive" });
    } finally {
      setIsExtractingResume(false);
    }
  };

  const handleCancelInterview = async (id: string) => {
    try {
      await interviewApi.deleteInterview(id);
      toast({ title: "Interview Cancelled", description: "The interview has been successfully removed." });
      fetchInterviews();
    } catch (error) {
      console.error("Failed to cancel interview:", error);
      toast({ title: "Error", description: "Failed to cancel the interview. Please try again.", variant: "destructive" });
    }
  };




  const handleUploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const updatedUser = await userApi.uploadAvatar(file);
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        toast({ title: "Success", description: "Avatar uploaded successfully!" });
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({ title: "Upload Failed", description: "Failed to upload avatar. Please try again.", variant: "destructive" });
    } finally {
      setIsUploadingAvatar(false);
    }
  };


  const handleDeleteResume = async (index: number) => {
    try {
      const updatedUser = await userApi.deleteResume(index);
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        toast({ title: "Success", description: "Resume deleted successfully!" });
      }
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast({ title: "Delete Failed", description: "Failed to delete resume. Please try again.", variant: "destructive" });
    }
  };


  const viewResume=(resumeId:string)=>{
    navigate(`/viewresume/${resumeId}`);
  }

  if (loading || isFetchingTemplate) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center relative">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  const handleUploadSuccess = (parsedSchema: any) => {
    setResumeTemplate(parsedSchema);
    setShowUploadModal(false);
    if (parsedSchema.summary || parsedSchema.aboutUser) {
      setAboutInput(parsedSchema.summary || parsedSchema.aboutUser);
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          parsedUser.aboutUser = parsedSchema.summary || parsedSchema.aboutUser;
          localStorage.setItem('user', JSON.stringify(parsedUser));
          setUser(parsedUser);
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  return (
    <div className="min-h-screen w-full text-foreground selection:bg-primary/20 p-4 md:p-8 animate-in fade-in max-w-[1600px] mx-auto relative z-10">
      
      {showUploadModal && <UploadResumeModal onUploadSuccess={handleUploadSuccess} />}
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1 tracking-tight flex items-center gap-3">
            Command Center
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs uppercase tracking-widest font-bold">Online</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Welcome back, <span className="font-semibold text-foreground">{user.fullName}</span>. Here's your mission control.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            to="/schedule-interview"
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all duration-300"
          >
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-bold">Schedule Interview</span>
          </Link>
          
          <button 
            onClick={handleLogout}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 border border-border text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-300 shadow-sm"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold">System Exit</span>
          </button>
        </div>
      </div>

      {/* Horizontal Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute -right-2 top-0 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors"></div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase">Profile</div>
            <div className="text-xl font-bold flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div> Active
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute -right-2 top-0 w-16 h-16 bg-accent/5 rounded-full blur-xl group-hover:bg-accent/10 transition-colors"></div>
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase">Experience</div>
            <div className="text-xl font-bold">
              {resumeTemplate?.experience?.length || 0} Role{(resumeTemplate?.experience?.length !== 1) && 's'}
            </div>
          </div>
        </div>
        
        <div className="bg-card border border-border p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
          <div className="absolute -right-2 top-0 w-16 h-16 bg-secondary/10 rounded-full blur-xl group-hover:bg-secondary/20 transition-colors"></div>
          <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary-foreground">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase">Interviews</div>
            <div className="text-xl font-bold">{appliedInterviews.length} Scheduled</div>
          </div>
        </div>

        <Link to="/playground" className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/50 p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden group transition-all">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-primary/80 uppercase">Lab</div>
            <div className="text-lg font-bold text-primary">ML Playground</div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left Column: Full-Bleed Profile Visual */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-3xl overflow-hidden relative shadow-sm">
            {/* Cover Image/Gradient area */}
            <div className="h-32 relative overflow-hidden gradient-bg"
            >
              <button 
                onClick={handleUpdateUser}
                className="absolute top-4 right-4 p-2 rounded-xl bg-black/20 hover:bg-black/40 text-white backdrop-blur-md transition-all z-10"
                title="Edit Profile Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
            
            <div className="px-6 pb-6 relative">
              {/* Avatar out of bounds effect */}
              <div className="relative w-24 h-24 -mt-12 mb-4 group/avatar border-4 border-card rounded-2xl bg-card">
                <div className="w-full h-full rounded-xl bg-muted flex items-center justify-center text-3xl font-bold text-foreground overflow-hidden">
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.fullName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.fullName.charAt(0).toUpperCase()
                  )}
                  
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary"></div>
                    </div>
                  )}
                </div>
                
                <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-xl shadow-lg border border-primary-foreground flex items-center justify-center text-white cursor-pointer hover:bg-primary/90 transition-colors group-hover/avatar:scale-110 z-10">
                  <Camera className="w-4 h-4" />
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleUploadAvatar}
                    disabled={isUploadingAvatar}
                  />
                </label>
              </div>
              
              <h2 className="text-xl font-bold leading-none mb-1">{resumeTemplate?.name || user.fullName}</h2>
              <p className="text-sm text-muted-foreground mb-2 truncate">{resumeTemplate?.email || user.email}</p>
              {resumeTemplate?.phone && (
                <p className="text-xs text-muted-foreground mb-1 font-mono">{resumeTemplate.phone}</p>
              )}
              {resumeTemplate?.location && (
                <p className="text-xs text-muted-foreground mb-3">{resumeTemplate.location}</p>
              )}
              {resumeTemplate?.apparentSeniority && (
                <div className="mb-4">
                  <span className="inline-block px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                    {resumeTemplate.apparentSeniority} Level
                  </span>
                </div>
              )}

              {/* Social Links Section */}
              {resumeTemplate?.links?.social_links && resumeTemplate.links.social_links.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {resumeTemplate.links.social_links.map((link: string, idx: number) => {
                    const cleanLink = link.startsWith('http') ? link : `https://${link}`;
                    const displayLink = link.replace(/^https?:\/\/(www\.)?/, '');
                    
                    return (
                      <a 
                        key={idx}
                        href={cleanLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary/50 hover:bg-primary/10 border border-border/40 text-[10px] font-semibold text-muted-foreground hover:text-primary transition-all max-w-[220px] truncate"
                        title={link}
                      >
                        {displayLink}
                      </a>
                    );
                  })}
                </div>
              )}
              
              <div className="space-y-3 mb-6 border-t border-border pt-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> Joined</span>
                  <span className="font-medium">{formatDate(user.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Updated</span>
                  <span className="font-medium">{formatDate(user.updatedAt)}</span>
                </div>
              </div>

              {/* About User Inside Profile */}
              <div className="border-t border-border pt-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">About You</h3>
                  <div className="flex justify-end gap-1">
                      <label className="p-1.5 bg-secondary/30 hover:bg-secondary/60 rounded-md transition-colors text-muted-foreground hover:text-primary cursor-pointer" title="Auto-fill from Resume PDF">
                        {isExtractingResume ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-primary"></div>
                        ) : (
                          <Upload className="w-3 h-3" />
                        )}
                        <input 
                          type="file" 
                          className="hidden" 
                          accept=".pdf"
                          onChange={handleResumeUpload}
                          disabled={isExtractingResume || isSavingAbout}
                        />
                      </label>
                      {!isEditingAbout && (
                        <button 
                          onClick={() => setIsEditingAbout(true)}
                          className="p-1.5 bg-secondary/30 hover:bg-secondary/60 rounded-md transition-colors text-muted-foreground hover:text-primary"
                          title="Edit Manually"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
                  </div>
                </div>

                {isEditingAbout ? (
                 <div className="space-y-3">
                   <textarea
                     value={aboutInput}
                     onChange={(e) => setAboutInput(e.target.value)}
                     className="w-full min-h-[120px] p-3 text-sm rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                     placeholder="Tell us about your professional background..."
                   />
                   <div className="flex justify-end gap-2">
                     <button 
                       onClick={() => setIsEditingAbout(false)}
                       disabled={isSavingAbout}
                       className="px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                     >
                       Cancel
                     </button>
                     <button 
                       onClick={handleSaveAbout}
                       disabled={isSavingAbout}
                       className="px-4 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
                     >
                       {isSavingAbout ? (
                         <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                       ) : <Save className="w-3 h-3" />}
                       Save
                     </button>
                   </div>
                 </div>
               ) : (
                 <div className="text-sm text-foreground/80 leading-relaxed p-3 bg-secondary/10 rounded-xl">
                   {resumeTemplate?.summary || user.aboutUser ? (
                     <span className="line-clamp-6">{resumeTemplate?.summary || user.aboutUser}</span>
                   ) : (
                     <span className="italic opacity-60">
                       No summary added. Upload a resume PDF to auto-generate.
                     </span>
                   )}
                 </div>
               )}
              </div>
            </div>
          </div>

          {/* Coding Stats Small Card */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4 uppercase tracking-wider text-muted-foreground">
              <Code2 className="w-4 h-4 text-primary" />
              Code Solved
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="bg-emerald-500/10 p-2 text-center rounded-xl border border-emerald-500/20">
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{codingSchema?.easy || 0}</div>
                  <div className="text-[9px] font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase">Easy</div>
                </div>
                <div className="bg-amber-500/10 p-2 text-center rounded-xl border border-amber-500/20">
                  <div className="text-lg font-black text-amber-600 dark:text-amber-400">{codingSchema?.medium || 0}</div>
                  <div className="text-[9px] font-bold text-amber-600/70 dark:text-amber-400/70 uppercase">Med</div>
                </div>
                <div className="bg-rose-500/10 p-2 text-center rounded-xl border border-rose-500/20">
                  <div className="text-lg font-black text-rose-600 dark:text-rose-400">{codingSchema?.hard || 0}</div>
                  <div className="text-[9px] font-bold text-rose-600/70 dark:text-rose-400/70 uppercase">Hard</div>
                </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Recently Active</h4>
                {codingSchema?.recently_solved && codingSchema.recently_solved.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {codingSchema.recently_solved.slice(0, 4).map((slug, idx) => {
                      const slugStr = String(slug);
                      const displayText = isNaN(Number(slugStr)) 
                        ? slugStr.replace(/-/g, ' ') 
                        : `Question ${slugStr}`;
                      return (
                        <Link 
                          key={idx}
                          to={`/solve/${slugStr}`}
                          className="px-2.5 py-1 rounded-md bg-muted border border-border text-[10px] font-semibold hover:border-primary/50 transition-colors truncate max-w-[120px] text-muted-foreground hover:text-foreground capitalize"
                        >
                          {displayText}
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground italic bg-muted/30 p-2 rounded-lg text-center">No questions solved.</div>
                )}
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Recently Visited</h4>
                {codingSchema?.recently_visited && codingSchema.recently_visited.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {codingSchema.recently_visited.slice(0, 5).map((slug, idx) => {
                      const slugStr = String(slug);
                      const displayText = isNaN(Number(slugStr)) 
                        ? slugStr.replace(/-/g, ' ') 
                        : `Question ${slugStr}`;
                      return (
                        <Link 
                          key={idx}
                          to={`/solve/${slugStr}`}
                          className="px-2.5 py-1 rounded-md bg-muted border border-border text-[10px] font-semibold hover:border-primary/50 transition-colors truncate max-w-[120px] text-muted-foreground hover:text-foreground capitalize"
                        >
                          {displayText}
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground italic bg-muted/30 p-2 rounded-lg text-center">No questions visited.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Carousel & Stack */}
        <div className="xl:col-span-3 space-y-8">
          
          {/* Interview Carousel (Horizontal Scrolling Row) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Interviews & Performance History
              </h2>
              <button
                onClick={() => fetchInterviews(true)}
                disabled={isRefreshingInterviews}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary/40 hover:bg-secondary/70 border border-border text-sm font-semibold text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
                title="Refresh interviews"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingInterviews ? 'animate-spin' : ''}`} />
                {isRefreshingInterviews ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            
            {appliedInterviews.length > 0 ? (
              <div className="flex overflow-x-auto gap-5 pb-4 snap-x scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                {appliedInterviews.map((interview, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      if (interview.status === 'live') navigate(`/interview/${interview._id}`);
                      else if (interview.status === 'done') navigate(`/performance/${interview._id}`);
                      else toast({ title: "Scheduled", description: `Scheduled for ${formatDate(interview.time)}.` });
                    }}
                    className="min-w-[320px] sm:min-w-[360px] snap-center cursor-pointer group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Gradient header band */}
                    <div className="h-24 relative overflow-hidden flex-shrink-0 gradient-bg"
                    >
                      <div className="absolute inset-0 opacity-30 bg-white/10" />
                      {/* Status badge top-right */}
                      <div className="absolute top-3 right-3">
                        <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-md shadow-sm border border-white/20 ${
                          interview.status === 'live'
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/40 animate-pulse'
                            : interview.status === 'done'
                            ? 'bg-white/20 text-white'
                            : 'bg-muted/80 text-foreground'
                        }`}>
                          {interview.status === 'live' ? '• LIVE' : interview.status === 'done' ? 'Done' : 'Scheduled'}
                        </span>
                      </div>
                      {/* Cancel Button */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button 
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-3 left-3 p-2 rounded-xl bg-black/20 hover:bg-destructive/20 text-white/70 hover:text-destructive backdrop-blur-md transition-all z-10 opacity-0 group-hover:opacity-100"
                            title="Cancel Interview"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Interview?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your upcoming interview.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleCancelInterview(interview._id)}>Cancel Interview</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      {/* Floating Bot icon */}
                      <div className="absolute bottom-0 left-6 translate-y-1/2">
                        <div className="w-14 h-14 rounded-2xl bg-card border-2 border-border shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Bot className="w-7 h-7 text-primary" />
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="pt-10 pb-5 px-6 flex flex-col flex-1">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold leading-snug group-hover:text-primary transition-colors">
                          {interview.job_Role}
                        </h3>
                        <p className="text-sm text-foreground/70 font-semibold mt-0.5">
                          {interview.companyName}
                        </p>
                      </div>

                      <div className="mt-auto pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="font-semibold">{formatDate(interview.time)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                          <span className="text-xs font-bold">Open</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-muted/30 border border-dashed border-border rounded-3xl p-8 text-center text-muted-foreground font-medium">
                No active interviews. Apply for jobs to start practicing.
              </div>
            )}
          </div>

          {/* Active Resume Data Display */}
          <div className="space-y-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Resume Profile
              </h2>
              <button 
                onClick={() => setShowUploadModal(true)} 
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-md hover:bg-primary/90 transition-colors"
              >
                <Upload className="w-4 h-4" /> Re-upload Resume
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Experience timeline */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold flex items-center gap-2 border-b border-border/50 pb-3">
                  <Briefcase className="w-5 h-5 text-primary" /> Experience History
                </h3>
                {resumeTemplate?.experience && resumeTemplate.experience.length > 0 ? (
                  <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {resumeTemplate.experience.map((exp: any, idx: number) => (
                      <div key={idx} className="relative pl-6 border-l-2 border-primary/20 last:border-0 pb-1">
                        <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-primary" />
                        <h4 className="font-bold text-sm text-foreground">{exp.role}</h4>
                        <p className="text-xs font-semibold text-primary">{exp.company}</p>
                        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{exp.summary}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No professional experience listed.</p>
                )}
              </div>

              {/* Education list */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold flex items-center gap-2 border-b border-border/50 pb-3">
                  <GraduationCap className="w-5 h-5 text-primary" /> Education History
                </h3>
                {resumeTemplate?.education && resumeTemplate.education.length > 0 ? (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {resumeTemplate.education.map((edu: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{edu.degree}</h4>
                          <p className="text-xs text-muted-foreground">{edu.college || edu.university}</p>
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground bg-secondary/30 px-2.5 py-1 rounded-md shrink-0">
                          {edu.start} - {edu.end || 'Present'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No education history listed.</p>
                )}
              </div>

              {/* Projects Spotlight (Full-width grid column) */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4 md:col-span-2">
                <h3 className="text-base font-bold flex items-center gap-2 border-b border-border/50 pb-3">
                  <Code2 className="w-5 h-5 text-primary" /> Projects Spotlight
                </h3>
                {resumeTemplate?.projects && resumeTemplate.projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resumeTemplate.projects.map((proj: any, idx: number) => (
                      <div key={idx} className="bg-secondary/10 border border-border/40 p-4 rounded-2xl flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{proj.title}</h4>
                          <ul className="text-xs text-muted-foreground mt-2.5 list-disc list-inside space-y-1 leading-relaxed">
                            {(proj.bullet_points || []).map((bp: string, bpIdx: number) => (
                              <li key={bpIdx}>{bp}</li>
                            ))}
                          </ul>
                        </div>
                        {proj.links && proj.links.length > 0 && (
                          <div className="mt-4 flex gap-2">
                            {proj.links.map((link: string, linkIdx: number) => (
                              <a 
                                key={linkIdx} 
                                href={link.startsWith('http') ? link : `https://${link}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-[10px] font-bold text-primary hover:underline"
                              >
                                Project Link
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No projects listed.</p>
                )}
              </div>

              {/* Skills Inventory */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4 md:col-span-2">
                <h3 className="text-base font-bold flex items-center gap-2 border-b border-border/50 pb-3">
                  <Trophy className="w-5 h-5 text-primary" /> Technical Skills & Technologies
                </h3>
                {resumeTemplate?.skills && resumeTemplate.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {resumeTemplate.skills.map((skill: string, idx: number) => (
                      <span key={idx} className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold rounded-xl">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No technical skills listed.</p>
                )}
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
