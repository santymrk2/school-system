// services/api/modules/personas-core.ts (o dejalo en el mismo archivo)
import { http } from "../http";
import type * as DTO from "@/types/api-generated";

export const personasCore = {
  findIdByDni: (dni: string) => http.get<number>(`/api/personas/dni/${dni}`),
  create: (body: DTO.PersonaCreateDTO) => http.post<number>(`/api/personas`, body),
  getById: (id: number) => http.get<DTO.PersonaDTO>(`/api/personas/${id}`),
  update: (id: number, patch: Partial<DTO.PersonaUpdateDTO>) =>
    http.put<void>(`/api/personas/${id}`, patch),

  // link/unlink de usuario a Persona
  linkUsuario: (personaId: number, usuarioId: number) =>
    http.post<void>(`/api/personas/${personaId}/link-usuario`, { usuarioId }),
  unlinkUsuario: (personaId: number) =>
    http.post<void>(`/api/personas/${personaId}/unlink-usuario`, {}),
};
