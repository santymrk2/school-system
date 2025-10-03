import { http } from "@/services/api/http";
import type * as DTO from "@/types/api-generated";

export const matriculas = {
  list: () => http.get<DTO.MatriculaDTO[]>("/api/matriculas"),
  byId: (id: number) => http.get<DTO.MatriculaDTO>("/api/matriculas/" + id),
  create: (body: DTO.MatriculaCreateDTO) => http.post<number>("/api/matriculas", body),
  update: (id: number, body: DTO.MatriculaDTO) =>
    http.put<void>("/api/matriculas/" + id, body),
  delete: (id: number) => http.delete<void>("/api/matriculas/" + id),
};

export const matriculaSeccionHistorial = {
  list: () => http.get<DTO.MatriculaSeccionHistorialDTO[]>("/api/matriculas/historial"),
  create: (body: DTO.MatriculaSeccionHistorialCreateDTO) =>
    http.post<number>("/api/matriculas/historial", body),
  update: (id: number, body: DTO.MatriculaSeccionHistorialDTO) =>
    http.put<void>(`/api/matriculas/historial/${id}`, body),
};

export const solicitudesBaja = {
  list: () => http.get<DTO.SolicitudBajaAlumnoDTO[]>("/api/bajas"),
  create: (body: DTO.SolicitudBajaAlumnoCreateDTO) =>
    http.post<number>("/api/bajas", body),
  review: (
    id: number,
    body: DTO.SolicitudBajaAlumnoRevisionAdministrativaDTO,
  ) => http.post<void>(`/api/bajas/${id}/revision-administrativa`, body),
  approve: (id: number, body: DTO.SolicitudBajaAlumnoDecisionDTO) =>
    http.post<void>(`/api/bajas/${id}/aprobar`, body),
  reject: (id: number, body: DTO.SolicitudBajaAlumnoRechazoDTO) =>
    http.post<void>(`/api/bajas/${id}/rechazar`, body),
  historial: () => http.get<DTO.SolicitudBajaAlumnoDTO[]>("/api/bajas/historial"),
};
