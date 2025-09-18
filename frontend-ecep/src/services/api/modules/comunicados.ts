import { http } from '../http';
import type * as DTO from '@/types/api-generated';

export const comunicados = {
  list: () => http.get<DTO.ComunicadoDTO[]>('/api/comunicados'),
  byId: (id: number) => http.get<DTO.ComunicadoDTO>('/api/comunicados/' + id),
  create: (body: DTO.ComunicadoCreateDTO) => http.post<number>('/api/comunicados', body),
  update: (id: number, body: Partial<DTO.ComunicadoCreateDTO>) => http.put<number>('/api/comunicados/' + id, body),
  delete: (id: number) => http.delete<void>('/api/comunicados/' + id),
};
