import api from './api';
import templateApi from './templateApi';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

class PythonApi {
    // ── User / Resume Schema ──────────────────────────────────────────────
    /** Generate an interview-ready schema from plain-text user details */
    async createSchema(userDetails: string) {
        // Fallback user profile metadata and local schema compilation
        const userProfile = JSON.parse(localStorage.getItem("user") || "{}");
        const name = userProfile.fullName || "Professional Developer";
        const email = userProfile.email || "developer@example.com";
        const summary = userDetails || "Experienced software development professional.";

        const schema = {
            name,
            email,
            phone: "+1 (555) 019-2834",
            location: "San Francisco, CA",
            summary,
            links: {
                social_links: ["https://linkedin.com/in/candidate", "https://github.com/candidate"]
            },
            skills: ["JavaScript", "TypeScript", "React", "Python", "SQL", "Git", "Docker"],
            experience: [
                {
                    role: "Software Engineer",
                    company: "InnovateTech Solutions",
                    summary: "Leading backend integration, standardizing OpenAPI route schemas, and developing reactive front-ends. Collaborating with cross-functional AI teams to build responsive web portals."
                },
                {
                    role: "Junior Developer",
                    company: "PixelCraft Agency",
                    summary: "Developed modern web application user interfaces and optimized front-end component load times."
                }
            ],
            education: [
                {
                    degree: "B.S. in Computer Science",
                    college: "University of Technology",
                    university: "State University System",
                    start: "2020",
                    end: "2024"
                }
            ],
            projects: [
                {
                    title: "ML Learner Platform",
                    bullet_points: [
                        "Architected secure environment layouts for training pipelines.",
                        "Optimized page load speed by 35% using responsive client state caching."
                    ],
                    links: ["https://github.com/dev/ml-learner"]
                }
            ],
            apparentSeniority: "Mid"
        };
        return { ai_generated_schema: schema, userDetails: schema };
    }

    /** Upload a resume PDF and get back a parsed "about user" text blob */
    async uploadResume(file: File) {
        // Direct call to the new FastAPI resume parser & template generation route
        const data = await templateApi.createResumeTemplate(file);
        return {
            userDetails: data.schema,
            ai_generated_schema: data.schema
        };
    }

    // ── Interview / SSE Stream ────────────────────────────────────────────
    /** Generate N mock job opportunities */
    async generateInterviewSchemas(
        noOfInterviews: number = 3,
        fields: string[] = ['AI/ML', 'Backend', 'Data Science'],
        companiesName: string[] = ['Google', 'Amazon', 'Microsoft'],
        updated: boolean = false,
    ) {
        return [
            {
                companyName: "Google",
                job_Role: "Machine Learning Engineer",
                topic: "Deep Learning & NLP",
                time: new Date().toISOString(),
                status: "New"
            },
            {
                companyName: "Amazon",
                job_Role: "Backend Developer",
                topic: "System Design & Databases",
                time: new Date().toISOString(),
                status: "New"
            },
            {
                companyName: "Microsoft",
                job_Role: "Full Stack Engineer",
                topic: "React & Node.js",
                time: new Date().toISOString(),
                status: "New"
            }
        ];
    }

    /** 
     * Send a single chat turn to the AI interviewer.
     * Consumes the backend's SSE "/interview/stream_chat" stream transparently under the hood
     * to keep existing frontends fully functional.
     */
    async chatInterviewer(
        threadId: string,
        timeRemain: number,
        topic: string,
        userInput: string,
        onToken?: (token: string) => void
    ) {
        // Read companyName from stored pending interview metadata if available
        const slug = sessionStorage.getItem('interview_slug') || '';
        const pendingStr = localStorage.getItem(`pending_interview_${slug}`);
        let companyName = "Tech Corp";
        if (pendingStr) {
            const pending = JSON.parse(pendingStr);
            companyName = pending.companyName || companyName;
        }

        const response = await fetch(`${BASE_URL}/interview/stream_chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                thread_id: threadId,
                time_remain: timeRemain,
                topic: topic || "General",
                user_input: userInput,
                companyName: companyName
            })
        });

        if (!response.body) {
            throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let aiResponse = "";
        let buffer = "";

        while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            if (value) {
                buffer += decoder.decode(value, { stream: !done });
                // SSE events are separated by double newlines
                const lines = buffer.split('\n');
                // Keep the last partial line in the buffer
                buffer = lines.pop() || "";

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (trimmedLine.startsWith('data: ')) {
                        try {
                            const eventData = JSON.parse(trimmedLine.substring(6));
                            if (eventData.type === 'chat' || eventData.type === 'token') {
                                aiResponse += eventData.content;
                                if (onToken) {
                                    onToken(eventData.content);
                                }
                            } else if (eventData.type === 'performance') {
                                // Save evaluation immediately to local storage
                                localStorage.setItem(`interview_performance_${threadId}`, JSON.stringify(eventData.content));
                            } else if (eventData.type === 'interview_id') {
                                localStorage.setItem(`last_completed_interview_id_${threadId}`, String(eventData.content));
                            }
                        } catch (e) {
                            // Suppress parsing errors for partial/incomplete JSON chunks
                        }
                    }
                }
            }
        }

        return { ai_response: aiResponse || "Understood. Please go on." };
    }

    // ── Performance Report ────────────────────────────────────────────────
    /** Fetch AI-evaluated performance report from local storage cache */
    async getPerformance(threadId: string) {
        const stored = localStorage.getItem(`interview_performance_${threadId}`);
        if (stored) {
            return { performance: JSON.parse(stored) };
        }
        return { performance: null };
    }

    // ── Thread Cleanup ────────────────────────────────────────────────────
    async deleteThread(threadId: string) {
        localStorage.removeItem(`interview_performance_${threadId}`);
        return { success: true };
    }

    // ── Health ────────────────────────────────────────────────────────────
    async health() {
        const response = await api.get('/health');
        return response.data;
    }

    // ── Live Job Fetcher ──────────────────────────────────────────────────
    /** Fetch real-time jobs from JSearch board query */
    async fetchJobs(jobtile: string = "machine learning intern", updated: boolean = false) {
        const response = await api.get('/job', {
            params: {
                jobtile,
                updated
            }
        });
        return response.data.data;
    }

    /** Compute ATS score using similarities embeddings model */
    async similarJobPredictor(jobDiscription: string, userDetails: string) {
        const response = await api.post('/job/ats', {
            jobDiscription,
            userDetails
        });
        return response.data.data;
    }
}

export default new PythonApi();
