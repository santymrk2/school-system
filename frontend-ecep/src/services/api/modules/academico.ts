import { http } from "../http";
import type * as DTO from "@/types/api-generated";

export const evaluaciones = {
  list: () => http.get<DTO.EvaluacionDTO[]>("/api/evaluaciones"),
  byId: (id: number) => http.get<DTO.EvaluacionDTO>("/api/evaluaciones/" + id),
  create: (body: DTO.EvaluacionCreateDTO) =>
    http.post<number>("/api/evaluaciones", body),
  update: (id: number, body: DTO.EvaluacionDTO) =>
    http.put<void>("/api/evaluaciones/" + id, body),
  delete: (id: number) => http.delete<void>("/api/evaluaciones/" + id),
  search: (params: {
    seccionId?: number;
    trimestreId?: number;
    materiaId?: number;
  }) => http.get<DTO.EvaluacionDTO[]>("/api/evaluaciones", { params }),
};

export const resultados = {
  list: (params?: { evaluacionId?: number; matriculaId?: number }) =>
    http.get<DTO.ResultadoEvaluacionDTO[]>("/api/resultados", { params }),
  byEvaluacion: (evaluacionId: number) =>
    http.get<DTO.ResultadoEvaluacionDTO[]>(
      `/api/resultados/evaluacion/${evaluacionId}`,
    ),
  create: (body: DTO.ResultadoEvaluacionCreateDTO) =>
    http.post<number>("/api/resultados", body),
  update: (id: number, body: DTO.ResultadoEvaluacionUpdateDTO) =>
    http.put<void>(`/api/resultados/${id}`, body),
  delete: (id: number) => http.delete<void>(`/api/resultados/${id}`),
};
export const calificaciones = {
  list: () =>
    http.get<DTO.CalificacionTrimestralDTO[]>(
      "/api/calificaciones-trimestrales",
    ),
  create: (body: DTO.CalificacionTrimestralCreateDTO) =>
    http.post<number>("/api/calificaciones-trimestrales", body),
  byId: (id: number) =>
    http.get<DTO.CalificacionTrimestralDTO>(
      "/api/calificaciones-trimestrales/" + id,
    ),
  update: (id: number, body: DTO.CalificacionTrimestralDTO) =>
    http.put<void>("/api/calificaciones-trimestrales/" + id, body),
  delete: (id: number) =>
    http.delete<void>("/api/calificaciones-trimestrales/" + id),
};

export const informes = {
  list: () => http.get<DTO.InformeInicialDTO[]>("/api/informes-inicial"),
  byId: (id: number) =>
    http.get<DTO.InformeInicialDTO>("/api/informes-inicial/" + id),
  create: (body: DTO.InformeInicialCreateDTO) =>
    http.post<number>("/api/informes-inicial", body),
  update: (id: number, body: DTO.InformeInicialDTO) =>
    http.put<void>("/api/informes-inicial/" + id, body),
  delete: (id: number) => http.delete<void>("/api/informes-inicial/" + id),
};
