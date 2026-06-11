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
        // Redundant as FastAPI backend automatically saves performance evaluations
        // upon completed SSE streams.
        return { success: true, data };
    }

    async fetchInterviewPerformance(interview_id: string) {
        const response = await api.get(`/interview/interviews/${interview_id}`);
        // The API returns the completed interview item, including its 'performance' key
        return response.data.data?.performance || response.data.data;
    }
}

export default new PerformanceApi();
