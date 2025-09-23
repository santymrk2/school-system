// hooks/useFamilyAlumnos.ts
"use client";

import { useEffect, useState } from "react";
import { identidad } from "@/services/api/modules";
import { useAuth } from "@/hooks/useAuth";
import type { AlumnoLiteDTO } from "@/types/api-generated";

export function useFamilyAlumnos() {
  const { user } = useAuth();
  // En tu AuthContext venías usando user.personaId para "persona" asociada.
  // Para familiares, asumimos que personaId === familiarId.
  const familiarId = user?.personaId ?? null;

  const [loading, setLoading] = useState(true);
  const [alumnos, setAlumnos] = useState<AlumnoLiteDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!familiarId) {
          if (mounted) {
            setAlumnos([]);
            setLoading(false);
          }
          return;
        }
        setLoading(true);
        const res = await identidad.familiaresAlumnos.byFamiliarId(familiarId);
        if (mounted) {
          setAlumnos(res.data ?? []);
          setError(null);
        }
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "Error cargando hijos");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [familiarId]);

  return { loading, error, alumnos };
}
