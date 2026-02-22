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
  FlaskConical
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import userApi from "@/Services/userApi";
import templateApi from "@/Services/templateApi";
import pythonApi from "@/Services/pythonApi";
import interviewApi from "@/Services/interviewApi";

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, <span className="gradient-text">{user.fullName}</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your resumes and track your interview progress.
            </p>
          </div>
          
          <button 
            onClick={handleLogout}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-xl border border-destructive/20 text-destructive hover:bg-destructive/10 transition-all duration-300"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: User Profile & Stats */}
          <div className="space-y-8">
            {/* Profile Card */}
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
              <button 
                onClick={handleUpdateUser}
                className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/5 border border-border/50 text-[10px] uppercase tracking-wider font-bold text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-300 group/edit z-20"
              >
                <Settings className="w-3.5 h-3.5 group-hover/edit:rotate-90 transition-transform duration-500" />
                <span>Edit Profile</span>
              </button>
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-primary/20"></div>
              
              <div className="relative z-10">
                <div className="relative w-20 h-20 mb-6 group/avatar">
                  <div className="w-20 h-20 rounded-2xl gradient-bg flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-primary/20 overflow-hidden">
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
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  
                  <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-xl shadow-lg border border-border flex items-center justify-center cursor-pointer hover:bg-secondary/10 transition-colors group-hover/avatar:scale-110 duration-300">
                    <Camera className="w-4 h-4 text-primary" />
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleUploadAvatar}
                      disabled={isUploadingAvatar}
                    />
                  </label>
                </div>
                
                <h2 className="text-2xl font-bold mb-1">{user.fullName}</h2>
                <p className="text-muted-foreground mb-6">{user.email}</p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground p-3 rounded-xl bg-secondary/5 border border-border/50">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>Joined {formatDate(user.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground p-3 rounded-xl bg-secondary/5 border border-border/50">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>Last updated {formatDate(user.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-5 rounded-2xl border-l-4 border-l-primary">
                <div className="text-muted-foreground text-sm font-medium mb-1">Total Resumes</div>
                <div className="text-3xl font-bold">{user.resumes.length}</div>
              </div>
              <div className="glass-card p-5 rounded-2xl border-l-4 border-l-secondary">
                <div className="text-muted-foreground text-sm font-medium mb-1">Account Status</div>
                <div className="text-lg font-bold text-green-500 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  Active
                </div>
              </div>
            </div>

            {/* ML Playground Card */}
            <Link to="/playground" className="glass-card p-6 rounded-2xl flex items-center gap-4 group cursor-pointer border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-primary/20 transition-all duration-500"></div>
               <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 relative z-10">
                 <FlaskConical className="w-8 h-8 text-primary" />
               </div>
               <div className="relative z-10">
                 <h3 className="font-bold text-lg group-hover:text-primary transition-colors">ML Playground</h3>
                 <p className="text-xs text-muted-foreground">Experiment with AI models in our interactive lab.</p>
               </div>
               <ChevronRight className="w-5 h-5 ml-auto text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>

            {/* About User Section */}
            <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-primary" />
                    About You
                  </h3>
                  <div className="flex items-center gap-2">
                    <label className="p-2 hover:bg-secondary/10 rounded-lg transition-colors text-muted-foreground hover:text-primary cursor-pointer" title="Upload Resume (PDF)">
                      {isExtractingResume ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                      ) : (
                        <Upload className="w-4 h-4" />
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
                        className="p-2 hover:bg-secondary/10 rounded-lg transition-colors text-muted-foreground hover:text-primary"
                        title="Edit Manually"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
               
               {isEditingAbout ? (
                 <div className="space-y-3">
                   <textarea
                     value={aboutInput}
                     onChange={(e) => setAboutInput(e.target.value)}
                     className="w-full min-h-[100px] p-3 rounded-xl bg-secondary/5 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none text-sm"
                     placeholder="Tell us about your professional background..."
                   />
                   <div className="flex justify-end gap-2">
                     <button 
                       onClick={() => setIsEditingAbout(false)}
                       disabled={isSavingAbout}
                       className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       Cancel
                     </button>
                     <button 
                       onClick={handleSaveAbout}
                       disabled={isSavingAbout}
                       className="px-3 py-1.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       {isSavingAbout ? (
                         <>
                           <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                           <span>Saving...</span>
                         </>
                       ) : (
                         <>
                           <Save className="w-3 h-3" />
                           <span>Save</span>
                         </>
                       )}
                     </button>
                   </div>
                 </div>
               ) : (
                 <div className="text-sm text-muted-foreground leading-relaxed">
                   {user.aboutUser ? (
                     user.aboutUser
                   ) : (
                     <p className="italic opacity-70">
                       No information added yet. Click edit or upload a resume to add your professional summary.
                     </p>
                   )}
                 </div>
               )}
            </div>

          </div>

          {/* Right Column: Resumes & Actions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Applied Interviews Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Calendar className="w-6 h-6 text-primary" />
                Applied Interviews
              </h2>
              
              {appliedInterviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {appliedInterviews.map((interview, index) => (
                    <div 
                      key={index} 
                      onClick={() => {
                        if (interview.status === 'live') {
                          navigate(`/interview/${interview._id}`);
                        } else if (interview.status === 'done') {
                          navigate(`/performance/${interview._id}`);
                        } else {
                          alert(`Please come on ${formatDate(interview.time)} for this interview.`);
                        }
                      }}
                      className="glass-card p-6 rounded-2xl card-hover group cursor-pointer relative overflow-hidden border border-border/50"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 group-hover:border-primary/50 transition-colors">
                          <Clock className="w-6 h-6 text-primary" />
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          interview.status === 'live' ? 'bg-green-500/10 text-green-500 animate-pulse' : 
                          interview.status === 'done' ? 'bg-gray-500/10 text-gray-500' : 
                          'bg-yellow-500/10 text-yellow-600'
                        }`}>
                          {interview.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">{interview.job_Role}</h3>
                      <p className="text-muted-foreground font-medium mb-4">{interview.companyName}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary/60" />
                        <span>{formatDate(interview.time)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-3xl p-8 text-center border-dashed border-2 border-border">
                  <p className="text-muted-foreground">No interviews scheduled yet.</p>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                My Resumes
              </h2>
              <Link 
                to="/templates" 
                className="btn-primary flex items-center gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40"
              >
                <Plus className="w-5 h-5" />
                Create New
              </Link>
            </div>

            {/* Resumes Grid */}
            {user.resumes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user.resumes.map((resume, index) => (
                  <div onClick={()=>viewResume(resume)} key={index} className="glass-card p-6 rounded-2xl card-hover group cursor-pointer relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-background border border-border group-hover:border-primary/50 transition-colors">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                            PDF
                          </span>
                          <button
                            onClick={(e) => handleDeleteResume(index, e)}
                            className="p-1.5 rounded-lg bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-destructive hover:text-white"
                            title="Delete Resume"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="mb-4">
                        <ResumePreview resumeId={resume.id || resume} />
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">Resume {index + 1}</h3>
                      <p className="text-sm text-muted-foreground mb-4">Created on {formatDate(user.updatedAt)}</p>
                      
                      <div className="flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        View Details <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="glass-card rounded-3xl p-12 text-center border-dashed border-2 border-border hover:border-primary/50 transition-colors group">
                <div className="w-20 h-20 mx-auto rounded-full bg-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-10 h-10 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">No resumes yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                  Create your first professional resume today. Choose from our premium templates and get started in minutes.
                </p>
                <Link to="/templates" className="btn-primary inline-flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Create Your First Resume
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
