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
  Bot
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import userApi from "@/Services/userApi";
import templateApi from "@/Services/templateApi";
import pythonApi from "@/Services/pythonApi";
import interviewApi from "@/Services/interviewApi";
import questionApi, { type CodingSchema } from "@/Services/questionApi";

interface User {
  _id: string;
  fullName: string;
  email: string;
  resumes: any[];
  createdAt: string;
  updatedAt: string;
  refreshToken?: string;
  aboutUser?: string;
  avatar?: string;
}

const ResumePreview = ({ resumeId }: { resumeId: string }) => {
  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        // Safe user data retrieval
        const userStr = localStorage.getItem('user');
        let tempData = null;
        if (userStr) {
            try {
                const parsedUser = JSON.parse(userStr);
                tempData = parsedUser.temp_data;
            } catch (e) {
                console.error("Error parsing user data for preview", e);
            }
        }

        // Fetch template with data if available, otherwise just template
        let resume;
        if (tempData) {
             // Check if temp_data has userDetails, otherwise use temp_data itself
             const dataToSend = tempData.userDetails ? tempData.userDetails : tempData;
             resume = await templateApi.getTemplateByData(resumeId, dataToSend);
        } else {
             resume = await templateApi.getTemplate(resumeId);
        }

        if (resume && resume.to_render) {
          setHtmlContent(resume.to_render);
        }
      } catch (error) {
        console.error("Failed to fetch resume preview", error);
      } finally {
        setLoading(false);
      }
    };

    if (resumeId) {
      fetchResume();
    }
  }, [resumeId]);

  if (loading) {
    return <div className="h-32 flex items-center justify-center text-xs text-muted-foreground">Loading preview...</div>;
  }

  if (!htmlContent) {
    return <div className="h-32 flex items-center justify-center text-xs text-muted-foreground">Preview unavailable</div>;
  }

  return (
    <div className="h-32 overflow-hidden border rounded-md bg-white relative">
      <iframe 
        srcDoc={htmlContent}
        title={`Preview ${resumeId}`}
        className="absolute inset-0 pointer-events-none scale-[0.25] origin-top-left w-[400%] h-[400%] border-none"
        tabIndex={-1}
      />
    </div>
  );
};

export const DashBoard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutInput, setAboutInput] = useState("");
  const [isSavingAbout, setIsSavingAbout] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isExtractingResume, setIsExtractingResume] = useState(false);
  const [appliedInterviews, setAppliedInterviews] = useState<any[]>([]);
  const [codingSchema, setCodingSchema] = useState<CodingSchema | null>(null);

  const fetchInterviews = async () => {
    try {
      const interviews = await interviewApi.getUserAppliedInterviews();
      if (!interviews) return;

      const today = new Date().toISOString().split('T')[0];
      
      const updatedInterviews = await Promise.all(interviews.map(async (interview: any) => {
        const interviewDate = new Date(interview.time).toISOString().split('T')[0];
        const isToday = interviewDate === today;
        const isPassed = new Date(interviewDate) < new Date(today);

        if (isToday && interview.status === 'pending') {
          await interviewApi.updateInterviewStatus({ id: interview._id, status: 'live' });
          return { ...interview, status: 'live' };
        } else if (isPassed && interview.status === 'live') {
          await interviewApi.updateInterviewStatus({ id: interview._id, status: 'done' });
          return { ...interview, status: 'done' };
        }
        return interview;
      }));

      setAppliedInterviews(updatedInterviews);
    } catch (error) {
      console.error("Failed to fetch interviews", error);
    }
  };

  const fetchCodingSchema = async () => {
    try {
      const res = await questionApi.getCodingSchema();
      if (res.success && res.data) {
        setCodingSchema(Array.isArray(res.data) ? res.data[0] : res.data);
      }
    } catch (error) {
      console.warn("Coding schema not found or failed to fetch");
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
      } catch (error) {
        console.error("Failed to parse user data", error);
        navigate("/login");
      }
    } else {
      navigate("/login");
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

  const handleSaveAbout = async () => {
    if (isSavingAbout) return; // Prevent multiple clicks
    if (!aboutInput.trim()) return;

    // Optimization: Check if the text actually changed (ignoring whitespace)
    const currentAbout = user?.aboutUser || "";
    if (aboutInput.trim() === currentAbout.trim()) {
      setIsEditingAbout(false);
      return;
    }
    
    setIsSavingAbout(true);
    try {
      // Step 1: Save the aboutUser text
      await userApi.addAboutUser({ aboutUser: aboutInput });
      const updatedUser = await userApi.getUser();
      
      if (!updatedUser) {
        alert("Couldn't save about user, please try again");
        return;
      }
      
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Step 2: Generate schema from the aboutUser text
      try {
        const schema = await pythonApi.createSchema(updatedUser.aboutUser || aboutInput);
        console.log("Generated schema:", schema);
        
        // Step 3: Validate and update user JSON with the generated schema
        if (schema && schema.userDetails) {
          const updatedUser2 = await userApi.updateUserJson(schema.userDetails);
          
          if (updatedUser2) {
            setUser(updatedUser2);
            localStorage.setItem("user", JSON.stringify(updatedUser2));
            alert("Profile updated successfully with AI-generated schema!");
          }
        } else {
          console.warn("Schema generation did not return userDetails");
          alert("Profile saved, but schema generation was incomplete.");
        }
      } catch (schemaError) {
        console.error("Error generating schema:", schemaError);
        alert("Profile saved, but failed to generate AI schema. You can try again later.");
      }
      
      setIsEditingAbout(false);
    } catch (error) {
      console.error("Error saving about user:", error);
      alert("An error occurred while saving.");
    } finally {
      setIsSavingAbout(false);
    }
  };

const handleUpdateUser=async()=>{
  navigate("/updateUser")
}

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert("Please upload a PDF file only.");
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
      if (response?.data?.text) {
        extractedText = response.data.text;
      } else if (response?.text) {
        extractedText = response.text;
      } else if (typeof response === 'string') {
        extractedText = response;
      } else if (response?.data && typeof response.data === 'string') {
        extractedText = response.data;
      }
      
      if (extractedText) {
        setAboutInput(extractedText);
        await handleSaveAboutWithText(extractedText);
      } else {
        alert("Could not extract text from the resume. Please try again or enter manually.");
      }
    } catch (error) {
      console.error("Error uploading resume:", error);
      alert("Failed to upload and process resume. Please try again.");
    } finally {
      setIsExtractingResume(false);
    }
  };

  const handleSaveAboutWithText = async (textToSave: string) => {
    if (isSavingAbout) return;
    
    setIsSavingAbout(true);
    try {
      // Step 1: Save the aboutUser text
      await userApi.addAboutUser({ aboutUser: textToSave });
      const updatedUser = await userApi.getUser();
      
      if (!updatedUser) {
        alert("Couldn't save about user, please try again");
        return;
      }
      
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Step 2: Generate schema from the aboutUser text
      try {
        const schema = await pythonApi.createSchema(updatedUser.aboutUser || textToSave);
        console.log("Generated schema:", schema);
        
        if (schema && schema.userDetails) {
          const updatedUser2 = await userApi.updateUserJson(schema.userDetails);
          
          if (updatedUser2) {
            setUser(updatedUser2);
            localStorage.setItem("user", JSON.stringify(updatedUser2));
            alert("Profile updated successfully with text extracted from resume!");
          }
        }
      } catch (schemaError) {
        console.error("Error generating schema:", schemaError);
      }
      
      setIsEditingAbout(false);
    } catch (error) {
      console.error("Error saving about user:", error);
      alert("An error occurred while saving.");
    } finally {
      setIsSavingAbout(false);
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
        alert("Avatar uploaded successfully!");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to upload avatar. Please try again.");
    } finally {
      setIsUploadingAvatar(false);
    }
  };


  const handleDeleteResume = async (index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigating to resume view
    
    if (window.confirm("Are you sure you want to delete this resume?")) {
      try {
        const updatedUser = await userApi.deleteResume(index);
        if (updatedUser) {
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
          alert("Resume deleted successfully!");
        }
      } catch (error) {
        console.error("Error deleting resume:", error);
        alert("Failed to delete resume. Please try again.");
      }
    }
  };


  const viewResume=(resumeId:string)=>{
    navigate(`/viewresume/${resumeId}`);
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center relative">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen w-full text-foreground selection:bg-primary/20 p-4 md:p-8 animate-in fade-in max-w-[1600px] mx-auto relative z-10">
      
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
        
        <button 
          onClick={handleLogout}
          className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 border border-border text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-300 shadow-sm"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-semibold">System Exit</span>
        </button>
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
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-muted-foreground uppercase">Resumes</div>
            <div className="text-xl font-bold">{user.resumes.length} Doc{user.resumes.length !== 1 && 's'}</div>
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
              
              <h2 className="text-xl font-bold leading-none mb-1">{user.fullName}</h2>
              <p className="text-sm text-muted-foreground mb-6 truncate">{user.email}</p>
              
              <div className="space-y-3 mb-6">
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
                   {user.aboutUser ? (
                     <span className="line-clamp-6">{user.aboutUser}</span>
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
                <div className="bg-green-500/10 p-2 text-center rounded-xl border border-green-500/20">
                  <div className="text-lg font-black text-green-600 dark:text-green-400">{codingSchema?.easy || 0}</div>
                  <div className="text-[9px] font-bold text-green-600/70 uppercase">Easy</div>
                </div>
                <div className="bg-yellow-500/10 p-2 text-center rounded-xl border border-yellow-500/20">
                  <div className="text-lg font-black text-yellow-600 dark:text-yellow-400">{codingSchema?.medium || 0}</div>
                  <div className="text-[9px] font-bold text-yellow-600/70 uppercase">Med</div>
                </div>
                <div className="bg-red-500/10 p-2 text-center rounded-xl border border-red-500/20">
                  <div className="text-lg font-black text-red-600 dark:text-red-400">{codingSchema?.hard || 0}</div>
                  <div className="text-[9px] font-bold text-red-600/70 uppercase">Hard</div>
                </div>
            </div>
            
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Recently Active</h4>
            {codingSchema?.recently_solved && codingSchema.recently_solved.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {codingSchema.recently_solved.slice(0, 4).map((slug, idx) => (
                  <Link 
                    key={idx}
                    to={`/solve/${slug}`}
                    className="px-2.5 py-1 rounded-md bg-secondary border border-border text-[10px] font-semibold hover:border-primary/50 transition-colors truncate max-w-[100px]"
                  >
                    {slug.replace(/-/g, ' ')}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic bg-secondary/30 p-2 rounded-lg text-center">No questions solved.</div>
            )}
          </div>
        </div>

        {/* Right Column: Carousel & Stack */}
        <div className="xl:col-span-3 space-y-8">
          
          {/* Interview Carousel (Horizontal Scrolling Row) */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Upcoming Interviews
            </h2>
            
            {appliedInterviews.length > 0 ? (
              <div className="flex overflow-x-auto gap-5 pb-4 snap-x scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                {appliedInterviews.map((interview, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      if (interview.status === 'live') navigate(`/interview/${interview._id}`);
                      else if (interview.status === 'done') navigate(`/performance/${interview._id}`);
                      else alert(`Scheduled for ${formatDate(interview.time)}.`);
                    }}
                    className="min-w-[320px] sm:min-w-[360px] snap-center cursor-pointer group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Gradient header band */}
                    <div className="h-24 relative overflow-hidden flex-shrink-0 gradient-bg"
                    >
                      <div className="absolute inset-0 opacity-30 bg-white/10" />
                      {/* Status badge top-right */}
                      <div className="absolute top-3 right-3">
                        <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest backdrop-blur-sm ${
                          interview.status === 'live'
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/40 animate-pulse'
                            : interview.status === 'done'
                            ? 'bg-white/20 text-white border border-white/30'
                            : 'bg-secondary text-secondary-foreground'
                        }`}>
                          {interview.status === 'live' ? '● Live' : interview.status === 'done' ? '✓ Done' : '⏰ Scheduled'}
                        </span>
                      </div>
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
                        <h3 className="text-lg font-bold leading-snug group-hover:gradient-text transition-all">
                          {interview.job_Role}
                        </h3>
                        <p className="text-sm text-muted-foreground font-semibold mt-0.5">
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
              <div className="bg-secondary/20 border border-dashed border-border rounded-3xl p-8 text-center text-muted-foreground">
                No active interviews. Apply for jobs to start practicing.
              </div>
            )}
          </div>

          {/* Vertical Resume Stack */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Resume Stack
              </h2>
              <Link to="/templates" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-md hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" /> New Document
              </Link>
            </div>

            {user.resumes.length > 0 ? (
              <div className="flex flex-col gap-3">
                {user.resumes.map((resume, index) => (
                  <div 
                    key={index} 
                    onClick={()=>viewResume(resume)} 
                    className="bg-card border border-border hover:border-primary/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 cursor-pointer group transition-all"
                  >
                    {/* Tiny visual preview replacing the huge iframe block on dashboard */}
                    <div className="w-16 h-20 bg-secondary rounded-lg overflow-hidden border border-border relative flex-shrink-0 group-hover:border-primary/50 transition-colors hidden sm:block">
                       <ResumePreview resumeId={resume.id || resume} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold truncate group-hover:text-primary transition-colors">Software Engineer Details</h3>
                        <span className="px-2 py-0.5 rounded-full bg-secondary text-[10px] font-bold uppercase text-muted-foreground">V{index + 1}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-2">
                         <Clock className="w-3 h-3" /> Modified {formatDate(user.updatedAt)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-4 sm:mt-0 w-full sm:w-auto justify-end sm:justify-start">
                      <button className="px-3 py-1.5 rounded-lg bg-secondary text-foreground text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-1">
                         View
                      </button>
                      <button
                        onClick={(e) => handleDeleteResume(index, e)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Delete Request"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-secondary/20 border border-dashed border-border rounded-3xl p-10 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold mb-2">No Active Resumes</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">Build a powerful, ATS-friendly resume to start applying for interviews.</p>
                <Link to="/templates" className="btn-primary py-2 px-6 rounded-xl text-sm">Deploy Template</Link>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};
