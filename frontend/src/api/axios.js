import axios from 'axios';

// In production, the frontend is served by nginx which proxies /api to the
// backend Service inside the Kubernetes cluster (see nginx.conf).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shopsphere_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('shopsphere_token');
      localStorage.removeItem('shopsphere_user');
    }
    return Promise.reject(error);
  }
);

export default api;
