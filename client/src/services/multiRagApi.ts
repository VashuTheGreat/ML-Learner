import api from './api';

class MultiRagApi {
  async initiate(seconds: number) {
    const response = await api.get(`/multi_rag/initiate/${seconds}`);
    return response.data;
  }

  async upload(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/multi_rag/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async ingest() {
    const response = await api.get('/multi_rag/ingest');
    return response.data;
  }

  async chat(message: string) {
    const response = await api.post('/multi_rag/chat', { message });
    return response.data;
  }

  async loadConversation() {
    const response = await api.get('/multi_rag/conversation');
    return response.data;
  }
}

export default new MultiRagApi();
