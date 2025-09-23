import { http } from "@/services/api/http";
import type * as DTO from "@/types/api-generated";

export const login = (email: string, password: string) =>
  http.post<DTO.AuthResponse>("/api/auth/login", { email, password });

export const logout = () => http.post("/api/auth/logout");

export const me = () => http.get<DTO.PersonaResumenDTO>("/api/auth/me");
