import axios from 'axios';
import type { LoginRequest, LoginResponse, registerDriverRequest, RegisterRequest } from '../types/auth';

const API_BASE_URL = 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
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
    // Try multiple payload shapes to accommodate backend variations (email, phone, or emailorphone)
    const { emailorphone, password } = payload as any;
    const storedRole = typeof window !== 'undefined' ? localStorage.getItem('role') : null;
    const candidates: any[] = [];
    if (typeof emailorphone === 'string' && emailorphone.includes('@')) {
      candidates.push({ email: emailorphone.trim(), password, emailorphone, ...(storedRole ? { role: storedRole } : {}) });
    }
    if (typeof emailorphone === 'string' && /^\+?\d+$/.test(emailorphone.replace(/\s+/g, ''))) {
      candidates.push({ phone: emailorphone.replace(/\s+/g, '').trim(), password, emailorphone, ...(storedRole ? { role: storedRole } : {}) });
    }
    // fallback to original combined field
    candidates.push({ emailorphone, password, ...(storedRole ? { role: storedRole } : {}) });

    let lastErr: any = null;
    for (const body of candidates) {
      try {
        const { data } = await apiClient.post('/auth/login', body);
        return data;
      } catch (err: any) {
        lastErr = err;
        // log and try next candidate
        console.warn('AuthService.login attempt failed, trying next candidate', { requestBody: body, response: err?.response?.data || err?.message });
      }
    }
    // if we reach here, all attempts failed — surface the last error
    console.error('AuthService.login error (all attempts)', { response: lastErr?.response?.data || lastErr?.message });
    throw lastErr;
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