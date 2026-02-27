import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('jh_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('jh_token');
            if (window.location.pathname !== '/sign-in') {
                window.location.href = '/sign-in';
            }
        }
        return Promise.reject(err);
    }
);

export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    signup: (data) => api.post('/auth/signup', data),
    me: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
};

export const jobsAPI = {
    search: (params) => api.get('/jobs/search', { params }),
    getById: (id) => api.get(`/jobs/${id}`),
    apply: (formData) => api.post('/jobs/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export const employerAPI = {
    createJob: (data) => api.post('/employer/jobs', data),
    listJobs: (params) => api.get('/employer/jobs', { params }),
    updateJob: (id, data) => api.put(`/employer/jobs/${id}`, data),
    deleteJob: (id) => api.delete(`/employer/jobs/${id}`),
    getApplications: (jobId) => api.get(`/employer/applications/${jobId}`),
    updateApplicationStatus: (id, data) => api.put(`/employer/applications/${id}/status`, data),
    myApplications: (params) => api.get('/employer/my-applications', { params }),
};

export const adminAPI = {
    getStats: () => api.get('/admin/stats'),
    getUsers: (params) => api.get('/admin/users', { params }),
    updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    getJobs: (params) => api.get('/admin/jobs', { params }),
    approveJob: (id, data) => api.put(`/admin/jobs/${id}/approve`, data),
    deleteJob: (id) => api.delete(`/admin/jobs/${id}`),
    getActivity: () => api.get('/admin/activity'),
};

export default api;
