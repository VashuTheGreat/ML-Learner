import axios from 'axios';

const PYTHON_BASE_URL = 'http://localhost:8000';

const pythonApiInstance = axios.create({
    baseURL: PYTHON_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

class PythonApi {
    // ── User ──────────────────────────────────────────────────────────────
    /** Generate an interview-ready schema from plain-text user details */
    async createSchema(userDetails: string) {
        const response = await pythonApiInstance.post('/api/user/generate_schema', {
            userDetails,
        });
        return response.data;
    }

    /** Upload a resume PDF and get back a parsed "about user" text blob */
    async uploadResume(file: File) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await pythonApiInstance.post('/api/user/aboutUserByResume', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }

    // ── Interview ─────────────────────────────────────────────────────────
    /** Generate N interview schemas for given fields / companies */
    async generateInterviewSchemas(
        noOfInterviews: number = 3,
        fields: string[] = ['AI/ML', 'Backend', 'Data Science'],
        companiesName: string[] = ['Google', 'Amazon', 'Microsoft'],
        updated: boolean = false,
    ) {
        const params = new URLSearchParams();
        params.append('no_of_interviews', noOfInterviews.toString());
        params.append('updated', updated.toString());
        fields.forEach((f) => params.append('fields', f));
        companiesName.forEach((c) => params.append('companiesName', c));

        const response = await pythonApiInstance.post(
            `/api/interview/generate_interview_schemas?${params.toString()}`,
        );
        return response.data;
    }

    /** Send a single chat turn to the AI interviewer */
    async chatInterviewer(
        threadId: string,
        timeRemain: number,
        topic: string,
        userInput: string,
    ) {
        const response = await pythonApiInstance.post('/api/interview/chat_interviewer', null, {
            params: {
                thread_id: threadId,
                time_remain: timeRemain,
                topic,
                user_input: userInput,
            },
        });
        return response.data;
    }

    // ── Performance ───────────────────────────────────────────────────────
    /** Fetch AI-evaluated performance report for a given thread */
    async getPerformance(threadId: string) {
        const response = await pythonApiInstance.get(`/api/performance/performance/${threadId}`);
        return response.data;
    }

    // ── Thread ────────────────────────────────────────────────────────────
    /** Delete a thread conversation from the SQLite checkpointer */
    async deleteThread(threadId: string) {
        const response = await pythonApiInstance.delete(`/api/thread/${threadId}`);
        return response.data;
    }

    // ── Health ────────────────────────────────────────────────────────────
    async health() {
        const response = await pythonApiInstance.get('/api/health/health');
        return response.data;
    }
}

export default new PythonApi();
