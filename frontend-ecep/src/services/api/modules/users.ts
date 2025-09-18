import { http } from "../http";
import type * as DTO from "@/types/api-generated";

export const user = {
  getById: (id: number) => http.get<DTO.UsuarioDTO>("/api/users/" + id),
  create: (body: DTO.UsuarioDTO) => http.post<number>("/api/users", body),
  update: (id: number, body: DTO.UsuarioDTO) =>
    http.put<number>("/api/users/" + id, body),
};

export const searchUsers = (q: string) =>
  http.get<DTO.UsuarioBusquedaDTO[]>("/api/users/search", { params: { q } });
