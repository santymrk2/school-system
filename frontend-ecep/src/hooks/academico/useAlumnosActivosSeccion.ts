// src/hooks/academico/useAlumnosActivosSeccion.ts
"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import type { AlumnoLiteDTO } from "@/types/api-generated";

export function useAlumnosActivosSeccion(seccionId?: number) {
  const [alumnos, setAlumnos] = useState<AlumnoLiteDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        if (!seccionId) {
          setAlumnos([]);
          return;
        }
        // ❌ sin fecha; el servicio maneja fallback
        const res = await api.seccionesAlumnos.bySeccionId(seccionId);
        if (!alive) return;
        setAlumnos(res.data ?? []);
      } catch (e) {
        if (!alive) return;
        setAlumnos([]);
        setError(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [seccionId]);

  return { alumnos, loading, error };
}
