import axios from 'axios';
import type { LoginRequest, LoginResponse, registerDriverRequest, RegisterRequest } from '../types/auth';

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

  registerDriver: async (payload: registerDriverRequest): Promise<LoginResponse> => {
    console.log('Registering driver with payload:', payload);
    const { data } = await apiClient.post('/auth/register/driver', payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return data;
  },

  selectRole: async (role: string): Promise<LoginResponse> => {
    const { data } = await apiClient.post('/auth/select-role', { role });
    return data;
  },

  verifyLicense: async (payload: {
    license_number: string;
    license_expiration_date: string;
    name: string;
    last_name: string;
  }): Promise<{ valid: boolean; error?: string }> => {
    try {
      const { data } = await apiClient.post('/auth/verify-license', payload);
      return data;
    } catch (err: any) {
      return { valid: false, error: err?.response?.data?.message || 'Licencia inválida o no existe' };
    }
  },

  verifySoat: async (payload: {
    insurance_policy_number: string;
    insurance_policy_expiration_date: string;
    plate: string;
  }): Promise<{ valid: boolean; error?: string }> => {
    try {
      const { data } = await apiClient.post('/auth/verify-soat', payload);
      return data;
    } catch (err: any) {
      return { valid: false, error: err?.response?.data?.message || 'SOAT inválido o no existe' };
    }
  }
};