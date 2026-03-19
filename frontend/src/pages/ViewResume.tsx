import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, redirect } from 'react-router-dom';
import { Download, ArrowLeft, Code, Table, X } from 'lucide-react';
import templateApi from '@/services/templateApi';
import userApi from '@/services/userApi';
import html2pdf from 'html2pdf.js';
import { useToast } from "@/components/ui/use-toast";

export const View_resume = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [resumeHtml, setResumeHtml] = useState<string>('');
    const [tempData, setTempData] = useState<any>(null);
    const [editMode, setEditMode] = useState<'json' | 'form'>('json');
    const [jsonText, setJsonText] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [isUpdatingPreview, setIsUpdatingPreview] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    const ensureAbsoluteUrl = (url: string) => {
        if (!url) return url;
        // Check if it already has a protocol
        if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) {
            return url;
        }
        // If it starts with //, add https:
        if (url.startsWith('//')) {
            return `https:${url}`;
        }
        // Otherwise add https://
        return `https://${url}`;
    };

    const sanitizeData = (data: any): any => {
        if (!data || typeof data !== 'object') return data;

        const newData = Array.isArray(data) ? [...data] : { ...data };

        for (const key in newData) {
            const value = newData[key];
            if (key === 'someImportantUrls' && typeof value === 'object') {
                const sanitizedUrls: any = {};
                for (const urlKey in value) {
                    sanitizedUrls[urlKey] = ensureAbsoluteUrl(value[urlKey]);
                }
                newData[key] = sanitizedUrls;
            } else if (typeof value === 'object') {
                newData[key] = sanitizeData(value);
            }
        }
        return newData;
    };

    useEffect(() => {
        const fetchResume = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) {
                    toast({ title: "Error", description: "User not found", variant: "destructive" });
                    navigate('/login');
                    return;
                }

                const user = JSON.parse(userStr);
                let userData = user.temp_data;

                if (!userData) {
                    toast({ title: "Warning", description: "No resume data found" });
                    navigate('/dashboard');
                    return;
                }

                // Parse if temp_data is stored as string
                if (typeof userData === 'string') {
                    try {
                        userData = JSON.parse(userData);
                    } catch (e) {
                        console.error('Failed to parse temp_data:', e);
                    }
                }

                setTempData(userData);
                setJsonText(JSON.stringify(userData, null, 2));

                // Generate resume HTML
                const dataToSend = userData.userDetails ? userData.userDetails : userData;
                const resume = await templateApi.getTemplateByData(slug!, dataToSend);
                console.log(resume)

                if (resume && resume.to_render) {
                    setResumeHtml(resume.to_render);
                } else {
                    toast({ title: "Error", description: "Failed to load resume", variant: "destructive" });
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('Error fetching resume:', error);
                toast({ title: "Error", description: "Failed to load resume", variant: "destructive" });
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchResume();
        }
    }, [slug, navigate]);

    // Live preview update when tempData changes
    useEffect(() => {
        if (!tempData || !slug) return;

        const updatePreview = async () => {
            setIsUpdatingPreview(true);
            try {
                const sanitizedData = sanitizeData(tempData.userDetails ? tempData.userDetails : tempData);
                const resume = await templateApi.getTemplateByData(slug, sanitizedData);
                
                if (resume && resume.to_render) {
                    setResumeHtml(resume.to_render);
                }
            } catch (error) {
                console.error('Error updating preview:', error);
            } finally {
                setIsUpdatingPreview(false);
            }
        };

        // Debounce the preview update
        const timeoutId = setTimeout(updatePreview, 500);
        return () => clearTimeout(timeoutId);
    }, [tempData, slug]);

    const handleSave = async (updatedData: any) => {
        // Temporary function - user will add logic here
        console.log('Save called with data:', updatedData);
        const sanitizedData = sanitizeData(updatedData);
        await userApi.updateUserJson(sanitizedData);
        const updatedUser = await userApi.getUser();
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast({ title: "Success", description: "Resume saved successfully!" });
        navigate('/dashboard');
        
        // TODO: User will implement save logic
        // Example: await userApi.updateUserJson(updatedData);
        // Then regenerate resume HTML
    };

    const handleSaveJson = () => {
        try {
            const parsedData = JSON.parse(jsonText);
            handleSave(parsedData);
        } catch (error) {
            toast({ title: "Error", description: "Invalid JSON! Please check your syntax.", variant: "destructive" });
        }
    };

    const handleDownloadPDF = () => {
        const iframe = document.getElementById('resume-iframe') as HTMLIFrameElement;
        const element = iframe?.contentWindow?.document.body;
        
        if (!element) {
            toast({ title: "Error", description: "Resume content not found", variant: "destructive" });
            return;
        }

        const opt = {
            margin: 0,
            filename: 'resume.pdf',
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'in' as const, format: 'a4' as const, orientation: 'portrait' as const }
        };

        html2pdf().set(opt).from(element).save();
    };

    const renderFormView = () => {
        const data = tempData?.userDetails || tempData;
        if (!data) return <div className="text-muted-foreground">No data available</div>;

        return (
            <div className="space-y-4">
                {Object.entries(data).map(([key, value]) => (
                    <div key={key} className="border-b border-border pb-4">
                        <label className="block text-sm font-semibold text-foreground/80 mb-2 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        {typeof value === 'object' ? (
                            <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40 text-muted-foreground">
                                {JSON.stringify(value, null, 2)}
                            </pre>
                        ) : (
                            <input
                                type="text"
                                value={String(value)}
                                onChange={(e) => {
                                    const newData = { ...tempData };
                                    if (tempData.userDetails) {
                                        newData.userDetails[key] = e.target.value;
                                    } else {
                                        newData[key] = e.target.value;
                                    }
                                    setTempData(newData);
                                    setJsonText(JSON.stringify(newData, null, 2));
                                }}
                                className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                        )}
                    </div>
                ))}
                <button
                    onClick={() => handleSave(tempData)}
                    className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors font-semibold"
                >
                    Save Changes
                </button>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <div className="bg-card shadow-sm border-b border-border print:hidden">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back to Dashboard</span>
                        </button>

                        <div className="flex gap-3">
                            {!isEditing ? (
                                <>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
                                    >
                                        <Code className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={handleDownloadPDF}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download PDF
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    Close Editor
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {isEditing ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: Editor */}
                        <div className="bg-card rounded-2xl border border-border shadow-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">Edit Resume Data</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setEditMode('json')}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider ${
                                            editMode === 'json'
                                                ? 'bg-primary text-primary-foreground shadow-md'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                        }`}
                                    >
                                        <Code className="w-4 h-4" />
                                        JSON
                                    </button>
                                    <button
                                        onClick={() => setEditMode('form')}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider ${
                                            editMode === 'form'
                                                ? 'bg-primary text-primary-foreground shadow-md'
                                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                        }`}
                                    >
                                        <Table className="w-4 h-4" />
                                        Form
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                                {editMode === 'json' ? (
                                    <div className="space-y-4">
                                        <textarea
                                            value={jsonText}
                                            onChange={(e) => {
                                                setJsonText(e.target.value);
                                                // Try to parse and update tempData for live preview
                                                try {
                                                    const parsed = JSON.parse(e.target.value);
                                                    setTempData(parsed);
                                                } catch (err) {
                                                    // Invalid JSON, don't update tempData yet
                                                }
                                            }}
                                            className="w-full h-[500px] p-4 border border-input bg-background text-foreground rounded-xl font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                            spellCheck={false}
                                        />
                                        <button
                                            onClick={handleSaveJson}
                                            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors font-semibold"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                ) : (
                                    renderFormView()
                                )}
                            </div>
                        </div>

                        {/* Right: Preview */}
                        <div className="bg-card rounded-2xl border border-border shadow-lg p-6 sticky top-8">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold">Preview</h2>
                                {isUpdatingPreview && (
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                                        Updating...
                                    </span>
                                )}
                            </div>
                            <div 
                                className="border border-border rounded-xl overflow-auto bg-white" 
                                style={{ height: 'calc(100vh - 250px)' }}
                            >
                                <iframe
                                    srcDoc={resumeHtml}
                                    title="Resume Preview"
                                    className="w-full h-full border-none"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-border">
                            <iframe
                                id="resume-iframe"
                                srcDoc={resumeHtml}
                                title="Resume View"
                                className="w-full border-none"
                                style={{ minHeight: '1100px' }}
                                onLoad={(e) => {
                                    const iframe = e.target as HTMLIFrameElement;
                                    if (iframe.contentWindow) {
                                        // Try to adjust height to content
                                        const height = iframe.contentWindow.document.body.scrollHeight;
                                        iframe.style.height = (height + 50) + 'px';
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};
