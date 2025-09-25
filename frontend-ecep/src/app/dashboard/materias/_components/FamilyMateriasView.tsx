"use client";

import { useEffect, useState } from "react";
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
import { gestionAcademica, identidad } from "@/services/api/modules";
import { pageContent } from "@/lib/page-response";
import type {
  AlumnoLiteDTO,
  EmpleadoDTO,
  MateriaDTO,
  PersonaDTO,
  SeccionDTO,
  SeccionMateriaDTO,
} from "@/types/api-generated";
import { NivelAcademico as NivelAcademicoEnum } from "@/types/api-generated";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";

type DocenteAsignado = {
  nombre: string;
  rol: string;
};

type MateriaDetalle = {
  id: number;
  nombre: string;
  docentes: DocenteAsignado[];
};

type SeccionDetalle = {
  seccion: SeccionDTO | null;
  materias: MateriaDetalle[];
  docentesSeccion: DocenteAsignado[];
};

interface FamilyMateriasViewProps {
  alumnos: AlumnoLiteDTO[];
  initialLoading?: boolean;
  initialError?: string | null;
}

function resolveNivel(alumno: AlumnoLiteDTO | null, detalle: SeccionDetalle | null) {
  if (alumno?.nivel) return alumno.nivel;
  if (detalle?.seccion?.nivel) return detalle.seccion.nivel;
  const nombre = alumno?.seccionNombre ?? detalle?.seccion?.nombre ?? "";
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

function formatTurno(turno?: string | null) {
  if (!turno) return null;
  const map: Record<string, string> = { MANANA: "Mañana", TARDE: "Tarde" };
  return map[String(turno).toUpperCase()] ?? turno;
}

function formatRolMateria(raw?: string | null) {
  if (!raw) return "Docente";
  const value = String(raw).toUpperCase();
  if (value === "TITULAR") return "Docente titular";
  if (value === "SUPLENTE") return "Docente suplente";
  return raw.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatRolSeccion(raw?: string | null) {
  if (!raw) return "Docente";
  const value = String(raw).toUpperCase();
  if (value === "MAESTRO_TITULAR") return "Maestro/a titular";
  if (value === "MAESTRO_SUPLENTE") return "Maestro/a suplente";
  if (value === "PROFESOR") return "Profesor/a";
  return raw.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
}

function vigente(desde?: string | null, hasta?: string | null, hoyISO?: string) {
  const today = hoyISO ?? new Date().toISOString().slice(0, 10);
  return (!desde || today >= desde) && (!hasta || today <= hasta);
}

export default function FamilyMateriasView({
  alumnos,
  initialLoading,
  initialError,
}: FamilyMateriasViewProps) {
  const { getPeriodoNombre } = useActivePeriod();
  const [selectedMatriculaId, setSelectedMatriculaId] = useState<number | null>(
    null,
  );
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState<string | null>(null);
  const [detalles, setDetalles] = useState<Map<number, SeccionDetalle>>(new Map());

  useEffect(() => {
    if (!alumnos.length) {
      setSelectedMatriculaId(null);
      return;
    }
    setSelectedMatriculaId((prev) => {
      if (prev && alumnos.some((a) => a.matriculaId === prev)) return prev;
      return alumnos[0].matriculaId;
    });
  }, [alumnos]);

  useEffect(() => {
    const seccionIds = Array.from(
      new Set(
        alumnos
          .map((a) => a.seccionId)
          .filter((id): id is number => typeof id === "number" && id > 0),
      ),
    );

    if (!seccionIds.length) {
      setDetalles(new Map());
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
          asigMateriaRes,
          asigSeccionRes,
          empleadosRes,
        ] = await Promise.all([
          gestionAcademica.secciones.list().catch(() => ({ data: [] as SeccionDTO[] })),
          gestionAcademica.seccionMaterias
            .list()
            .catch(() => ({ data: [] as SeccionMateriaDTO[] })),
          gestionAcademica.materias.list().catch(() => ({ data: [] as MateriaDTO[] })),
          gestionAcademica.asignacionDocenteMateria
            .list()
            .catch(() => ({ data: [] as any[] })),
          gestionAcademica.asignacionDocenteSeccion
            .list()
            .catch(() => ({ data: [] as any[] })),
          identidad.empleados.list().catch(() => ({ data: [] as EmpleadoDTO[] })),
        ]);

        if (!alive) return;

        const secciones = (seccionesRes.data ?? []).filter((s) =>
          seccionIds.includes(s.id ?? -1),
        );
        const seccionById = new Map<number, SeccionDTO>();
        for (const sec of secciones) {
          if (sec.id != null) seccionById.set(sec.id, sec);
        }

        const seccionMaterias = (seccionMateriasRes.data ?? []).filter((sm) =>
          seccionIds.includes((sm as any).seccionId ?? -1),
        );
        const materias = materiasRes.data ?? [];
        const materiaNombreById = new Map<number, string>();
        for (const mat of materias) {
          if (mat.id != null) materiaNombreById.set(mat.id, mat.nombre ?? "");
        }

        const empleados = pageContent<EmpleadoDTO>(empleadosRes.data);
        const empleadoById = new Map<number, EmpleadoDTO>();
        const personaIds = new Set<number>();
        for (const emp of empleados) {
          if (emp.id != null) empleadoById.set(emp.id, emp);
          if (emp.personaId != null) personaIds.add(emp.personaId);
        }

        const personaEntries = await Promise.all(
          Array.from(personaIds).map(async (pid) => {
            try {
              const res = await identidad.personasCore.getById(pid);
              return [pid, res.data ?? null] as const;
            } catch {
              return [pid, null] as const;
            }
          }),
        );
        const personaById = new Map<number, PersonaDTO | null>(personaEntries);

        const nombreEmpleado = (empleadoId?: number | null) => {
          if (!empleadoId) return null;
          const empleado = empleadoById.get(empleadoId);
          if (!empleado) return `Empleado #${empleadoId}`;
          const persona = empleado.personaId
            ? personaById.get(empleado.personaId)
            : null;
          const nombre = `${persona?.apellido ?? ""} ${persona?.nombre ?? ""}`
            .trim()
            .replace(/\s+/g, " ");
          return nombre || `Empleado #${empleadoId}`;
        };

        const hoyISO = new Date().toISOString().slice(0, 10);
        const detallesMap = new Map<number, SeccionDetalle>();

        for (const seccionId of seccionIds) {
          const materiasDeSeccion = seccionMaterias.filter(
            (sm) => (sm as any).seccionId === seccionId,
          );

          const docentesSeccion = (asigSeccionRes.data ?? [])
            .filter((a: any) => (a.seccionId ?? a.seccion?.id) === seccionId)
            .filter((a: any) =>
              vigente(a.vigenciaDesde ?? a.desde, a.vigenciaHasta ?? a.hasta, hoyISO),
            )
            .map((a: any) => {
              const empleadoId =
                a.empleadoId ?? a.personalId ?? a.docenteId ?? null;
              return {
                nombre: nombreEmpleado(empleadoId) ?? "Docente asignado",
                rol: formatRolSeccion(a.rol ?? a.tipo ?? null),
              } satisfies DocenteAsignado;
            });

          const materiasDetalle: MateriaDetalle[] = materiasDeSeccion.map((sm) => {
            const materiaId = (sm as any).materiaId as number | undefined;
            const nombre = materiaId
              ? materiaNombreById.get(materiaId) ?? `Materia #${materiaId}`
              : "Materia";

            const docentes = (asigMateriaRes.data ?? [])
              .filter(
                (a: any) =>
                  (a.seccionMateriaId ?? a.seccionMateria?.id) === sm.id,
              )
              .filter((a: any) =>
                vigente(a.vigenciaDesde ?? a.desde, a.vigenciaHasta ?? a.hasta, hoyISO),
              )
              .map((a: any) => {
                const empleadoId =
                  a.empleadoId ?? a.personalId ?? a.docenteId ?? null;
                return {
                  nombre: nombreEmpleado(empleadoId) ?? "Docente asignado",
                  rol: formatRolMateria(a.rol ?? null),
                } satisfies DocenteAsignado;
              });

            return {
              id: sm.id,
              nombre,
              docentes,
            } satisfies MateriaDetalle;
          });

          detallesMap.set(seccionId, {
            seccion: seccionById.get(seccionId) ?? null,
            materias: materiasDetalle,
            docentesSeccion,
          });
        }

        if (alive) setDetalles(detallesMap);
      } catch (error: any) {
        if (!alive) return;
        setErrorDetalle(
          error?.response?.data?.message ??
            error?.message ??
            "No se pudo cargar la información de docentes.",
        );
      } finally {
        if (alive) setLoadingDetalle(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [alumnos]);

  if (initialLoading) {
    return <LoadingState label="Cargando información académica…" />;
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
        const detalle = alumno.seccionId
          ? detalles.get(alumno.seccionId) ?? null
          : null;
        const nivel = resolveNivel(alumno, detalle);
        const turno = detalle?.seccion?.turno
          ? formatTurno(detalle.seccion.turno)
          : null;
        const periodoLabel = getPeriodoNombre(
          detalle?.seccion?.periodoEscolarId ?? null,
        );

        return (
          <TabsContent
            key={alumno.matriculaId}
            value={String(alumno.matriculaId)}
            className="space-y-4 focus-visible:outline-none"
          >
            {loadingDetalle ? (
              <LoadingState label="Cargando docentes y materias…" />
            ) : errorDetalle ? (
              <div className="text-sm text-red-600">{errorDetalle}</div>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{
                      alumno.seccionNombre ??
                      detalle?.seccion?.nombre ??
                      "Sección sin nombre"
                    }</CardTitle>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{nivelLabel(nivel)}</Badge>
                      {turno && <Badge variant="outline">Turno {turno}</Badge>}
                      {periodoLabel && (
                        <Badge variant="outline">Período {periodoLabel}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {detalle?.docentesSeccion?.length ? (
                      <div className="space-y-1">
                        {detalle.docentesSeccion.map((docente, idx) => (
                          <div
                            key={`${docente.nombre}-${docente.rol}-${idx}`}
                            className="flex flex-wrap items-center gap-2"
                          >
                            <span className="font-medium">{docente.nombre}</span>
                            <Badge variant="outline">{docente.rol}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        No hay docentes asignados a la sección.
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Materias</CardTitle>
                    <CardDescription>
                      Docentes responsables de cada materia de la sección.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {detalle?.materias?.length ? (
                      detalle.materias.map((materia) => (
                        <div
                          key={materia.id}
                          className="rounded-lg border p-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="font-medium">{materia.nombre}</p>
                            <Badge variant="secondary">
                              {materia.docentes.length}
                              {" "}
                              docente{materia.docentes.length === 1 ? "" : "s"}
                            </Badge>
                          </div>
                          <div className="mt-3 space-y-2 text-sm">
                            {materia.docentes.length ? (
                              materia.docentes.map((docente, idx) => (
                                <div
                                  key={`${materia.id}-${docente.nombre}-${idx}`}
                                  className="flex flex-wrap items-center gap-2"
                                >
                                  <span className="font-medium">{docente.nombre}</span>
                                  <Badge variant="outline">{docente.rol}</Badge>
                                </div>
                              ))
                            ) : (
                              <div className="text-muted-foreground">
                                No hay docentes asignados actualmente.
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Aún no hay materias cargadas para esta sección.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
