// src/hooks/useRecentMessages.ts
"use client";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import type { PersonaResumenDTO } from "@/types/api-generated";

type RecentItem = {
  userId: number;
  nombre: string;
  lastMessage: string;
  at: string;
};

const getPersonaDisplayName = (persona: PersonaResumenDTO) => {
  if (persona.nombreCompleto && persona.nombreCompleto.trim()) {
    return persona.nombreCompleto;
  }
  const composed = [persona.apellido, persona.nombre]
    .filter((value) => value && value.trim())
    .join(", ");
  if (composed) return composed;
  if (persona.email) return persona.email;
  if (persona.dni) return `DNI ${persona.dni}`;
  return `Persona ${persona.id}`;
};

export function useRecentMessages(limit = 5) {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const active = ((await api.chat.getActiveChats()).data ?? []) as PersonaResumenDTO[];
        const enriched = await Promise.all(
          active.slice(0, limit).map(async (persona) => {
            const hist = (await api.chat.history(persona.id, { limit: 1 })).data ?? [];
            const last = hist[hist.length - 1];
            return {
              userId: persona.id,
              nombre: getPersonaDisplayName(persona),
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
