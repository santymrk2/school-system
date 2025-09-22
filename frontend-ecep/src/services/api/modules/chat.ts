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
  getOnlineStatus: (personaIds: number[]) => {
    const params = new URLSearchParams();

    for (const rawId of personaIds || []) {
      const id = Number(rawId);
      if (!Number.isFinite(id) || id <= 0) continue;

      params.append("personaIds", String(id));
    }

    return http.get<Record<number, boolean>>("/api/chat/online-status", {
      params,
    });
  },
};
