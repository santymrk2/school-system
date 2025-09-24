// services/api/modules/personas-core.ts (o dejalo en el mismo archivo)
import { http } from "@/services/api/http";
import type * as DTO from "@/types/api-generated";

export const personasCore = {
  findIdByDni: (dni: string) => http.get<number>(`/api/personas/dni/${dni}`),
  create: (body: DTO.PersonaCreateDTO) => http.post<number>(`/api/personas`, body),
  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return http.post<DTO.PersonaFotoUploadResponse>(`/api/personas/foto`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getManyById: (ids: number[]) =>
    http.get<DTO.PersonaDTO[]>(`/api/personas`, {
      params: { ids: ids.join(",") },
    }),
  getById: (id: number) => http.get<DTO.PersonaDTO>(`/api/personas/${id}`),
  update: (id: number, patch: Partial<DTO.PersonaUpdateDTO>) =>
    http.put<void>(`/api/personas/${id}`, patch),
  getResumen: (id: number) =>
    http.get<DTO.PersonaResumenDTO>(`/api/personas/credenciales/${id}`),
  searchCredenciales: (q?: string) =>
    http.get<DTO.PersonaResumenDTO[]>(`/api/personas/credenciales/search`, {
      params: q ? { q } : {},
    }),
};
