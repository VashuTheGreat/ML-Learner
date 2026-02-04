import api from './api';

class InterviewApi {
    async scheduleInterview(data: {
        companyName: string;
        topic: string;
        job_Role: string;
        time: string;
        status: string;
    }) {
        const response = await api.post('/interview/sheduleInterview', data);
        return response.data.data;
    }

    async updateInterviewStatus(data: { id: string; status: string }) {
        const response = await api.put('/interview/updateInterviewStatus', data);
        return response.data.data;
    }

    async getUserAppliedInterviews() {
        const response = await api.get('/interview/fetch_interviews');
        return response.data.data;
    }
    async getInterviewById(id: string) {
        const response = await api.get(`/interview/getInterviewById`, { params: { id } });
        return response.data.data;
    }
}

export default new InterviewApi();
