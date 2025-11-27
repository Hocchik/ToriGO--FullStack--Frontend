import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/AuthService';
import type { AuthState, LoginRequest, registerDriverRequest, RegisterRequest } from '../../types/auth';
import { saveAuthData, clearAuthData, getInitialAuthState } from '../../utils/authStorage';

const initialLocal = getInitialAuthState();

const initialState: AuthState = {
  user: initialLocal.user,
  token: initialLocal.token,
  role: initialLocal.role,
  roles: [],
  status: 'idle',
  error: null
};

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      console.log(response.token)
      console.log(response.user)
      if (!response.token || !response.user) {
        return rejectWithValue('Registro incompleto');
      }
      // Mapear la respuesta para cumplir con la interfaz User si faltan propiedades
      const user = {
        ...response.user,
        full_name: (response.user as any).full_name ?? `${response.user.name ?? ''} ${response.user.last_name ?? ''}`,
      };
      saveAuthData(response.token, user, response.role || 'guest');
      return { ...response, user };
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as { response?: { data?: { message?: string; error?: string } } };
        const msg = err.response?.data?.message || err.response?.data?.error || 'Error de conexión';
        return rejectWithValue(msg);
      }

      return rejectWithValue('Error inesperado');
    }

  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      let emailorphone = credentials.emailorphone.trim();
      // Si es solo números, prepende '+51 '
      if (/^\d{9}$/.test(emailorphone)) {
        emailorphone = `+51 ${emailorphone}`;
      }
      const response = await authService.login({ ...credentials, emailorphone });
      if (!response.token || !response.user) {
        return rejectWithValue('Credenciales inválidas');
      }
      const user = {
        ...response.user,
        full_name: (response.user as any).full_name ?? `${response.user.name ?? ''} ${response.user.last_name ?? ''}`,
      };
      saveAuthData(response.token, user, response.role || 'guest');
      return { ...response, user };
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as { response?: { data?: { message?: string; error?: string } } };
        const msg = err.response?.data?.message || err.response?.data?.error || 'Error de conexión';
        return rejectWithValue(msg);
      }

      return rejectWithValue('Error inesperado');
    }
  }
);

export const registerDriver = createAsyncThunk(
  'auth/register/driver',
  async (driverData: registerDriverRequest, { rejectWithValue }) => {
    try {
      const response = await authService.registerDriver(driverData);
      return response;
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(err.response?.data?.message || 'Error de conexión');
      }

      return rejectWithValue('Error inesperado');
    }
  }
);

export const selectRole = createAsyncThunk(
  'auth/selectRole',
  async (role: string, { rejectWithValue }) => {
    try {
      const response = await authService.selectRole(role);
      if (!response.token) {
        return rejectWithValue('No se pudo asignar el rol');
      }
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', role);
      return response;
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const err = error as { response?: { data?: { message?: string } } };
        return rejectWithValue(err.response?.data?.message || 'Error de conexión');
      }

      return rejectWithValue('Error inesperado');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.roles = [];
      clearAuthData();
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.role || null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.role || null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(registerDriver.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerDriver.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.role || null;
      })
      .addCase(registerDriver.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(selectRole.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.role = action.payload.role || state.role;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;