import { http } from "@/services/api/http";
import type * as DTO from "@/types/api-generated";

export const comunicados = {
  list: () => http.get<DTO.ComunicadoDTO[]>("/api/comunicados"),
  byId: (id: number) => http.get<DTO.ComunicadoDTO>("/api/comunicados/" + id),
  create: (body: DTO.ComunicadoCreateDTO) =>
    http.post<number>("/api/comunicados", body),
  update: (id: number, body: Partial<DTO.ComunicadoCreateDTO>) =>
    http.put<number>("/api/comunicados/" + id, body),
  delete: (id: number) => http.delete<void>("/api/comunicados/" + id),
  confirmarLectura: (id: number) => http.post<void>(`/api/comunicados/${id}/lecturas`, {}),
  resumenLecturas: (id: number) =>
    http.get<DTO.ComunicadoLecturaResumenDTO>(
      `/api/comunicados/${id}/lecturas/resumen`,
    ),
};
