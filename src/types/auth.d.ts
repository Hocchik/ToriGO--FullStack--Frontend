export interface RegisterRequest {
  full_name: string;
  dni: string;
  age: number;
  email: string;
  phone: string;
  password: string;
  role: string;
  guardian_id?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: number;
    full_name: string;
    email: string;
    dni: string;
  };
  token: string;
  role?: string;
  roles?: string[];
}

export interface AuthState {
  user: LoginResponse['user'] | null;
  token: string | null;
  role: string | null;
  roles: string[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

export interface User {
    id: number;
    full_name: string;
    email: string;
    dni: string;
}