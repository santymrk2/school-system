import { http } from '../http';
import type * as DTO from '@/types/api-generated';

export const asistencias = {
  historialSeccion: (seccionId: number, from: string, to: string) =>
    http.get<DTO.AsistenciaDiaDTO[]>('/api/asistencias/secciones/' + seccionId + '/historial', { params: { from, to } }),
  acumuladoSeccion: (seccionId: number, from: string, to: string) =>
    http.get<DTO.AsistenciaAcumuladoDTO>('/api/asistencias/secciones/' + seccionId + '/acumulado', { params: { from, to } }),
  resumenPorAlumno: (seccionId: number, from: string, to: string) =>
    http.get<DTO.AsistenciaAlumnoResumenDTO[]>('/api/asistencias/secciones/' + seccionId + '/alumnos-resumen', { params: { from, to } }),
};

export const detallesAsistencia = {
  list: () => http.get<DTO.DetalleAsistenciaDTO[]>('/api/asistencias/detalles'),
  byId: (id: number) => http.get<DTO.DetalleAsistenciaDTO>('/api/asistencias/detalles/' + id),
  create: (body: DTO.DetalleAsistenciaCreateDTO) => http.post<number>('/api/asistencias/detalles', body),
  delete: (id: number) => http.delete<void>('/api/asistencias/detalles/' + id),
  search: (params: { jornadaId?: number; matriculaId?: number; desde?: string; hasta?: string }) =>
    http.get<DTO.DetalleAsistenciaDTO[]>('/api/asistencias/detalles/search', { params }),
  byJornada: (jornadaId: number) =>
    http.get<DTO.DetalleAsistenciaDTO[]>('/api/asistencias/detalles/search', { params: { jornadaId } }),
  update: (id: number, body: DTO.DetalleAsistenciaUpdateDTO) =>
    http.patch<void>('/api/asistencias/detalles/' + id, body),
};

export const jornadasAsistencia = {
  list: () => http.get<DTO.JornadaAsistenciaDTO[]>('/api/asistencias/jornadas'),
  byId: (id: number) => http.get<DTO.JornadaAsistenciaDTO>('/api/asistencias/jornadas/' + id),
  create: (body: DTO.JornadaAsistenciaCreateDTO) => http.post<number>('/api/asistencias/jornadas', body),
  delete: (id: number) => http.delete<void>('/api/asistencias/jornadas/' + id),
  search: (params: { seccionId?: number; from?: string; to?: string; trimestreId?: number; fecha?: string }) =>
    http.get<DTO.JornadaAsistenciaDTO[]>('/api/asistencias/jornadas', { params }),
  bySeccionFechaOne: (seccionId: number, fecha: string) =>
    http.get<DTO.JornadaAsistenciaDTO>('/api/asistencias/jornadas', { params: { seccionId, fecha } }),
};

export const diasNoHabiles = {
  list: () => http.get<DTO.DiaNoHabilDTO[]>('/api/dias-no-habiles'),
  create: (body: DTO.DiaNoHabilCreateDTO) => http.post<DTO.DiaNoHabilDTO>('/api/dias-no-habiles', body),
  delete: (id: number) => http.delete<void>('/api/dias-no-habiles/' + id),
};
