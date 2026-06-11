import api from './api';

interface SkillFeedback {
    score: number;
    feedback: string;
}

interface PerformanceData {
    interview_id: string;
    overallScore: number;
    verdict: string;
    summaryFeedback: string;
    skills: {
        technical: SkillFeedback;
        dsa: SkillFeedback;
        problemSolving: SkillFeedback;
        communication: SkillFeedback;
        systemDesign: SkillFeedback;
        projects: SkillFeedback;
        behaviour: SkillFeedback;
    };
    strengths: string[];
    weaknesses: string[];
    practiceRecommendations: string[];
    studyRecommendations: string[];
    lowPriorityOrAvoid: string[];
    confidenceLevel?: number;
}

class PerformanceApi {
    async createPerformance(data: PerformanceData) {
        const response = await api.post('/performance/create', data);
        return response.data.data;
    }

    async fetchInterviewPerformance(interview_id: string) {
        const response = await api.post(`/performance/fetchPerformance`, { interview_id });
        return response.data.data;
    }
}

export default new PerformanceApi();
