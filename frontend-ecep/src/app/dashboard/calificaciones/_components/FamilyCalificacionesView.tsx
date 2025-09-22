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
import { api } from "@/services/api";
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

interface FamilyCalificacionesViewProps {
  alumnos: AlumnoLiteDTO[];
  initialLoading?: boolean;
  initialError?: string | null;
}

interface MateriaResumen {
  seccionMateriaId: number;
  nombre: string;
}

function resolveNivel(alumno: AlumnoLiteDTO | null, seccion: SeccionDTO | null) {
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
          api.secciones.list().catch(() => ({ data: [] as SeccionDTO[] })),
          api.seccionMaterias
            .list()
            .catch(() => ({ data: [] as SeccionMateriaDTO[] })),
          api.materias.list().catch(() => ({ data: [] as MateriaDTO[] })),
          api.trimestres.list().catch(() => ({ data: [] as TrimestreDTO[] })),
          api.calificaciones.list().catch(() => ({ data: [] as CalificacionDTO[] })),
          api.informes.list().catch(() => ({ data: [] as InformeInicialDTO[] })),
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

        const trimestresOrdenados = [...(trimestresRes.data ?? [])].sort(
          (a, b) => (a.orden ?? 0) - (b.orden ?? 0),
        );
        setTrimestres(trimestresOrdenados);

        const califs = (calificacionesRes.data ?? []).filter((cal) =>
          matriculaIds.includes(cal.matriculaId ?? -1),
        );
        setCalificaciones(califs);

        const informesFiltrados = (informesRes.data ?? []).filter((inf) =>
          matriculaIds.includes(inf.matriculaId ?? -1),
        );
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
  }, [matriculaIds, seccionIds]);

  const trimestresOrdenados = useMemo(
    () => [...trimestres].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)),
    [trimestres],
  );

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
      <TabsList className="w-full justify-start overflow-x-auto">
        {alumnos.map((alumno) => (
          <TabsTrigger key={alumno.matriculaId} value={String(alumno.matriculaId)}>
            {alumno.nombreCompleto}
          </TabsTrigger>
        ))}
      </TabsList>

      {alumnos.map((alumno) => {
        const seccion = alumno.seccionId
          ? seccionById.get(alumno.seccionId) ?? null
          : null;
        const nivel = resolveNivel(alumno, seccion);
        const turno = formatTurnoLabel(seccion?.turno);
        const materiasSeccion = alumno.seccionId
          ? materiasPorSeccion.get(alumno.seccionId) ?? []
          : [];
        const calificacionesAlumno = calificaciones.filter(
          (cal) => cal.matriculaId === alumno.matriculaId,
        );
        const calificacionesMap = new Map<string, CalificacionDTO>();
        for (const cal of calificacionesAlumno) {
          const smId = (cal as any).seccionMateriaId as number | undefined;
          const triId = cal.trimestreId ?? (cal as any).trimestreId ?? null;
          if (!smId || triId == null) continue;
          calificacionesMap.set(`${smId}-${triId}`, cal);
        }

        const informesAlumno = informes.filter(
          (inf) => inf.matriculaId === alumno.matriculaId,
        );
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
                    <CardDescription className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{nivelLabel(nivel)}</Badge>
                      {turno && <Badge variant="outline">Turno {turno}</Badge>}
                      {seccion?.periodoEscolarId && (
                        <Badge variant="outline">
                          Período {seccion.periodoEscolarId}
                        </Badge>
                      )}
                    </CardDescription>
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
                        materiasSeccion.map((materia) => (
                          <div
                            key={materia.seccionMateriaId}
                            className="rounded-lg border p-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-medium">{materia.nombre}</span>
                              <Badge variant="secondary">
                                {calificacionesAlumno.filter(
                                  (cal) =>
                                    (cal as any).seccionMateriaId ===
                                    materia.seccionMateriaId,
                                ).length}
                                {" "}
                                registro(s)
                              </Badge>
                            </div>
                            <div className="mt-3 space-y-3 text-sm">
                              {trimestresOrdenados.map((tri) => {
                                if (tri.id == null) return null;
                                const cal = calificacionesMap.get(
                                  `${materia.seccionMateriaId}-${tri.id}`,
                                );
                                return (
                                  <div
                                    key={`${materia.seccionMateriaId}-${tri.id}`}
                                    className="rounded border p-3"
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <span className="font-semibold">
                                        {formatTrimestre(tri)}
                                      </span>
                                      <Badge variant={cal ? "default" : "outline"}>
                                        {formatNota(cal)}
                                      </Badge>
                                    </div>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                      {cal?.observaciones
                                        ? cal.observaciones
                                        : "Sin observaciones"}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))
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
                      {trimestresOrdenados.map((tri) => {
                        if (tri.id == null) return null;
                        const informe = informesMap.get(tri.id);
                        return (
                          <div
                            key={`informe-${tri.id}`}
                            className="rounded border p-3"
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
