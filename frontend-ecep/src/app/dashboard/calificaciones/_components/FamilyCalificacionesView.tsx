"use client";

import { useEffect, useMemo, useState } from "react";
import LoadingState from "@/components/common/LoadingState";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calendario, gestionAcademica } from "@/services/api/modules";
import type {
  AlumnoLiteDTO,
  CalificacionDTO,
  InformeInicialDTO,
  MateriaDTO,
  SeccionDTO,
  SeccionMateriaDTO,
  TrimestreDTO,
} from "@/types/api-generated";
import { NivelAcademico as NivelAcademicoEnum } from "@/types/api-generated";
import { formatPeriodoLabel, type PeriodoLabelResolver } from "@/lib/periodos";
import {
  getTrimestreEstado,
  resolveTrimestrePeriodoId,
} from "@/lib/trimestres";
import { useCalendarRefresh } from "@/hooks/useCalendarRefresh";

interface FamilyCalificacionesViewProps {
  alumnos: AlumnoLiteDTO[];
  initialLoading?: boolean;
  initialError?: string | null;
  periodoEscolarId?: number | null;
  getPeriodoNombre?: PeriodoLabelResolver;
}

interface MateriaResumen {
  seccionMateriaId: number;
  nombre: string;
}

function resolveNivel(
  alumno: AlumnoLiteDTO | null,
  seccion: SeccionDTO | null,
) {
  if (alumno?.nivel) return alumno.nivel;
  if (seccion?.nivel) return seccion.nivel;
  const nombre = alumno?.seccionNombre ?? seccion?.nombre ?? "";
  if (nombre.toLowerCase().includes("sala")) return NivelAcademicoEnum.INICIAL;
  if (nombre) return NivelAcademicoEnum.PRIMARIO;
  return null;
}

function nivelLabel(nivel: NivelAcademicoEnum | null) {
  if (!nivel) return "Nivel no disponible";
  if (nivel === NivelAcademicoEnum.PRIMARIO) return "Nivel primario";
  if (nivel === NivelAcademicoEnum.INICIAL) return "Nivel inicial";
  return String(nivel);
}

function formatTurnoLabel(turno?: string | null) {
  if (!turno) return null;
  const map: Record<string, string> = { MANANA: "Mañana", TARDE: "Tarde" };
  return map[String(turno).toUpperCase()] ?? turno;
}

function formatTrimestre(trimestre?: TrimestreDTO | null) {
  if (!trimestre) return "Trimestre";
  const numero = trimestre.orden ?? "";
  return numero ? `Trimestre ${numero}` : "Trimestre";
}

function formatNota(cal?: CalificacionDTO | null) {
  if (!cal) return "Sin calificación";
  if (typeof cal.notaConceptual === "string" && cal.notaConceptual.length) {
    return cal.notaConceptual;
  }
  if (typeof cal.notaNumerica === "number") {
    return `${cal.notaNumerica}`;
  }
  return "Sin calificación";
}

export default function FamilyCalificacionesView({
  alumnos,
  initialLoading,
  initialError,
  periodoEscolarId,
  getPeriodoNombre,
}: FamilyCalificacionesViewProps) {
  const [selectedMatriculaId, setSelectedMatriculaId] = useState<number | null>(
    null,
  );
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState<string | null>(null);
  const [seccionById, setSeccionById] = useState<Map<number, SeccionDTO>>(
    new Map(),
  );
  const [materiasPorSeccion, setMateriasPorSeccion] = useState<
    Map<number, MateriaResumen[]>
  >(new Map());
  const [trimestres, setTrimestres] = useState<TrimestreDTO[]>([]);
  const [calificaciones, setCalificaciones] = useState<CalificacionDTO[]>([]);
  const [informes, setInformes] = useState<InformeInicialDTO[]>([]);
  const calendarVersion = useCalendarRefresh("trimestres");

  const activePeriodId =
    typeof periodoEscolarId === "number" ? periodoEscolarId : null;

  const resolvePeriodoNombre = (
    periodoId?: number | null,
    periodo?: { anio?: number } | null,
  ) =>
    getPeriodoNombre?.(periodoId, periodo ?? null) ??
    formatPeriodoLabel(periodo ?? null, periodoId);

  useEffect(() => {
    if (!alumnos.length) {
      setSelectedMatriculaId(null);
      return;
    }
    setSelectedMatriculaId((prev) => {
      if (prev && alumnos.some((al) => al.matriculaId === prev)) return prev;
      return alumnos[0].matriculaId;
    });
  }, [alumnos]);

  const matriculaIds = useMemo(
    () =>
      alumnos
        .map((al) => al.matriculaId)
        .filter((id): id is number => typeof id === "number" && id > 0),
    [alumnos],
  );

  const seccionIds = useMemo(
    () =>
      alumnos
        .map((al) => al.seccionId)
        .filter((id): id is number => typeof id === "number" && id > 0),
    [alumnos],
  );

  useEffect(() => {
    if (!matriculaIds.length && !seccionIds.length) {
      setSeccionById(new Map());
      setMateriasPorSeccion(new Map());
      setCalificaciones([]);
      setInformes([]);
      setErrorDetalle(null);
      setLoadingDetalle(false);
      return;
    }

    let alive = true;
    (async () => {
      try {
        setLoadingDetalle(true);
        setErrorDetalle(null);

        const [
          seccionesRes,
          seccionMateriasRes,
          materiasRes,
          trimestresRes,
          calificacionesRes,
          informesRes,
        ] = await Promise.all([
          gestionAcademica.secciones
            .list()
            .catch(() => ({ data: [] as SeccionDTO[] })),
          gestionAcademica.seccionMaterias
            .list()
            .catch(() => ({ data: [] as SeccionMateriaDTO[] })),
          gestionAcademica.materias
            .list()
            .catch(() => ({ data: [] as MateriaDTO[] })),
          calendario.trimestres
            .list()
            .catch(() => ({ data: [] as TrimestreDTO[] })),
          gestionAcademica.calificaciones
            .list()
            .catch(() => ({ data: [] as CalificacionDTO[] })),
          gestionAcademica.informes
            .list()
            .catch(() => ({ data: [] as InformeInicialDTO[] })),
        ]);

        if (!alive) return;

        const seccionMap = new Map<number, SeccionDTO>();
        for (const sec of seccionesRes.data ?? []) {
          if (sec.id != null) seccionMap.set(sec.id, sec);
        }
        setSeccionById(seccionMap);

        const materiaNombreById = new Map<number, string>();
        for (const materia of materiasRes.data ?? []) {
          if (materia.id != null) {
            materiaNombreById.set(materia.id, materia.nombre ?? "Materia");
          }
        }

        const materiasMap = new Map<number, MateriaResumen[]>();
        for (const sm of seccionMateriasRes.data ?? []) {
          const sid = (sm as any).seccionId as number | undefined;
          const materiaId = (sm as any).materiaId as number | undefined;
          if (!sid || !materiaId) continue;
          if (!seccionIds.includes(sid)) continue;
          const lista = materiasMap.get(sid) ?? [];
          lista.push({
            seccionMateriaId: sm.id,
            nombre: materiaNombreById.get(materiaId) ?? `Materia #${materiaId}`,
          });
          materiasMap.set(sid, lista);
        }
        for (const lista of materiasMap.values()) {
          lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
        }
        setMateriasPorSeccion(materiasMap);

        const allowedPeriodoIds = new Set<number>();
        if (typeof periodoEscolarId === "number") {
          allowedPeriodoIds.add(periodoEscolarId);
        } else {
          for (const sec of seccionesRes.data ?? []) {
            const sid = sec.id;
            if (sid == null || !seccionIds.includes(sid)) continue;
            const pid =
              (sec as any).periodoEscolarId ??
              (sec as any).periodoId ??
              (sec as any).periodoEscolar?.id ??
              null;
            if (typeof pid === "number") {
              allowedPeriodoIds.add(pid);
            }
          }
        }

        const allTrimestres = trimestresRes.data ?? [];
        const allTrimestresById = new Map<number, TrimestreDTO>();
        for (const tri of allTrimestres) {
          if (tri.id != null) {
            allTrimestresById.set(tri.id, tri);
          }
        }
        const filteredTrimestres =
          allowedPeriodoIds.size > 0
            ? allTrimestres.filter((tri) => {
                const pid = resolveTrimestrePeriodoId(tri, null);
                return typeof pid === "number" && allowedPeriodoIds.has(pid);
              })
            : allTrimestres;
        setTrimestres(filteredTrimestres);

        const allowedTrimestreIds =
          allowedPeriodoIds.size > 0
            ? new Set(
                filteredTrimestres
                  .map((tri) => tri.id)
                  .filter((id): id is number => typeof id === "number"),
              )
            : null;

        const califs = (calificacionesRes.data ?? []).filter((cal) => {
          if (!matriculaIds.includes(cal.matriculaId ?? -1)) return false;
          const triId =
            cal.trimestreId ??
            (cal as any).trimestreId ??
            (cal as any).trimestre?.id ??
            null;
          if (typeof triId !== "number") return false;
          if (
            allowedTrimestreIds &&
            allowedTrimestreIds.size > 0 &&
            !allowedTrimestreIds.has(triId)
          ) {
            return false;
          }
          const trimestre = allTrimestresById.get(triId);
          return getTrimestreEstado(trimestre) === "cerrado";
        });
        setCalificaciones(califs);

        const informesFiltrados = (informesRes.data ?? []).filter((inf) => {
          if (!matriculaIds.includes(inf.matriculaId ?? -1)) return false;
          if (!allowedTrimestreIds || allowedTrimestreIds.size === 0)
            return true;
          const triId =
            inf.trimestreId ??
            (inf as any).trimestreId ??
            (inf as any).trimestre?.id ??
            null;
          return typeof triId === "number" && allowedTrimestreIds.has(triId);
        });
        setInformes(informesFiltrados);
      } catch (error: any) {
        if (!alive) return;
        setErrorDetalle(
          error?.response?.data?.message ??
            error?.message ??
            "No se pudo cargar la información académica.",
        );
      } finally {
        if (alive) setLoadingDetalle(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [matriculaIds, seccionIds, periodoEscolarId, calendarVersion]);

  const trimestresOrdenados = useMemo(
    () => [...trimestres].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)),
    [trimestres],
  );

  const trimestresPorPeriodo = useMemo(() => {
    const map = new Map<number, TrimestreDTO[]>();
    for (const tri of trimestres) {
      const periodoId = resolveTrimestrePeriodoId(tri, undefined);
      if (typeof periodoId !== "number") continue;
      const lista = map.get(periodoId) ?? [];
      lista.push(tri);
      map.set(periodoId, lista);
    }
    for (const lista of map.values()) {
      lista.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
    }
    return map;
  }, [trimestres]);

  if (initialLoading) {
    return <LoadingState label="Cargando calificaciones…" />;
  }

  if (initialError) {
    return <div className="text-sm text-red-600">{initialError}</div>;
  }

  if (!alumnos.length) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        No hay alumnos asociados a esta cuenta.
      </div>
    );
  }

  return (
    <Tabs
      value={selectedMatriculaId ? String(selectedMatriculaId) : ""}
      onValueChange={(value) => setSelectedMatriculaId(Number(value))}
      className="space-y-6"
    >
      <TabsList className="w-full justify-start overflow-x-auto md:overflow-visible">
        {alumnos.map((alumno) => (
          <TabsTrigger
            key={alumno.matriculaId}
            value={String(alumno.matriculaId)}
          >
            {alumno.nombreCompleto}
          </TabsTrigger>
        ))}
      </TabsList>

      {alumnos.map((alumno) => {
        const seccion = alumno.seccionId
          ? (seccionById.get(alumno.seccionId) ?? null)
          : null;
        const nivel = resolveNivel(alumno, seccion);
        const turno = formatTurnoLabel(seccion?.turno);
        const materiasSeccion = alumno.seccionId
          ? (materiasPorSeccion.get(alumno.seccionId) ?? [])
          : [];

        const seccionPeriodoId = seccion
          ? ((seccion as any).periodoEscolarId ??
            (seccion as any).periodoId ??
            (seccion as any).periodoEscolar?.id ??
            null)
          : null;
        const basePorSeccion =
          typeof seccionPeriodoId === "number"
            ? (trimestresPorPeriodo.get(seccionPeriodoId) ?? [])
            : [];
        const basePorPeriodoActivo =
          activePeriodId != null
            ? (trimestresPorPeriodo.get(activePeriodId) ?? [])
            : [];
        const trimestresAlumnoBase =
          basePorSeccion.length > 0 ? basePorSeccion : basePorPeriodoActivo;
        const trimestresAlumno = trimestresAlumnoBase.length
          ? trimestresAlumnoBase
          : trimestresOrdenados;
        const trimestreIdsAlumno = new Set(
          trimestresAlumno
            .map((tri) => tri.id)
            .filter((id): id is number => typeof id === "number"),
        );

        const calificacionesAlumno = calificaciones.filter((cal) => {
          if (cal.matriculaId !== alumno.matriculaId) return false;
          if (trimestreIdsAlumno.size === 0) return true;
          const triId =
            cal.trimestreId ??
            (cal as any).trimestreId ??
            (cal as any).trimestre?.id ??
            null;
          return typeof triId === "number" && trimestreIdsAlumno.has(triId);
        });
        const calificacionesMap = new Map<string, CalificacionDTO>();
        for (const cal of calificacionesAlumno) {
          const smId = (cal as any).seccionMateriaId as number | undefined;
          const triId =
            cal.trimestreId ??
            (cal as any).trimestreId ??
            (cal as any).trimestre?.id ??
            null;
          if (!smId || typeof triId !== "number") continue;
          calificacionesMap.set(`${smId}-${triId}`, cal);
        }

        const informesAlumno = informes.filter((inf) => {
          if (inf.matriculaId !== alumno.matriculaId) return false;
          if (trimestreIdsAlumno.size === 0) return true;
          return (
            typeof inf.trimestreId === "number" &&
            trimestreIdsAlumno.has(inf.trimestreId)
          );
        });
        const informesMap = new Map<number, InformeInicialDTO>();
        for (const inf of informesAlumno) {
          if (inf.trimestreId != null) {
            informesMap.set(inf.trimestreId, inf);
          }
        }

        return (
          <TabsContent
            key={alumno.matriculaId}
            value={String(alumno.matriculaId)}
            className="space-y-4 focus-visible:outline-none"
          >
            {loadingDetalle ? (
              <LoadingState label="Cargando detalle de calificaciones…" />
            ) : errorDetalle ? (
              <div className="text-sm text-red-600">{errorDetalle}</div>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {alumno.seccionNombre ?? seccion?.nombre ?? "Sección"}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{nivelLabel(nivel)}</Badge>
                      {turno && <Badge variant="outline">Turno {turno}</Badge>}
                      {seccion?.periodoEscolarId && (
                        <Badge variant="outline">
                          Período{" "}
                          {resolvePeriodoNombre(
                            seccion.periodoEscolarId,
                            ((seccion as any)?.periodoEscolar ?? null) as {
                              anio?: number;
                            } | null,
                          )}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                </Card>

                {nivel === NivelAcademicoEnum.PRIMARIO ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Materias y calificaciones</CardTitle>
                      <CardDescription>
                        Calificaciones registradas por materia y trimestre.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {materiasSeccion.length ? (
                        <div className="grid gap-4 md:grid-cols-2">
                          {materiasSeccion.map((materia) => {
                            const registrosMateria =
                              calificacionesAlumno.filter(
                                (cal) =>
                                  (cal as any).seccionMateriaId ===
                                  materia.seccionMateriaId,
                              ).length;

                            return (
                              <Card
                                key={materia.seccionMateriaId}
                                className="border shadow-sm"
                              >
                                <CardHeader className="space-y-1 pb-3">
                                  <div className="flex items-start justify-between gap-3">
                                    <CardTitle className="text-base">
                                      {materia.nombre}
                                    </CardTitle>
                                    <Badge
                                      variant="secondary"
                                      className="shrink-0"
                                    >
                                      {registrosMateria} registro
                                      {registrosMateria === 1 ? "" : "s"}
                                    </Badge>
                                  </div>
                                  <CardDescription className="text-xs">
                                    Calificaciones por trimestre cerradas por la
                                    dirección.
                                  </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                  {trimestresAlumno.map((tri) => {
                                    if (tri.id == null) return null;
                                    const trimestreEstado =
                                      getTrimestreEstado(tri);
                                    const esTrimestreCerrado =
                                      trimestreEstado === "cerrado";
                                    const cal = esTrimestreCerrado
                                      ? calificacionesMap.get(
                                          `${materia.seccionMateriaId}-${tri.id}`,
                                        )
                                      : undefined;
                                    const badgeVariant =
                                      esTrimestreCerrado && cal
                                        ? "default"
                                        : "outline";
                                    const badgeLabel = esTrimestreCerrado
                                      ? formatNota(cal)
                                      : "Pendiente";
                                    const observacionesTexto =
                                      esTrimestreCerrado
                                        ? cal?.observaciones?.trim() ||
                                          "Sin observaciones"
                                        : "Las calificaciones estarán disponibles una vez que la dirección cierre el trimestre.";

                                    return (
                                      <div
                                        key={`${materia.seccionMateriaId}-${tri.id}`}
                                        className="rounded-lg border bg-muted/30 p-3"
                                      >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                          <span className="font-semibold">
                                            {formatTrimestre(tri)}
                                          </span>
                                          <Badge variant={badgeVariant}>
                                            {badgeLabel}
                                          </Badge>
                                        </div>
                                        <p className="mt-2 text-xs text-muted-foreground whitespace-pre-line">
                                          {observacionesTexto}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          No hay materias registradas para esta sección.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Informes trimestrales</CardTitle>
                      <CardDescription>
                        Seguimiento descriptivo del desarrollo del alumno.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      {trimestresAlumno.map((tri) => {
                        if (tri.id == null) return null;
                        const informe = informesMap.get(tri.id);
                        return (
                          <div
                            key={`informe-${tri.id}`}
                            className="rounded-lg border p-3"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold">
                                {formatTrimestre(tri)}
                              </span>
                              <Badge variant={informe ? "default" : "outline"}>
                                {informe ? "Disponible" : "Pendiente"}
                              </Badge>
                            </div>
                            <p className="mt-2 text-muted-foreground whitespace-pre-line">
                              {informe?.descripcion?.trim() ||
                                "Sin descripción registrada."}
                            </p>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
