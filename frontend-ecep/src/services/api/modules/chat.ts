import { http } from "../http";
import type * as DTO from "@/types/api-generated";

export const chat = {
  history: (personaId: number, params?: { limit?: number }) =>
    http.get<DTO.ChatMessageDTO[]>(`/api/chat/history/${personaId}`, {
      params,
    }),
  markRead: (otherPersonaId: number) =>
    http.post(`/api/chat/mark-read/${otherPersonaId}`),
  getActiveChats: () =>
    http.get<DTO.PersonaResumenDTO[]>("/api/chat/active-chats"),
  getUnreadCounts: () =>
    http.get<Record<number, number>>("/api/chat/unread-count"),
  getOnlineStatus: (personaIds: number[]) =>
    http.get<Record<number, boolean>>("/api/chat/online-status", {
      params: { personaIds },
    }),
};
