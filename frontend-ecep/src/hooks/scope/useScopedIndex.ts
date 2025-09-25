"use client";

import { useMemo } from "react";
import { useViewerScope } from "./useViewerScope";
import { useActivePeriod } from "./useActivePeriod";
import { useScopedSecciones } from "./useScopedSecciones";
import { useViewerAlumnosLite } from "@/hooks/useViewerAlumnosLite";

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
    periodoEscolar,
    getPeriodoNombre,
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
    alumnos: viewerAlumnos,
    loading: loadingViewerAlumnos,
    error: errorViewerAlumnos,
  } = useViewerAlumnosLite();

  const isFamilyLike = type === "family" || type === "student";

  const loading =
    loadingPeriodo || (isFamilyLike ? loadingViewerAlumnos : loadingSecs);
  const error = isFamilyLike ? errorViewerAlumnos : errorSecs;

  return useMemo(() => {
    if (type === "family" || type === "student") {
      return {
        scope: (type === "family" ? "family" : "student") as const,
        loading,
        error,
        hijos: viewerAlumnos, // array de AlumnoLiteDTO
        secciones: [] as any[], // vacío en family
        titularBySeccionId: new Map<number, string>(),
        periodoEscolarId,
        periodoEscolar,
        getPeriodoNombre,
        hoyISO,
      };
    }
    // staff / teacher
    return {
      scope: (type === "staff" ? "staff" : "teacher") as const,
      loading,
      error,
      hijos: [] as any[], // vacío si no es family/student
      secciones, // array de SeccionDTO
      titularBySeccionId,
      periodoEscolarId,
      periodoEscolar,
      getPeriodoNombre,
      hoyISO,
    };
  }, [
    type,
    loading,
    error,
    viewerAlumnos,
    secciones,
    titularBySeccionId,
    periodoEscolarId,
    periodoEscolar,
    getPeriodoNombre,
    hoyISO,
  ]);
}
