import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? '';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export function getAuthGoogleUrl(): string {
  const root = import.meta.env.VITE_API_URL || '';
  return `${root}/auth/google`;
}
