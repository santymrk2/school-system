import { http } from '../http';
import type * as DTO from '@/types/api-generated';

export const login = (email: string, password: string) =>
  http.post<DTO.AuthResponse>('/api/auth/login', { email, password } as DTO.LoginRequest);

export const logout = () => http.post('/api/auth/logout');

export const me = () => http.get<DTO.UsuarioBusquedaDTO>('/api/auth/me');
