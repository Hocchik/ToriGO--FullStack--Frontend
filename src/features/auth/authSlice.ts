import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/AuthService';
import type { AuthState, LoginRequest, RegisterRequest } from '../../types/auth';
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
      saveAuthData(response.token, response.user, response.role || 'guest');
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

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      if (!response.token || !response.user) {
        return rejectWithValue('Credenciales inválidas');
      }
      saveAuthData(response.token, response.user, response.role || 'guest');
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
        state.roles = action.payload.roles || [];
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
      .addCase(selectRole.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.role = action.payload.role || state.role;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;