import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000/api';

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
    
    console.log('[DEBUG] 📤 API Request Interceptor:', {
      url: cfg.url,
      method: cfg.method,
      tokenFound: !!token,
      tokenLength: token.length,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none'
    });
    
    if (token) {
      if (cfg.headers) {
        // Axios header typing can be strict; mutate safely
        (cfg.headers as any).Authorization = `Bearer ${token}`;
      } else {
        cfg.headers = { Authorization: `Bearer ${token}` } as any;
      }
      console.log('[DEBUG] ✅ Authorization header set');
    } else {
      console.warn('[DEBUG] ⚠️  No token found in localStorage');
    }
  } catch (e) {
    console.error('[DEBUG] ❌ Error in request interceptor:', e);
    // ignore
  }
  return cfg;
});

// Response interceptor to log responses and errors
api.interceptors.response.use(
  (response) => {
    console.log('[DEBUG] 📥 API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('[DEBUG] ❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default api;
