import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import pythonApi from '@/Services/pythonApi'
import templateApi from '@/Services/templateApi'
import userApi from '@/Services/userApi'

interface Template {
    _id: string,
    title: string,
    to_render: string
}

export const CreateResume = () => {
    const navigate = useNavigate()
    const { slug } = useParams()
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
        alert("Resume saved");
    }

    useEffect(() => {
        const init = async () => {
            try {
                const userStr = localStorage.getItem("user");
                if (!userStr) {
                    alert("user not found");
                    return;
                }
                let userData = JSON.parse(userStr);
                
                const aboutUser = userData.aboutUser;
                if (!aboutUser) {
                    alert("please fill aboutUser in Dashboard");
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-xl font-semibold text-gray-600">Loading...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Create Resume: {template?.title || slug}</h1>
                    <button 
                        onClick={() => saveResume(template?._id || "")}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
                    >
                        Save Resume
                    </button>
                </div>

                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 overflow-auto">
                    {resume && resume.to_render ? (
                        <div 
                            className="resume-preview"
                            dangerouslySetInnerHTML={{ __html: resume.to_render }} 
                        />
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            Generating preview...
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
