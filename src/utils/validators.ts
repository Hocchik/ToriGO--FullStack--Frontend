import type { LoginPayload } from "../models/viewModels";

export function validateLogin(payload: LoginPayload): string[] {
  const errors: string[] = [];
  if (!payload.email.includes('@')) errors.push('Email inválido');
  if (payload.password.length < 6) errors.push('Contraseña muy corta');
  return errors;
}

export function validatePlate(plate: string): boolean {
  // Plate format: NNNN-LL (4 digits, dash, 2 uppercase letters)
  const re = /^[0-9]{4}-[A-Z]{2}$/;
  return re.test(plate);
}

export function validateSOAT(soat: string): boolean {
  // SOAT format example: SOAT-1234-AB-2024
  const re = /^SOAT-[0-9]{4}-[A-Z]{2}-[0-9]{4}$/;
  return re.test(soat);
}
