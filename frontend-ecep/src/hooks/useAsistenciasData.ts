"use client";

import { useCallback, useEffect, useState } from "react";
import { asistencias, calendario, gestionAcademica } from "@/services/api/modules";
import type {
  TrimestreDTO,
  JornadaAsistenciaDTO,
  DetalleAsistenciaDTO,
  DiaNoHabilDTO,
  SeccionDTO,
  AsignacionDocenteSeccionDTO,
  AlumnoLiteDTO,
} from "@/types/api-generated";
import { toast } from "sonner";
import { useCalendarRefresh } from "@/hooks/useCalendarRefresh";
import { resolveTrimestrePeriodoId } from "@/lib/trimestres";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";

export function useAsistenciasData() {
  const [loading, setLoading] = useState(true);
  const [trimestres, setTrimestres] = useState<TrimestreDTO[]>([]);
  const [secciones, setSecciones] = useState<SeccionDTO[]>([]);
  const [asignaciones, setAsignaciones] = useState<
    AsignacionDocenteSeccionDTO[]
  >([]);
  const [diasNoHabiles, setDiasNoHabiles] = useState<DiaNoHabilDTO[]>([]);

  // cache por sección/fecha
  const [alumnosBySeccion, setAlumnosBySeccion] = useState<
    Record<string, AlumnoLiteDTO[]>
  >({});
  const [jornadas, setJornadas] = useState<JornadaAsistenciaDTO[]>([]);
  const [detalles, setDetalles] = useState<DetalleAsistenciaDTO[]>([]);
  const calendarVersion = useCalendarRefresh("trimestres");
  const { periodoEscolarId, loading: periodoLoading } = useActivePeriod();
  const periodoId = typeof periodoEscolarId === "number" ? periodoEscolarId : null;

  useEffect(() => {
    setAlumnosBySeccion({});
    setJornadas([]);
    setDetalles([]);
  }, [periodoId]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!periodoId) {
          if (!alive) return;
          setTrimestres([]);
          setSecciones([]);
          setAsignaciones([]);
          setDiasNoHabiles([]);
          setLoading(false);
          return;
        }

        setLoading(true);
        const [tri, secs, asig, dias] = await Promise.all([
          calendario.trimestres.list().then((r) => r.data ?? []),
          gestionAcademica.secciones.list().then((r) => r.data ?? []),
          gestionAcademica.asignacionDocenteSeccion.list().then((r) =>
            (r.data ?? []).map((a: any) => ({
              ...a,
              empleadoId: a.empleadoId ?? a.personalId ?? a.docenteId,
            })),
          ),
          calendario.diasNoHabiles.list().then((r) => r.data ?? []),
        ]);

        if (!alive) return;

        const trimestresFiltrados = tri.filter(
          (t) => resolveTrimestrePeriodoId(t) === periodoId,
        );
        const seccionesFiltradas = (secs ?? []).filter((s: any) => {
          const pid =
            s?.periodoEscolarId ?? s?.periodoId ?? s?.periodoEscolar?.id;
          return pid === periodoId;
        });
        const seccionIds = new Set(seccionesFiltradas.map((s) => s.id));
        const asignacionesFiltradas = (asig ?? []).filter((a: any) =>
          a?.seccionId ? seccionIds.has(a.seccionId) : false,
        );

        setTrimestres(trimestresFiltrados);
        setSecciones(seccionesFiltradas);
        setAsignaciones(asignacionesFiltradas);
        setDiasNoHabiles(dias ?? []);
      } catch {
        if (alive) toast.error("Error cargando datos base");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [calendarVersion, periodoId]);

  const loadAlumnosSeccion = async (seccionId: number, fechaISO?: string) => {
    const key = `${seccionId}_${fechaISO ?? ""}`;
    if (alumnosBySeccion[key]) return alumnosBySeccion[key];
    const { data } = await gestionAcademica.secciones.alumnos(seccionId, fechaISO);
    setAlumnosBySeccion((m) => ({ ...m, [key]: data }));
    return data;
  };

  const searchJornadas = async (params: {
    seccionId?: number;
    trimestreId?: number;
    from?: string;
    to?: string;
  }) => {
    if (!periodoId) {
      setJornadas([]);
      return [] as JornadaAsistenciaDTO[];
    }
    const { data } = await asistencias.jornadas.search(params);
    const allowedSecciones = new Set(secciones.map((s) => s.id));
    const filtered = (data ?? []).filter((j) =>
      j.seccionId ? allowedSecciones.has(j.seccionId) : true,
    );
    setJornadas(filtered);
    return filtered;
  };

  const loadDetallesByJornada = async (jornadaId: number) => {
    const { data } = await asistencias.detalles.search({ jornadaId });
    setDetalles((prev) => {
      // merge simple
      const others = prev.filter((p) => p.jornadaId !== jornadaId);
      return [...others, ...data];
    });
    return data;
  };

  const refreshBase = useCallback(async () => {
    if (!periodoId) {
      setTrimestres([]);
      setDiasNoHabiles([]);
      return;
    }
    const [tri, dias] = await Promise.all([
      calendario.trimestres.list().then((r) => r.data ?? []),
      calendario.diasNoHabiles.list().then((r) => r.data ?? []),
    ]);
    const trimestresFiltrados = tri.filter(
      (t) => resolveTrimestrePeriodoId(t) === periodoId,
    );
    setTrimestres(trimestresFiltrados);
    setDiasNoHabiles(dias ?? []);
  }, [periodoId]);

  return {
    loading: loading || periodoLoading,
    periodoEscolarId: periodoId,
    trimestres,
    secciones,
    asignaciones,
    diasNoHabiles,
    alumnosBySeccion,
    jornadas,
    detalles,
    loadAlumnosSeccion,
    searchJornadas,
    loadDetallesByJornada,
    refreshBase,
  };
}
