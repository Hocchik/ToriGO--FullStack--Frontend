export interface RegisterRequest {
  full_name: string;
  dni: string;
  age: number;
  email: string;
  phone: string;
  password: string;
  role: string;
  guardian_id?: number;
  plate?: string;
  license_number?: string;
  issue_date?: string;
  expiration_date?: string;
  soat_expiration?: string;
}

export interface registerDriverRequest {
  // Step 1 - Datos del vehículo y licencia
  name: string;
  last_name: string;
  dni: string;
  plate: string;
  license_number: string;
  license_expiration_date: string;
  insurance_policy_number: string; //SOAT
  insurance_policy_expiration_date: string; //SOAT
  // Step 2 - Datos de contacto
  email: string;
  phone: string;
  password: string;
  role: string;
}


export interface LoginRequest {
  emailorphone: string;
  password: string;
}

export interface TokenAndEmail {
  email: string;
  token: string;
}


export interface LoginResponse {
  user: {
    id: string;
    name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  token: string;
  role: string;
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
  id: string;
  full_name: string;
  email: string;
  phone: string;
}