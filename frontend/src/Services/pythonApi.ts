import axios from 'axios';

const PYTHON_BASE_URL = 'http://localhost:8000';

const pythonApiInstance = axios.create({
    baseURL: PYTHON_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

class PythonApi {
    async createSchema(userDetails: string) {
        const response = await pythonApiInstance.post('/generate_schema', {
            userDetails
        });
        return response.data;
    }

    async generateInterviewSchemas(noOfInterviews: number = 3, fields: string[] = ["AI/ML", "Backend", "Data Science"], updated: boolean = false) {
        const response = await pythonApiInstance.post('/generate_interview_schemas', null, {
            params: {
                no_of_interviews: noOfInterviews,
                updated
            },
            // fastAPI expects list in query params differently sometimes, but let's try sending as JSON body if params fail, 
            // however the python code uses Query params defaults. 
            // Wait, looking at python code: 
            // async def interview(no_of_interviews:int=3, fields: List[str] = ["AI/ML", "Backend", "Data Science"],updated:bool=False):
            // These are query parameters by default in FastAPI if not specified as Body.
            // Let's construct the query string manually or use params serializer if needed for arrays.
            // Axios handles array params like ?fields[]=a&fields[]=b by default or similar. 
            // Let's use a custom params serializer to match standard FastAPI expectation if needed, 
            // but standard axios params usually work.
             paramsSerializer: {
                indexes: null // to avoid brackets like fields[0]=... if that's what fastapi wants, usually it wants fields=a&fields=b
            }
        });
        
        // Actually, let's look at the python signature again.
        // fields: List[str] = ...
        // In FastAPI, to send a list as query param, you often need `fields` to appear multiple times.
        // Axios `params` with array does `fields[]` by default.
        // Let's adjust to be safe.
        
        const params = new URLSearchParams();
        params.append('no_of_interviews', noOfInterviews.toString());
        params.append('updated', updated.toString());
        fields.forEach(f => params.append('fields', f));

        const res = await pythonApiInstance.post(`/generate_interview_schemas?${params.toString()}`);
        return res.data;
    }

    async chatInterviewer(threadId: string, timeRemain: number, topic: string, userInput: string) {
        const response = await pythonApiInstance.post('/chat_intervier', null, {
            params: {
                thread_id: threadId,
                time_remain: timeRemain,
                topic: topic,
                user_input: userInput
            }
        });
        return response.data;
    }

    async getPerformance(threadId: string) {
        const response = await pythonApiInstance.get(`/performance/${threadId}`);
        return response.data;
    }

    async deleteThread(threadId: string) {
        const response = await pythonApiInstance.get(`/deleteThread/${threadId}`);
        return response.data;
    }

    async uploadResume(file: File) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await pythonApiInstance.post('/aboutUserByResume', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
}

export default new PythonApi();
