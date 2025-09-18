import { http } from '../http';
import type * as DTO from '@/types/api-generated';

export const emisionesCuota = {
  list: () => http.get<DTO.EmisionCuotaDTO[]>('/api/emisiones-cuota'),
  byId: (id: number) => http.get<DTO.EmisionCuotaDTO>('/api/emisiones-cuota/' + id),
  create: (body: DTO.EmisionCuotaCreateDTO) => http.post<number>('/api/emisiones-cuota', body),
  update: (id: number, body: DTO.EmisionCuotaCreateDTO) =>
    http.put<void>('/api/emisiones-cuota/' + id, body),
  delete: (id: number) => http.delete<void>('/api/emisiones-cuota/' + id),
};

export const cuotas = {
  list: () => http.get<DTO.CuotaDTO[]>('/api/cuotas'),
  byId: (id: number) => http.get<DTO.CuotaDTO>('/api/cuotas/' + id),
  create: (body: DTO.CuotaCreateDTO) => http.post<number>('/api/cuotas', body),
  bulkCreate: (body: DTO.CuotaBulkCreateDTO) =>
    http.post<number[]>('/api/cuotas/bulk', body),
  update: (id: number, body: DTO.CuotaDTO) => http.put<void>('/api/cuotas/' + id, body),
  delete: (id: number) => http.delete<void>('/api/cuotas/' + id),
};

export const pagosCuota = {
  list: () => http.get<DTO.PagoCuotaDTO[]>('/api/pagos'),
  byId: (id: number) => http.get<DTO.PagoCuotaDTO>('/api/pagos/' + id),
  create: (body: DTO.PagoCuotaCreateDTO) => http.post<number>('/api/pagos', body),
  updateEstado: (id: number, body: DTO.PagoCuotaEstadoUpdateDTO) => http.patch<void>('/api/pagos/' + id + '/estado', body),
  delete: (id: number) => http.delete<void>('/api/pagos/' + id),
};

export const recibos = {
  list: () => http.get<DTO.ReciboSueldoDTO[]>('/api/recibos-sueldo'),
  byId: (id: number) => http.get<DTO.ReciboSueldoDTO>('/api/recibos-sueldo/' + id),
  create: (body: DTO.ReciboSueldoCreateDTO) => http.post<number>('/api/recibos-sueldo', body),
  update: (id: number, body: DTO.ReciboSueldoDTO) => http.put<void>('/api/recibos-sueldo/' + id, body),
  delete: (id: number) => http.delete<void>('/api/recibos-sueldo/' + id),
};
