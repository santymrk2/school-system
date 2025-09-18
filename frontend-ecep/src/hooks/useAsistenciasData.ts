"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
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

  useEffect(() => {
    (async () => {
      try {
        const [tri, secs, asig, dias] = await Promise.all([
          api.trimestres.list().then((r) => r.data),
          api.secciones.list().then((r) => r.data),
          api.asignacionDocenteSeccion.list().then((r) =>
            (r.data ?? []).map((a: any) => ({
              ...a,
              empleadoId: a.empleadoId ?? a.personalId ?? a.docenteId,
            })),
          ),
          api.diasNoHabiles.list().then((r) => r.data),
        ]);
        setTrimestres(tri);
        setSecciones(secs);
        setAsignaciones(asig);
        setDiasNoHabiles(dias);
      } catch {
        toast.error("Error cargando datos base");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const loadAlumnosSeccion = async (seccionId: number, fechaISO?: string) => {
    const key = `${seccionId}_${fechaISO ?? ""}`;
    if (alumnosBySeccion[key]) return alumnosBySeccion[key];
    const { data } = await api.secciones.alumnos(seccionId, fechaISO);
    setAlumnosBySeccion((m) => ({ ...m, [key]: data }));
    return data;
  };

  const searchJornadas = async (params: {
    seccionId?: number;
    trimestreId?: number;
    from?: string;
    to?: string;
  }) => {
    const { data } = await api.jornadasAsistencia.search(params);
    setJornadas(data);
    return data;
  };

  const loadDetallesByJornada = async (jornadaId: number) => {
    const { data } = await api.detallesAsistencia.search({ jornadaId });
    setDetalles((prev) => {
      // merge simple
      const others = prev.filter((p) => p.jornadaId !== jornadaId);
      return [...others, ...data];
    });
    return data;
  };

  return {
    loading,
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
    refreshBase: async () => {
      const [tri, dias] = await Promise.all([
        api.trimestres.list().then((r) => r.data),
        api.diasNoHabiles.list().then((r) => r.data),
      ]);
      setTrimestres(tri);
      setDiasNoHabiles(dias);
    },
  };
}
