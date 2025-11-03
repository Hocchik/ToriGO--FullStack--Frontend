import axios from 'axios';
import type { LoginRequest, LoginResponse, RegisterRequest } from '../types/auth';

const API_BASE_URL = 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL
});

// ✅ Interceptor para agregar token automáticamente
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Servicio de autenticación
export const authService = {
  register: async (payload: RegisterRequest): Promise<LoginResponse> => {
    console.log(payload)
    const { data } = await apiClient.post('/auth/register', payload);
    return data;
  },

  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const { data } = await apiClient.post('/auth/login', payload);
    return data;
  },

  selectRole: async (role: string): Promise<LoginResponse> => {
    const { data } = await apiClient.post('/auth/select-role', { role });
    return data;
  }
};