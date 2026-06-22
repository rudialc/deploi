import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_URL,
});

/** Превращает /uploads/... в полный URL бэкенда (нужно в dev, когда фронт на другом порту). */
export const resolveMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const apiBase = API_URL.replace(/\/$/, "");
  const origin = apiBase.endsWith("/api") ? apiBase.slice(0, -4) : apiBase;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");

      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/profile/avatar', formData);
};

export const getActivities = () => api.get("/activity");

export const searchStudents = (query) => api.get('/coach/search-students', { params: { query } });
export const getCoachStudents = () => api.get('/coach/students');
export const addCoachStudent = (username) => api.post('/coach/students', { username });
export const getStudentActivities = (studentId) => api.get(`/coach/students/${studentId}/activities`);

export const addActivity = (activity) =>
  api.post("/activity", activity);

export const getActivityRecommendation = (id) =>
  api.get(`/recommendations/activity/${id}`);

export const getActivityById = (id) =>
  api.get(`/activity/${id}`);

export const getActivitiesByRange = (start, end) =>
  api.get("/activity/calendar", {
    params: { start, end },
  });

export const getUserProfile = () =>
  api.get("/profile");

export const updateUserProfile = (data) =>
  api.put("/profile", data);

export { api };