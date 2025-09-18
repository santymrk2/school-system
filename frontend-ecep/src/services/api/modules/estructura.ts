import { http } from "../http";
import type * as DTO from "@/types/api-generated";

export const materias = {
  list: () => http.get<DTO.MateriaDTO[]>("/api/materias"),
  byId: (id: number) => http.get<DTO.MateriaDTO>("/api/materias/" + id),
  create: (body: DTO.MateriaCreateDTO) =>
    http.post<number>("/api/materias", body),
  update: (id: number, body: DTO.MateriaCreateDTO) =>
    http.put<void>("/api/materias/" + id, body),
  delete: (id: number) => http.delete<void>("/api/materias/" + id),
};

export const seccionMaterias = {
  list: () => http.get<DTO.SeccionMateriaDTO[]>("/api/secciones-materias"),
  create: (body: DTO.SeccionMateriaCreateDTO) =>
    http.post<number>("/api/secciones-materias", body),
};
