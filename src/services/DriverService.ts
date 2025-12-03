import axios from 'axios';

export interface LicensePayload {
  license_number: string;
  issue_date: string;
  expiration_date: string;
  license_type?: string;
}

export interface SoatPayload {
  insurance_policy: string;
  expiration_date: string;
  vehicle_plate: string;
  insurer?: string;
}

export interface TechnicalReviewPayload {
  plate: string;
  review_date: string;
  expires_at: string;
  passed: boolean;
  notes?: string;
}

const API_BASE_URL = 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// attach token automatically
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token && config.headers) {
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getMyProfile = async () => {
  // return full axios response so callers can access `.data` consistently
  return apiClient.get('/drivers/me');
};

export const updateMyProfile = async (body: any) => {
  // return full axios response
  return apiClient.put('/drivers/me', body);
};

export const postLicense = async (payload: LicensePayload | FormData) => {
  if (payload instanceof FormData) {
    const { data } = await apiClient.post('/drivers/documents/license', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
    return data;
  }
  const { data } = await apiClient.post('/drivers/documents/license', payload);
  return data;
};

export const postSoat = async (payload: SoatPayload | FormData) => {
  if (payload instanceof FormData) {
    const { data } = await apiClient.post('/drivers/documents/soat', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
    return data;
  }
  const { data } = await apiClient.post('/drivers/documents/soat', payload);
  return data;
};

export const postTechnicalReview = async (payload: TechnicalReviewPayload | FormData) => {
  if (payload instanceof FormData) {
    const { data } = await apiClient.post('/drivers/documents/technical-review', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
    return data;
  }
  const { data } = await apiClient.post('/drivers/documents/technical-review', payload);
  return data;
};

export const uploadProfilePhoto = async (formData: FormData) => {
  const { data } = await apiClient.post('/drivers/me/photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return data;
};

export const disableMyAccount = async () => {
  const { data } = await apiClient.post('/drivers/me/disable');
  return data;
};

export default {
  getMyProfile,
  updateMyProfile,
  postLicense,
  postSoat,
  postTechnicalReview,
};
