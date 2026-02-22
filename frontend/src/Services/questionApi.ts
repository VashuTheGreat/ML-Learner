import axios from "axios";

const NODE_BASE_URL = 'http://localhost:3000/api';
const PYTHON_BASE_URL = 'http://localhost:8000';

const nodeApiInstance = axios.create({
    baseURL: NODE_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

const pythonApiInstance = axios.create({
    baseURL: PYTHON_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Question {
    id: number;
    title: string;
    difficulty: string;
    category: string;
    problem_description: string;
    starter_code: string;
    example_input: string;
    example_output: string;
    example_reasoning: string;
    learn_content?: string;
    solution_code?: string;
    test_cases: { test: any; expected_output: any }[];
}

class QuestionApi {
    async fetchQuestionById(id: string) {
        console.log(`Fetching question by ID: ${id}`);
        const response = await nodeApiInstance.get(`/question/fetch_question/id/${id}`);
        console.log("Response from fetchQuestionById:", response.data);
        return response.data;
    }

    async fetchAvailableQuestionsCategories(){
        const response=await nodeApiInstance.get("/question/question_categories");
        return response.data
    }

    async fetchQuestionsByCategory(category: string) {
        console.log(`Fetching questions by category: ${category}`);
        const response = await nodeApiInstance.get(`/question/fetch_question/category/${category}`);
        console.log("Response from fetchQuestionsByCategory:", response.data);
        return response.data;
    }

    async fetchQuestionsByDifficulty(difficulty: string) {
        console.log(`Fetching questions by difficulty: ${difficulty}`);
        const response = await nodeApiInstance.get(`/question/fetch_question/difficulty/${difficulty}`);
        console.log("Response from fetchQuestionsByDifficulty:", response.data);
        return response.data;
    }

    async submitCode(code: string, testCases: any[], functionName: string) {
        console.log(`Submitting code for function: ${functionName}`);
        // code is expected to be base64 encoded by the caller or here
        // Using a more robust way to handle non-ASCII characters
        const base64Code = btoa(unescape(encodeURIComponent(code)));
        const response = await pythonApiInstance.post('/api/coding/submit', {
            code: base64Code,
            test_cases: testCases,
            function_name: functionName
        });
        console.log("Response from submitCode:", response.data);
        return response.data;
    }

    async fetchAllQuestions() {
        console.log("Fetching all questions (trying /all or default category)");
        try {
            const response = await nodeApiInstance.get('/question/fetch_question/all');
            console.log("url to hit is ", nodeApiInstance.getUri());
            console.log("Response from fetchAllQuestions (/all):", response.data);
            return response.data;
        } catch (error) {
            console.warn("Fetch /all failed, falling back to 'linear algebra' category");
            return this.fetchQuestionsByCategory('linear algebra');
        }
    }
}

export default new QuestionApi();
