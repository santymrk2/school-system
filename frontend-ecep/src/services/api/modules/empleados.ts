// services/api/modules/empleados.ts
import { http } from "../http";
import type * as DTO from "@/types/api-generated";

/** ================= Empleados ================= */
export const empleados = {
  list: () => http.get<DTO.EmpleadoDTO[]>("/api/empleados"),
  byId: (id: number) => http.get<DTO.EmpleadoDTO>("/api/empleados/" + id),
  create: (body: DTO.EmpleadoCreateDTO) =>
    http.post<number>("/api/empleados", body),
  update: (id: number, body: DTO.EmpleadoUpdateDTO) =>
    http.put<number>("/api/empleados/" + id, body),
  delete: (id: number) => http.delete<void>("/api/empleados/" + id),
};

/** ================= Licencias (RRHH) ================= */
export const licencias = {
  list: () => http.get<DTO.LicenciaDTO[]>("/api/licencias"),
  byId: (id: number) => http.get<DTO.LicenciaDTO>("/api/licencias/" + id),
  create: (body: DTO.LicenciaCreateDTO) =>
    http.post<number>("/api/licencias", body),
  update: (id: number, body: DTO.LicenciaDTO) =>
    http.put<void>("/api/licencias/" + id, body),
  delete: (id: number) => http.delete<void>("/api/licencias/" + id),

  // 🔁 Parametro actualizado: antes "personalId", ahora "empleadoId"
  byEmpleadoId: (empleadoId: number) =>
    http.get<DTO.LicenciaDTO[]>("/api/licencias", { params: { empleadoId } }),
};

export const formaciones = {
  list: () => http.get<DTO.FormacionAcademicaDTO[]>("/api/formaciones"),
  create: (body: DTO.FormacionAcademicaCreateDTO) =>
    http.post<number>("/api/formaciones", body),
  update: (id: number, body: DTO.FormacionAcademicaDTO) =>
    http.put<void>("/api/formaciones/" + id, body),
  byId: (id: number) =>
    http.get<DTO.FormacionAcademicaDTO>("/api/formaciones/" + id),
  delete: (id: number) => http.delete<void>("/api/formaciones/" + id),
};
