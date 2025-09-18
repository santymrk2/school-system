// src/hooks/useRecentMessages.ts
"use client";
import { useEffect, useState } from "react";
import { api } from "@/services/api";

type RecentItem = {
  userId: number;
  nombre: string;
  lastMessage: string;
  at: string;
};

export function useRecentMessages(limit = 5) {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const active = (await api.chat.getActiveChats()).data ?? [];
        const enriched = await Promise.all(
          active.slice(0, limit).map(async (c: any) => {
            const hist =
              (await api.chat.history(c.id ?? c.userId, { limit: 1 })).data ??
              [];
            const last = hist[hist.length - 1];
            return {
              userId: c.id ?? c.userId,
              nombre: c.nombre ?? c.email ?? `Usuario ${c.id ?? c.userId}`,
              lastMessage: last?.contenido ?? last?.message ?? "",
              at: last?.fechaEnvio ?? last?.sentAt ?? "",
            } as RecentItem;
          }),
        );
        if (alive) setItems(enriched);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [limit]);

  return { items, loading };
}
