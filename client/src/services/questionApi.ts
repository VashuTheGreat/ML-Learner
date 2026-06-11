import api from './api';
import { Question, CodingSchema, UpdateCodingSchemaBody } from '@/types';

const getQuestionIdFromPath = (): number => {
    const parts = window.location.pathname.split('/');
    const last = parts[parts.length - 1];
    const id = parseInt(last, 10);
    return isNaN(id) ? 1 : id;
};

class QuestionApi {
    /** Coding Schema Progress Methods */
    
    async createCodingSchema() {
        const response = await api.get('/coding/fetch');
        return response.data;
    }

    async getCodingSchema() {
        const response = await api.get('/coding/fetch');
        return response.data;
    }

    async updateCodingSchema(data: UpdateCodingSchemaBody) {
        const response = await api.put('/coding/update', data);
        return response.data;
    }

    /** Question Methods */
    async fetchQuestionById(id: string) {
        console.log(`Fetching question by ID: ${id}`);
        const response = await api.get('/question', {
            params: { question_id: parseInt(id, 10) }
        });
        return response.data;
    }

    async fetchAvailableQuestionsCategories(){
        const response = await api.get("/question/categories");
        return response.data;
    }

    async fetchQuestionsByCategory(category: string) {
        console.log(`Fetching questions by category: ${category}`);
        const response = await api.get('/question', {
            params: { category }
        });
        return response.data;
    }

    async fetchQuestionsByDifficulty(difficulty: string) {
        console.log(`Fetching questions by difficulty: ${difficulty}`);
        const response = await api.get('/question', {
            params: { difficulty }
        });
        return response.data;
    }

    async runCode(code: string, questionId: number) {
        console.log(`Running code for question ID: ${questionId}`);
        const response = await api.post('/coding/run_code', {
            language: 'python',
            code: code,
            question_id: questionId
        });

        const rawData = response.data.data;
        if (rawData && Array.isArray(rawData.results)) {
            const mappedResults = rawData.results.map((r: any) => ({
                pass: r.passed,
                expected_output: r.expected,
                actual_output: r.got !== undefined ? r.got : (r.error || ''),
                expected_res: r.expected,
                test_res: r.got,
                stderr: r.error || ''
            }));
            return {
                success: response.data.success,
                data: mappedResults
            };
        }
        return response.data;
    }

    async submitCode(code: string, questionId: number) {
        console.log(`Submitting code for question ID: ${questionId}`);
        const response = await api.post('/coding/submit_code', {
            language: 'python',
            code: code,
            question_id: questionId
        });

        const rawData = response.data.data;
        if (rawData && Array.isArray(rawData.results)) {
            const mappedResults = rawData.results.map((r: any) => ({
                pass: r.passed,
                expected_output: r.expected,
                actual_output: r.got !== undefined ? r.got : (r.error || ''),
                expected_res: r.expected,
                test_res: r.got,
                stderr: r.error || ''
            }));
            return {
                success: response.data.success,
                data: mappedResults
            };
        }
        return response.data;
    }

    async fetchAllQuestions() {
        console.log("Fetching all questions");
        const response = await api.get('/question');
        return response.data;
    }
}

export default new QuestionApi();
export { type Question };
