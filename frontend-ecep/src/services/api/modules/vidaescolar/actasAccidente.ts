import { http } from "@/services/api/http";
import type * as DTO from "@/types/api-generated";

export const actasAccidente = {
  list: () => http.get<DTO.ActaAccidenteDTO[]>("/api/actas-accidente"),
  byId: (id: number) =>
    http.get<DTO.ActaAccidenteDTO>("/api/actas-accidente/" + id),
  create: (body: DTO.ActaAccidenteCreateDTO) =>
    http.post<number>("/api/actas-accidente", body),
  update: (id: number, body: DTO.ActaAccidenteUpdateDTO) =>
    http.put<void>("/api/actas-accidente/" + id, body),
  delete: (id: number) => http.delete<void>("/api/actas-accidente/" + id),
};
