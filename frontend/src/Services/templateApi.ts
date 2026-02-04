import api from './api';

class TemplateApi {
    async getTemplate(id: string) {
        const response = await api.get(`/templates/get_template/${id}`);
        return response.data.data;
    }

    async createTemplate(formData: FormData) {
        // formData should contain 'template' (file), 'temp_data' (file or string), and 'title'
        const response = await api.post('/templates/templates', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data.data;
    }

    async getAllTemplates() {
        const response = await api.get('/templates/getAlltemplates');
        return response.data.data;
    }

    async getTemplateByData(templateId: string, tempData: any) {
        const response = await api.post('/templates/getTemplateByData', {
            template_id: templateId,
            temp_data: tempData
        });
        return response.data.data;
    }
}

export default new TemplateApi();
