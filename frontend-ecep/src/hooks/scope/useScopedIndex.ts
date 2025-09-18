"use client";

import { useMemo } from "react";
import { useViewerScope } from "./useViewerScope";
import { useActivePeriod } from "./useActivePeriod";
import { useScopedSecciones } from "./useScopedSecciones";
import { useFamilyAlumnos } from "@/hooks/useFamilyAlumnos";

/**
 * Unifica la “pantalla índice”:
 * - staff / teacher → secciones visibles
 * - family → hijos (alumnos)
 *
 * Lo podés usar igual en módulos de exámenes, asistencias y accidentes.
 */
export function useScopedIndex(opts?: {
  includeTitularSec?: boolean; // útil para staff (mostrar titular)
}) {
  const { type } = useViewerScope();
  const {
    loading: loadingPeriodo,
    periodoEscolarId,
    hoyISO,
  } = useActivePeriod();

  // Secciones para staff/teacher
  const {
    loading: loadingSecs,
    error: errorSecs,
    secciones,
    titularBySeccionId,
  } = useScopedSecciones({
    fecha: hoyISO,
    periodoEscolarId: periodoEscolarId ?? undefined,
    includeTitular: !!opts?.includeTitularSec,
  });

  // Hijos para family
  const {
    alumnos,
    loading: loadingHijos,
    error: errorHijos,
  } = useFamilyAlumnos?.() ?? {
    alumnos: [],
    loading: false,
    error: null,
  };

  const loading =
    loadingPeriodo || (type === "family" ? loadingHijos : loadingSecs);
  const error = type === "family" ? errorHijos : errorSecs;

  return useMemo(() => {
    if (type === "family") {
      return {
        scope: "family" as const,
        loading,
        error,
        hijos: alumnos, // array de AlumnoLiteDTO
        secciones: [] as any[], // vacío en family
        titularBySeccionId: new Map<number, string>(),
        periodoEscolarId,
        hoyISO,
      };
    }
    // staff / teacher
    return {
      scope: (type === "staff" ? "staff" : "teacher") as const,
      loading,
      error,
      hijos: [] as any[], // vacío si no es family
      secciones, // array de SeccionDTO
      titularBySeccionId,
      periodoEscolarId,
      hoyISO,
    };
  }, [
    type,
    loading,
    error,
    alumnos,
    secciones,
    titularBySeccionId,
    periodoEscolarId,
    hoyISO,
  ]);
}
