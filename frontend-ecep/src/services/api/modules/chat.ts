import { http } from "../http";
import type * as DTO from "@/types/api-generated";

export const chat = {
  history: (userId: number, params?: { limit?: number }) =>
    http.get<any[]>(`/api/chat/history/${userId}`, { params }),
  markRead: (otherUserId: number) =>
    http.post("/api/chat/mark-read/" + otherUserId),
  getActiveChats: () =>
    http.get<DTO.UsuarioBusquedaDTO[]>("/api/chat/active-chats"),
  getUnreadCounts: () =>
    http.get<Record<number, number>>("/api/chat/unread-count"),
};
