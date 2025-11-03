// utils/authStorage.ts

import type { User } from "../types/auth";

export const saveAuthData = (token: string, user: User, role: string) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('role', role);
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('role');
};

export const getInitialAuthState = () => ({
  token: localStorage.getItem('token'),
  role: localStorage.getItem('role'),
  user: (() => {
    const raw = localStorage.getItem('user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })()
});
