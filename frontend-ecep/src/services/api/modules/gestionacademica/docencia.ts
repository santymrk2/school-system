import { http } from "@/services/api/http";
import type * as DTO from "@/types/api-generated";

export const asignacionDocenteSeccion = {
  list: () =>
    http.get<DTO.AsignacionDocenteSeccionDTO[]>("/api/asignaciones/seccion"),
  create: (body: DTO.AsignacionDocenteSeccionCreateDTO) =>
    http.post<number>("/api/asignaciones/seccion", body),
  delete: (id: number) =>
    http.delete<void>(`/api/asignaciones/seccion/${id}`),
  byEmpleado: (empleadoId: number, fecha?: string) =>
    http.get<DTO.AsignacionDocenteSeccionDTO[]>(
      "/api/asignaciones/seccion/by-docente",
      { params: { empleadoId, ...(fecha ? { fecha } : {}) } },
    ),
};

export const asignacionDocenteMateria = {
  list: () =>
    http.get<DTO.AsignacionDocenteMateriaDTO[]>("/api/asignaciones/materia"),
  create: (body: DTO.AsignacionDocenteMateriaCreateDTO) =>
    http.post<number>("/api/asignaciones/materia", body),
  delete: (id: number) =>
    http.delete<void>(`/api/asignaciones/materia/${id}`),
};
