import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  me: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/update-profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
  seedAdmin: () => API.post('/auth/seed-admin'),
};

export const auditoriumAPI = {
  getAll: () => API.get('/auditoriums'),
  getOne: (id) => API.get(`/auditoriums/${id}`),
  getAvailability: (id, date) => API.get(`/auditoriums/${id}/availability?date=${date}`),
  create: (data) => API.post('/auditoriums', data),
  update: (id, data) => API.put(`/auditoriums/${id}`, data),
  delete: (id) => API.delete(`/auditoriums/${id}`),
  seed: () => API.post('/auditoriums/seed/data'),
};

export const bookingAPI = {
  getAll: (params) => API.get('/bookings', { params }),
  getOne: (id) => API.get(`/bookings/${id}`),
  create: (data) => API.post('/bookings', data),
  updateStatus: (id, data) => API.put(`/bookings/${id}/status`, data),
  cancel: (id, data) => API.put(`/bookings/${id}/cancel`, data),
  feedback: (id, data) => API.post(`/bookings/${id}/feedback`, data),
};

export const eventAPI = {
  getAll: (params) => API.get('/events', { params }),
  getOne: (id) => API.get(`/events/${id}`),
  create: (data) => API.post('/events', data),
  update: (id, data) => API.put(`/events/${id}`, data),
  register: (id) => API.post(`/events/${id}/register`),
};

export const userAPI = {
  getAll: () => API.get('/users'),
  toggleStatus: (id) => API.put(`/users/${id}/toggle-status`),
  updateRole: (id, role) => API.put(`/users/${id}/role`, { role }),
};

export const dashboardAPI = {
  getStats: () => API.get('/dashboard/stats'),
};

export default API;
