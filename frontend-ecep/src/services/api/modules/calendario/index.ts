import { http } from "@/services/api/http";
import type * as DTO from "@/types/api-generated";

const periodos = {
  list: () => http.get<DTO.PeriodoEscolarDTO[]>("/api/periodos"),
  create: (body: DTO.PeriodoEscolarCreateDTO) =>
    http.post<number>("/api/periodos", body),
  cerrar: (id: number) => http.post<void>(`/api/periodos/${id}/cerrar`, {}),
  abrir: (id: number) => http.post<void>(`/api/periodos/${id}/abrir`, {}),
};

const trimestres = {
  list: () => http.get<DTO.TrimestreDTO[]>("/api/trimestres"),
  create: (body: DTO.TrimestreCreateDTO) =>
    http.post<number>("/api/trimestres", body),
  update: (id: number, body: Partial<DTO.TrimestreDTO>) =>
    http.put<void>(`/api/trimestres/${id}`, body),
  cerrar: (id: number) => http.post<void>(`/api/trimestres/${id}/cerrar`, {}),
  reabrir: (id: number) => http.post<void>(`/api/trimestres/${id}/reabrir`, {}),
};

const diasNoHabiles = {
  list: () => http.get<DTO.DiaNoHabilDTO[]>("/api/dias-no-habiles"),
  create: (body: DTO.DiaNoHabilCreateDTO) =>
    http.post<DTO.DiaNoHabilDTO>("/api/dias-no-habiles", body),
  delete: (id: number) => http.delete<void>("/api/dias-no-habiles/" + id),
};

export const calendario = {
  periodos,
  trimestres,
  diasNoHabiles,
};

export { periodos, trimestres, diasNoHabiles };
