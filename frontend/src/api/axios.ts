import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bisleri_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("bisleri_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
