import { http } from "@/services/api/http";
import type * as DTO from "@/types/api-generated";
import type { SpringPage } from "@/types/pagination";

export const alumnos = {
  list: () => http.get<DTO.AlumnoDTO[]>("/api/alumnos"),
  historial: () => http.get<DTO.AlumnoHistorialDTO[]>("/api/alumnos/historial"),
  listPaged: (params?: {
    page?: number;
    size?: number;
    search?: string;
    seccionId?: number;
  }) =>
    http.get<SpringPage<DTO.AlumnoDTO>>("/api/alumnos/paginated", {
      params,
    }),
  byId: (id: number) => http.get<DTO.AlumnoDTO>("/api/alumnos/" + id),
  create: (body: DTO.AlumnoDTO) =>
    http.post<number>("/api/alumnos", body),
  update: (id: number, body: DTO.AlumnoDTO) =>
    http.put<void>("/api/alumnos/" + id, body),
  delete: (id: number) => http.delete<void>("/api/alumnos/" + id),
};

export const familiares = {
  list: () => http.get<DTO.FamiliarDTO[]>("/api/familiares"),
  byId: (id: number) => http.get<DTO.FamiliarDTO>("/api/familiares/" + id),
  create: (body: Omit<DTO.FamiliarDTO, "id"> & { id?: number }) =>
    http.post<number>("/api/familiares", body as DTO.FamiliarDTO),
  update: (id: number, body: DTO.FamiliarDTO) =>
    http.put<void>("/api/familiares/" + id, body),
  delete: (id: number) => http.delete<void>("/api/familiares/" + id),
};

export const alumnoFamiliares = {
  list: () => http.get<DTO.AlumnoFamiliarDTO[]>("/api/alumnos-familiares"),
  byId: (id: number) =>
    http.get<DTO.AlumnoFamiliarDTO>("/api/alumnos-familiares/" + id),
  create: (body: DTO.AlumnoFamiliarCreateDTO) =>
    http.post<number>("/api/alumnos-familiares", body),
  update: (id: number, body: DTO.AlumnoFamiliarDTO) =>
    http.put<void>("/api/alumnos-familiares/" + id, body),
  delete: (id: number) =>
    http.delete<void>("/api/alumnos-familiares/" + id),
};

export const familiaresAlumnos = {
  byFamiliarId: (familiarId: number) =>
    http.get<DTO.AlumnoLiteDTO[]>(`/api/familiares/${familiarId}/alumnos`),
};
