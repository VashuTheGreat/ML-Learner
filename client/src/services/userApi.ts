import api from './api';
import templateApi from './templateApi';

class UserApi {
    private formatUser(user: any) {
        if (!user) return user;
        // Inject a resumes mock array to align with dashboard requirements
        if (!user.resumes) {
            user.resumes = user.temp_data ? [{ id: 'resume' }] : [];
        }
        return user;
    }

    async create({ fullname, email, password, username }: { fullname: string, email: string, password: string, username: string }) {
        const response = await api.post('/user/create', {
            fullName: fullname,
            email,
            password,
            username
        });
        const user = this.formatUser(response.data.data);
        console.log("User Created", user);
        localStorage.setItem("user", JSON.stringify(user));
        return user;
    }

    async update({ fullname, username }: { fullname?: string, username?: string }) {
        const response = await api.put('/user/update', {
            fullName: fullname,
            username
        });
        const user = this.formatUser(response.data.data);
        localStorage.setItem("user", JSON.stringify(user));
        return user;
    }

    async login({ email, password }: { email: string, password: string }) {
        const response = await api.post('/user/login', {
            email,
            password
        });
        const user = this.formatUser(response.data.data);
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
        formData.append('file', file); // Backend expects field name 'file'
        const response = await api.put('/user/avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        const user = this.formatUser(response.data.data);
        const localUserStr = localStorage.getItem("user");
        if (localUserStr) {
            const localUser = JSON.parse(localUserStr);
            localUser.avatar = user.avatar;
            localStorage.setItem("user", JSON.stringify(this.formatUser(localUser)));
        }
        return user;
    }

    async deleteAvatar() {
        const response = await api.delete('/user/avatar');
        const user = this.formatUser(response.data.data);
        const localUserStr = localStorage.getItem("user");
        if (localUserStr) {
            const localUser = JSON.parse(localUserStr);
            localUser.avatar = null;
            localStorage.setItem("user", JSON.stringify(this.formatUser(localUser)));
        }
        return user;
    }

    async addResume(resumeId: string) {
        // Obsolete in FastAPI server; simply retrieve and return the user.
        return this.getUser();
    }

    async addAboutUser({ aboutUser }: { aboutUser: string }) {
        // Mock save the string to user object in local storage and memory
        const localUserStr = localStorage.getItem("user");
        if (localUserStr) {
            const localUser = JSON.parse(localUserStr);
            localUser.aboutUser = aboutUser;
            localStorage.setItem("user", JSON.stringify(this.formatUser(localUser)));
            return localUser;
        }
        return { aboutUser };
    }

    async deleteResume(idx: number) {
        // Obsolete; template is managed separately on database.
        return this.getUser();
    }

    async getUserById(id: string) {
        const response = await api.get(`/user/${id}`);
        return this.formatUser(response.data.data);
    }

    async getUser() {
        const response = await api.get('/user/itself');
        const user = this.formatUser(response.data.data);
        localStorage.setItem("user", JSON.stringify(user));
        return user;
    }

    async updateUserJson(tempData: any) {
        // Update user resume template content in template table
        try {
            await templateApi.updateResumeTemplate(tempData);
        } catch (err) {
            console.error("Failed to update resume template in backend:", err);
        }

        const localUserStr = localStorage.getItem("user");
        if (localUserStr) {
            const localUser = JSON.parse(localUserStr);
            localUser.temp_data = tempData;
            localStorage.setItem("user", JSON.stringify(this.formatUser(localUser)));
            return localUser;
        }
        return { temp_data: tempData };
    }

    async refreshToken() {
        return this.getUser();
    }
}

export default new UserApi();
