import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";


const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    console.log("Interceptor caught error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.response?.data?.message
    });

    if (
      (error.response?.status === 401 ||
        (error.response?.status === 500 && error.response?.data?.message === 'jwt expired')) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      localStorage.removeItem("user");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    console.error("API Error:", error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export default api;
