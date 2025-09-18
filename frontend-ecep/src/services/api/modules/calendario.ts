import { http } from '../http';
import type * as DTO from '@/types/api-generated';

export const periodos = {
  list: () => http.get<DTO.PeriodoEscolarDTO[]>('/api/periodos'),
  create: (body: DTO.PeriodoEscolarCreateDTO) => http.post<number>('/api/periodos', body),
  cerrar: (id: number) => http.post<void>(`/api/periodos/${id}/cerrar`, {}),
  abrir: (id: number) => http.post<void>(`/api/periodos/${id}/abrir`, {}),
};

export const trimestres = {
  list: () => http.get<DTO.TrimestreDTO[]>('/api/trimestres'),
  create: (body: DTO.TrimestreCreateDTO) => http.post<number>('/api/trimestres', body),
  update: (id: number, body: Partial<DTO.TrimestreDTO>) =>
    http.put<void>(`/api/trimestres/${id}`, body),
  cerrar: (id: number) => http.post<void>('/api/trimestres/' + id + '/cerrar', {}),
  reabrir: (id: number) => http.post<void>('/api/trimestres/' + id + '/reabrir', {}),
};
