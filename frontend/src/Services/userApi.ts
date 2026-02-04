import api from './api';

class UserApi {
    async create({ fullname, email, password }: { fullname: string, email: string, password: string }) {
        const response = await api.post('/user/create', {
            fullName: fullname, // Backend expects fullName
            email,
            password
        });
        const user = response.data.data;
        console.log("User Created", user);
        localStorage.setItem("user", JSON.stringify(user));
        return user;
    }

    async update({ fullname, password }: { fullname?: string, password?: string }) {
        const response = await api.post('/user/update', {
            fullName: fullname,
            password
        });
        const user = response.data.data;
        localStorage.setItem("user", JSON.stringify(user));
        return user;
    }

    async login({ email, password }: { email: string, password: string }) {
        const response = await api.post('/user/login', {
            email,
            password
        });
        const user = response.data.data;
        localStorage.setItem("user", JSON.stringify(user));
        return user;
    }

    async logout() {
        const response = await api.get('/user/logout');
        localStorage.removeItem("user");
        console.log(response.data);
        return response.data;
    }

    async uploadAvatar(file: File) {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await api.post('/user/uploadAvatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        console.log(response.data);
        return response.data.data;
    }

    async deleteAvatar() {
        const response = await api.delete('/user/deleteAvatar');
        console.log(response.data);
        return response.data.data;
    }

    async addResume(resumeId: string) {
        // Backend expects resume_id in query params: /addResume?resume_id=...
        const response = await api.post(`/user/addResume?resume_id=${resumeId}`);
        return response.data.data;
    }

    async addAboutUser({ aboutUser }: { aboutUser: string }) {
        const response = await api.post('/user/addAboutUser', {
            aboutUser
        });
        return response.data.data;
    }

    async deleteResume(idx: number) {
        const response = await api.put(`/user/deleteResume/${idx}`);
        return response.data.data;
    }

    async getUserById(id: string) {
        const response = await api.get(`/user/getUserById/${id}`);
        return response.data.data;
    }

    async getUser() {
        const response = await api.get('/user/getUser');
        return response.data.data;
    }

    async updateUserJson(tempData: any) {
        // tempData should be a JSON string as per backend controller
        const response = await api.post('/user/updateUserJson', {
            temp_data: typeof tempData === 'string' ? tempData : JSON.stringify(tempData)
        });
        return response.data.data;
    }

    async refreshToken() {
        const response = await api.post('/user/refresh-token');
        return response.data.data;
    }

}

export default new UserApi();