import api from './api';

class InterviewApi {
    async scheduleInterview(data: {
        companyName: string;
        topic: string;
        job_Role: string;
        time: string;
        status: string;
    }) {
        const id = crypto.randomUUID();
        const payload = {
            ...data,
            _id: id,
            id: id // Include both id styles for compatibility
        };
        // Store in localStorage for retrieval during the interview setup
        localStorage.setItem(`pending_interview_${id}`, JSON.stringify(payload));
        return payload;
    }

    async updateInterviewStatus(data: { id: string; status: string }) {
        const localKey = `pending_interview_${data.id}`;
        const localData = localStorage.getItem(localKey);
        if (localData) {
            const payload = JSON.parse(localData);
            payload.status = data.status;
            localStorage.setItem(localKey, JSON.stringify(payload));
        }
        return { success: true };
    }

    async getUserAppliedInterviews() {
        try {
            const response = await api.get('/interview/interviews');
            return response.data.data || [];
        } catch (err) {
            console.error("Failed to fetch user interviews from backend:", err);
            return [];
        }
    }

    async getInterviewById(id: string) {
        // First check local storage for pending/scheduled sessions
        const localData = localStorage.getItem(`pending_interview_${id}`);
        if (localData) {
            return JSON.parse(localData);
        }
        
        // Database interview IDs are auto-incrementing integers.
        // If the ID is a string/UUID, do not call the backend route.
        if (!/^\d+$/.test(id)) {
            return null;
        }

        try {
            const response = await api.get(`/interview/interviews/${id}`);
            return response.data.data;
        } catch (err) {
            console.error(`Failed to fetch interview ${id} from backend:`, err);
            return null;
        }
    }

    async deleteInterview(id: string) {
        localStorage.removeItem(`pending_interview_${id}`);
        return { success: true };
    }

    async getInterviewOptions() {
        try {
            const response = await api.get('/interview_options');
            return response.data.data;
        } catch (err) {
            console.error("Failed to fetch interview options:", err);
            return null;
        }
    }
}

export default new InterviewApi();
