import { http } from "@/services/api/http";
import type * as DTO from "@/types/api-generated";

const aspirantes = {
  list: () => http.get<DTO.AspiranteDTO[]>("/api/aspirantes"),
  byId: (id: number) => http.get<DTO.AspiranteDTO>("/api/aspirantes/" + id),
  byPersonaId: (personaId: number) =>
    http.get<DTO.AspiranteDTO>("/api/aspirantes/persona/" + personaId),
  create: (body: Omit<DTO.AspiranteDTO, "id">) =>
    http.post<DTO.AspiranteDTO>("/api/aspirantes", body),
  update: (id: number, body: Partial<DTO.AspiranteDTO>) =>
    http.put<void>("/api/aspirantes/" + id, body),
  delete: (id: number) => http.delete<void>("/api/aspirantes/" + id),
};

const aspiranteFamiliares = {
  list: () => http.get<DTO.AspiranteFamiliarDTO[]>("/api/aspirante-familiar"),
  create: (body: DTO.AspiranteFamiliarDTO) =>
    http.post<number>("/api/aspirante-familiar", body),
  update: (id: number, body: DTO.AspiranteFamiliarDTO) =>
    http.put<number>(`/api/aspirante-familiar/${id}`, body),
  delete: (id: number) => http.delete<void>(`/api/aspirante-familiar/${id}`),
};

const solicitudesAdmision = {
  list: () => http.get<DTO.SolicitudAdmisionDTO[]>("/api/solicitudes-admision"),
  byId: (id: number) =>
    http.get<DTO.SolicitudAdmisionDTO>("/api/solicitudes-admision/" + id),
  create: (body: Omit<DTO.SolicitudAdmisionDTO, "id">) =>
    http.post<number>("/api/solicitudes-admision", body),
  update: (id: number, body: Partial<DTO.SolicitudAdmisionDTO>) =>
    http.put<void>("/api/solicitudes-admision/" + id, body),
  delete: (id: number) => http.delete<void>("/api/solicitudes-admision/" + id),
  byAspiranteId: (aspiranteId: number) =>
    http.get<DTO.SolicitudAdmisionDTO[]>("/api/solicitudes-admision", {
      params: { aspiranteId },
    }),
  rechazar: (id: number, body: DTO.SolicitudAdmisionRechazoDTO) =>
    http.post<void>(`/api/solicitudes-admision/${id}/rechazar`, body),
  programar: (id: number, body: DTO.SolicitudAdmisionProgramarDTO) =>
    http.post<void>(`/api/solicitudes-admision/${id}/programar`, body),
  solicitarReprogramacion: (
    id: number,
    body: DTO.SolicitudAdmisionReprogramacionDTO,
  ) => http.post<void>(`/api/solicitudes-admision/${id}/reprogramar`, body),
  confirmarFecha: (id: number, body: DTO.SolicitudAdmisionSeleccionDTO) =>
    http.post<void>(`/api/solicitudes-admision/${id}/confirmar-fecha`, body),
  registrarEntrevista: (id: number, body: DTO.SolicitudAdmisionEntrevistaDTO) =>
    http.post<void>(`/api/solicitudes-admision/${id}/entrevista`, body),
  decidir: (id: number, body: DTO.SolicitudAdmisionDecisionDTO) =>
    http.post<void>(`/api/solicitudes-admision/${id}/decision`, body),
};

export const admisiones = {
  aspirantes,
  aspiranteFamiliares,
  solicitudesAdmision,
};

export { aspirantes, aspiranteFamiliares, solicitudesAdmision };
