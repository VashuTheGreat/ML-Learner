import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import pythonApi from '@/services/pythonApi'
import templateApi from '@/services/templateApi'
import userApi from '@/services/userApi'
import { useToast } from "@/components/ui/use-toast"

interface Template {
    _id: string,
    title: string,
    to_render: string
}

export const CreateResume = () => {
    const navigate = useNavigate()
    const { slug } = useParams()
    const { toast } = useToast()
    const [template, setTemplate] = useState<Template | null>(null);
    const [user, setUser] = useState<any>(null);
    const [resume, setResume] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const saveResume = async (resume_id: string) => {
        console.log("Save resume clicked");
        // Temporary logic
        const updatedUser = await userApi.addResume(resume_id);
        console.log(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        toast({ title: "Success", description: "Resume saved" });
    }

    useEffect(() => {
        const init = async () => {
            try {
                const userStr = localStorage.getItem("user");
                if (!userStr) {
                    toast({ title: "Error", description: "User not found", variant: "destructive" });
                    return;
                }
                let userData = JSON.parse(userStr);
                
                const aboutUser = userData.aboutUser;
                if (!aboutUser) {
                    toast({ title: "Profile Incomplete", description: "Please fill aboutUser in Dashboard", variant: "destructive" });
                    navigate("/dashboard");
                    return;
                }

                let temp_data = userData.temp_data || null;
                if (typeof temp_data === 'string') {
                    try {
                        temp_data = JSON.parse(temp_data);
                    } catch (e) {
                        console.error("Failed to parse temp_data", e);
                    }
                }

                if (!temp_data) {
                    const resume_data_schema = await pythonApi.createSchema(aboutUser);
                    console.log(resume_data_schema);
                    
                    if (resume_data_schema) {
                        await userApi.updateUserJson(resume_data_schema);
                        // Update local user data after server update
                        const updatedUser = await userApi.getUser();
                        localStorage.setItem("user", JSON.stringify(updatedUser));
                        userData = updatedUser;
                        temp_data = resume_data_schema; // Use the new schema
                    } else {
                         console.log("resume_data_schema not found");
                    }
                }
                
                setUser(userData);

                // Fetch Template
                if (slug) {
                     const templateResponse = await templateApi.getTemplate(slug);
                     setTemplate(templateResponse);
                     
                 // Generate Resume
                 if (temp_data) {
                     // Check if temp_data has userDetails, otherwise use temp_data itself
                     let dataToSend = temp_data.userDetails ? temp_data.userDetails : temp_data;
                     
                     // Ensure dataToSend is an object before adding avatar
                     if (typeof dataToSend === 'string') {
                         try {
                             dataToSend = JSON.parse(dataToSend);
                         } catch (e) {
                             dataToSend = {};
                         }
                     }

                     // Add avatar from user profile
                     const userProfile = JSON.parse(localStorage.getItem("user") || "{}");
                     if (userProfile.avatar) {
                        dataToSend.avatar = userProfile.avatar;
                     }
                     
                     const resumeResponse = await templateApi.getTemplateByData(slug, dataToSend);
                     setResume(resumeResponse);
                 }
                }

            } catch (error) {
                console.error("Error in initialization:", error);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [slug, navigate]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                <p className="text-muted-foreground animate-pulse">Generating your resume...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen p-8 pt-24">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">Create Resume</h1>
                        <p className="text-muted-foreground">{template?.title || 'Custom Template'}</p>
                    </div>
                    <button 
                        onClick={() => saveResume(template?._id || "")}
                        className="btn-primary flex items-center gap-2 px-8 py-3 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all font-bold"
                    >
                        Save Resume
                    </button>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-2xl overflow-auto border border-border/50 max-w-[850px] mx-auto min-h-[1100px]">
                    {resume && resume.to_render ? (
                        <div 
                            className="resume-preview w-full h-full"
                            dangerouslySetInnerHTML={{ __html: resume.to_render }} 
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-50">
                            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                            <p className="text-lg font-medium">Preparing preview...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
