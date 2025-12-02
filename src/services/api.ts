import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL as string) || '';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach JWT from localStorage (or other place) for every request
api.interceptors.request.use((cfg) => {
  try {
    // token storage key may vary; adapt as needed
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
    if (token) {
      if (cfg.headers) {
        // Axios header typing can be strict; mutate safely
        (cfg.headers as any).Authorization = `Bearer ${token}`;
      } else {
        cfg.headers = { Authorization: `Bearer ${token}` } as any;
      }
    }
  } catch (e) {
    // ignore
  }
  return cfg;
});

export default api;
