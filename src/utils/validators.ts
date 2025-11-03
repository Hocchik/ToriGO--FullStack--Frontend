import type { LoginPayload } from "../models/viewModels";

export function validateLogin(payload: LoginPayload): string[] {
  const errors: string[] = [];
  if (!payload.email.includes('@')) errors.push('Email inválido');
  if (payload.password.length < 6) errors.push('Contraseña muy corta');
  return errors;
}
