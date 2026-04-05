import React, { useState, useEffect } from "react";
import templateApi from "@/Services/templateApi";

export const ResumePreview = ({ resumeId }: { resumeId: string }) => {
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
