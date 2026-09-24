import axios from 'axios';

// In production (deployed on Vercel), VITE_API_URL is set to your live
// Render backend URL. Locally, it falls back to localhost since that
// env var won't be set on your machine.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;