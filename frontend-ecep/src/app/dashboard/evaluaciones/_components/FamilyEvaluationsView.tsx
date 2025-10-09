"use client";

import { useEffect, useMemo, useState } from "react";
import LoadingState from "@/components/common/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  AlumnoLiteDTO,
  AsignacionDocenteSeccionDTO,
  EvaluacionDTO,
  InformeInicialDTO,
  MateriaDTO,
  ResultadoEvaluacionDTO,
  SeccionMateriaDTO,
  TrimestreDTO,
} from "@/types/api-generated";
import { NivelAcademico as NivelAcademicoEnum } from "@/types/api-generated";
import { calendario, gestionAcademica } from "@/services/api/modules";
import { getTrimestreEstado } from "@/lib/trimestres";
import { useCalendarRefresh } from "@/hooks/useCalendarRefresh";
import { CheckCircle2, Clock, FileText, GraduationCap } from "lucide-react";

interface FamilyEvaluationsViewProps {
  alumnos: AlumnoLiteDTO[];
  scope: "family" | "student";
  initialLoading?: boolean;
  initialError?: string | null;
}

interface EvaluacionDetalle {
  id: number;
  fecha?: string | null;
  tema?: string | null;
  trimestreLabel: string;
  notaNumerica?: number | null;
  notaConceptual?: string | null;
  observaciones?: string | null;
  estado: "Calificada" | "Pendiente";
}

interface MateriaEvaluaciones {
  key: string;
  materiaNombre: string;
  docenteNombre?: string | null;
  evaluaciones: EvaluacionDetalle[];
}

interface InformePorTrimestre {
  trimestre: TrimestreDTO;
  informe: InformeInicialDTO | null;
}

function resolveNivel(alumno: AlumnoLiteDTO | null) {
  if (!alumno) return null;
  if (alumno.nivel) return alumno.nivel;
  const nombre = (alumno.seccionNombre ?? "").toLowerCase();
  if (nombre.includes("sala")) return NivelAcademicoEnum.INICIAL;
  return NivelAcademicoEnum.PRIMARIO;
}

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function normalizeText(value?: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function combineNombre(
  apellido?: unknown,
  nombre?: unknown,
): string | null {
  const apellidoStr = normalizeText(apellido);
  const nombreStr = normalizeText(nombre);
  if (apellidoStr || nombreStr) {
    return [apellidoStr, nombreStr].filter(Boolean).join(" ").trim();
  }
  return null;
}

function extractPersonaNombre(persona: any): string | null {
  if (!persona || typeof persona !== "object") return null;
  return (
    normalizeText(persona.nombreCompleto) ??
    combineNombre(persona.apellido ?? persona.apellidos, persona.nombre ?? persona.nombres)
  );
}

function extractNombreDocente(source: any): string | null {
  if (!source) return null;
  if (typeof source === "string") return normalizeText(source);
  if (typeof source !== "object") return null;

  const directCandidates = [
    source.nombreCompleto,
    source.nombreDocente,
    source.docenteNombre,
    source.nombre,
    source.fullName,
  ];
  for (const candidate of directCandidates) {
    const normalized = normalizeText(candidate);
    if (normalized) {
      const apellido = normalizeText(source.apellido ?? source.apellidos);
      return apellido ? `${apellido} ${normalized}`.trim() : normalized;
    }
  }

  const combined = combineNombre(
    source.apellido ?? source.apellidos,
    source.nombre ?? source.nombres,
  );
  if (combined) return combined;

  const personaCandidates = [
    source.persona,
    source.personaDocente,
    source.personaActual,
    source.empleado?.persona,
    source.docente?.persona,
    source.personal?.persona,
  ];
  for (const persona of personaCandidates) {
    const nombre = extractPersonaNombre(persona);
    if (nombre) return nombre;
  }

  const nestedCandidates = [
    source.empleado,
    source.docente,
    source.personal,
    source.usuario,
    source.user,
  ];
  for (const nested of nestedCandidates) {
    if (!nested || nested === source) continue;
    const nombre = extractNombreDocente(nested);
    if (nombre) return nombre;
  }

  return null;
}

function extractDocenteFromSeccionMateria(
  seccionMateria: SeccionMateriaDTO,
): string | null {
  const candidates = [
    (seccionMateria as any)?.docente,
    (seccionMateria as any)?.docenteAsignado,
    (seccionMateria as any)?.docenteTitular,
    (seccionMateria as any)?.docenteSeccion,
    (seccionMateria as any)?.docenteActual,
    (seccionMateria as any)?.docentePrincipal,
    (seccionMateria as any)?.docenteResponsable,
    (seccionMateria as any)?.docentes,
    (seccionMateria as any)?.docentesAsignados,
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    if (Array.isArray(candidate)) {
      for (const item of candidate) {
        const nombre = extractNombreDocente(item);
        if (nombre) return nombre;
      }
      continue;
    }
    const nombre = extractNombreDocente(candidate);
    if (nombre) return nombre;
  }

  return null;
}

function extractDocenteFromAsignacion(
  asignacion: AsignacionDocenteSeccionDTO,
): string | null {
  const raw: any = asignacion as any;
  const directCandidates = [
    raw.docente,
    raw.docenteAsignado,
    raw.docenteSeccion,
    raw.docenteActual,
    raw.empleado,
    raw.personal,
    raw.usuario,
    raw.user,
    raw.persona,
  ];
  for (const candidate of directCandidates) {
    const nombre = extractNombreDocente(candidate);
    if (nombre) return nombre;
  }

  const stringCandidates = [
    raw.docenteNombre,
    raw.nombreDocente,
    raw.nombreCompletoDocente,
  ];
  for (const candidate of stringCandidates) {
    const nombre = normalizeText(candidate);
    if (nombre) return nombre;
  }

  return combineNombre(raw.apellido ?? raw.apellidos, raw.nombre ?? raw.nombres);
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return "—";
  return dateFormatter.format(parsed);
}

function formatTrimestre(trimestre?: TrimestreDTO | null) {
  if (!trimestre) return "Trimestre";
  const numero = trimestre.orden ?? "";
  const inicio = trimestre.inicio ? formatDate(trimestre.inicio) : null;
  const fin = trimestre.fin ? formatDate(trimestre.fin) : null;
  const rango = inicio && fin ? `${inicio} – ${fin}` : null;
  return rango ? `Trimestre ${numero} · ${rango}` : `Trimestre ${numero}`;
}

function promedioNumerico(resultados: ResultadoEvaluacionDTO[]) {
  const notas = resultados
    .map((r) => (typeof r.notaNumerica === "number" ? r.notaNumerica : null))
    .filter((n): n is number => n != null);
  if (!notas.length) return null;
  const sum = notas.reduce((acc, n) => acc + n, 0);
  return Math.round((sum / notas.length) * 100) / 100;
}

export function FamilyEvaluationsView({
  alumnos,
  scope,
  initialLoading,
  initialError,
}: FamilyEvaluationsViewProps) {
  const [selectedMatriculaId, setSelectedMatriculaId] = useState<number | null>(
    null,
  );
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState<string | null>(null);
  const [materias, setMaterias] = useState<MateriaEvaluaciones[] | null>(null);
  const [informesInicial, setInformesInicial] = useState<
    InformePorTrimestre[] | null
  >(null);
  const [trimestres, setTrimestres] = useState<Map<number, TrimestreDTO>>(
    new Map(),
  );
  const [resumen, setResumen] = useState<{
    promedio: number | null;
    totalEvaluaciones: number;
    evaluacionesCalificadas: number;
  }>({ promedio: null, totalEvaluaciones: 0, evaluacionesCalificadas: 0 });
  const calendarVersion = useCalendarRefresh("trimestres");

  const alumnosVisibles = useMemo(() => {
    if (scope !== "family") return alumnos;
    return alumnos.filter(
      (alumno) => resolveNivel(alumno) !== NivelAcademicoEnum.INICIAL,
    );
  }, [alumnos, scope]);

  const cantidadInicialOcultos = useMemo(() => {
    if (scope !== "family") return 0;
    return alumnos.filter(
      (alumno) => resolveNivel(alumno) === NivelAcademicoEnum.INICIAL,
    ).length;
  }, [alumnos, scope]);

  useEffect(() => {
    if (!alumnosVisibles.length) {
      setSelectedMatriculaId(null);
      setMaterias(null);
      setInformesInicial(null);
      setResumen({ promedio: null, totalEvaluaciones: 0, evaluacionesCalificadas: 0 });
      return;
    }

    if (
      selectedMatriculaId == null ||
      !alumnosVisibles.some((a) => a.matriculaId === selectedMatriculaId)
    ) {
      setSelectedMatriculaId(alumnosVisibles[0].matriculaId);
    }
  }, [alumnosVisibles, selectedMatriculaId]);

  const alumnoSeleccionado = useMemo(() => {
    if (selectedMatriculaId == null) return null;
    return (
      alumnosVisibles.find((al) => al.matriculaId === selectedMatriculaId) ?? null
    );
  }, [alumnosVisibles, selectedMatriculaId]);

  useEffect(() => {
    let alive = true;

    async function cargarDetalle() {
      if (!alumnoSeleccionado) {
        setMaterias(null);
        setInformesInicial(null);
        setErrorDetalle(null);
        setResumen({ promedio: null, totalEvaluaciones: 0, evaluacionesCalificadas: 0 });
        return;
      }

      const nivel = resolveNivel(alumnoSeleccionado);

      try {
        setLoadingDetalle(true);
        setErrorDetalle(null);

        const trimestresRes = await calendario.trimestres
          .list()
          .catch(() => ({ data: [] as TrimestreDTO[] }));
        if (!alive) return;
        const mapaTrimestres = new Map<number, TrimestreDTO>();
        for (const t of trimestresRes.data ?? []) {
          if (t.id != null) mapaTrimestres.set(t.id, t);
        }
        setTrimestres(mapaTrimestres);

        if (nivel === NivelAcademicoEnum.INICIAL) {
          const informesRes = await gestionAcademica.informes
            .list()
            .catch(() => ({ data: [] as InformeInicialDTO[] }));
          if (!alive) return;

          const informesAlumno = (informesRes.data ?? []).filter(
            (inf) => inf.matriculaId === alumnoSeleccionado.matriculaId,
          );
          const map = new Map<number, InformeInicialDTO>();
          for (const inf of informesAlumno) {
            if (inf.trimestreId != null) map.set(inf.trimestreId, inf);
          }

          const ordenados = Array.from(mapaTrimestres.values())
            .filter((tri) => getTrimestreEstado(tri) === "cerrado")
            .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

          setInformesInicial(
            ordenados.map((tri) => ({
              trimestre: tri,
              informe: map.get(tri.id ?? -1) ?? null,
            })),
          );
          setMaterias(null);
          setResumen({ promedio: null, totalEvaluaciones: 0, evaluacionesCalificadas: 0 });
          return;
        }

        const seccionId = alumnoSeleccionado.seccionId ?? null;

        const [
          evaluacionesRes,
          resultadosRes,
          seccionMateriasRes,
          materiasRes,
          asignacionesDocentesRes,
        ] = await Promise.all([
          seccionId
            ? gestionAcademica.evaluaciones
                .search({ seccionId })
                .catch(() => ({ data: [] as EvaluacionDTO[] }))
            : gestionAcademica.evaluaciones
                .list()
                .catch(() => ({ data: [] as EvaluacionDTO[] })),
          gestionAcademica.resultados
            .list({ matriculaId: alumnoSeleccionado.matriculaId })
            .catch(() => ({ data: [] as ResultadoEvaluacionDTO[] })),
          gestionAcademica.seccionMaterias
            .list()
            .catch(() => ({ data: [] as SeccionMateriaDTO[] })),
          gestionAcademica.materias
            .list()
            .catch(() => ({ data: [] as MateriaDTO[] })),
          gestionAcademica.asignacionDocenteSeccion
            .list()
            .catch(() => ({ data: [] as AsignacionDocenteSeccionDTO[] })),
        ]);

        if (!alive) return;

        const seccionMaterias = (seccionMateriasRes.data ?? []).filter((sm) => {
          if (!seccionId) return true;
          const sid = sm.seccionId ?? (sm as any)?.seccion?.id;
          return sid === seccionId;
        });
        const materiasCatalogo = materiasRes.data ?? [];
        const evaluaciones = (evaluacionesRes.data ?? []) as EvaluacionDTO[];
        const resultados = (resultadosRes.data ?? []) as ResultadoEvaluacionDTO[];

        const materiaNombreById = new Map<number, string>();
        for (const mat of materiasCatalogo) {
          if (mat.id != null) {
            materiaNombreById.set(
              mat.id,
              mat.nombre ?? `Materia ${mat.id}`,
            );
          }
        }

        const asignacionesDocentes =
          (asignacionesDocentesRes.data ?? []) as AsignacionDocenteSeccionDTO[];
        const docentePorSeccionId = new Map<number, string>();
        for (const asignacion of asignacionesDocentes) {
          const raw: any = asignacion as any;
          const seccionId = raw.seccionId ?? raw.seccion?.id ?? null;
          if (seccionId == null) continue;
          const nombreDocente = extractDocenteFromAsignacion(asignacion);
          if (!nombreDocente) continue;
          const rol = String(raw.rol ?? "").toUpperCase();
          if (!docentePorSeccionId.has(seccionId) || rol.includes("TITULAR")) {
            docentePorSeccionId.set(seccionId, nombreDocente);
          }
        }

        const materiaPorSeccionMateria = new Map<
          number,
          { nombre: string; docenteNombre: string | null }
        >();
        for (const sm of seccionMaterias) {
          if (sm.id == null) continue;
          const materiaId = sm.materiaId ?? (sm as any)?.materia?.id;
          const nombre =
            materiaId != null && materiaNombreById.has(materiaId)
              ? materiaNombreById.get(materiaId)!
              : `Materia ${materiaId ?? sm.id}`;
          const seccionId =
            sm.seccionId ?? (sm as any)?.seccion?.id ?? null;
          const docenteNombre =
            extractDocenteFromSeccionMateria(sm) ??
            (seccionId != null ? docentePorSeccionId.get(seccionId) ?? null : null);
          materiaPorSeccionMateria.set(sm.id, {
            nombre,
            docenteNombre: docenteNombre ?? null,
          });
        }

        const seccionPorSeccionMateria = new Map<number, number>();
        for (const sm of seccionMaterias) {
          if (sm.id != null) {
            const sid = sm.seccionId ?? (sm as any)?.seccion?.id;
            if (sid != null) seccionPorSeccionMateria.set(sm.id, sid);
          }
        }

        const evaluacionesFiltradas = evaluaciones.filter((ev) => {
          const smId = (ev as any)?.seccionMateriaId;
          if (smId == null) return !seccionId;
          if (!seccionId) return true;
          return seccionPorSeccionMateria.get(smId) === seccionId;
        });

        const resultadoPorEvaluacion = new Map<number, ResultadoEvaluacionDTO>();
        for (const res of resultados) {
          if (res.evaluacionId != null) {
            resultadoPorEvaluacion.set(res.evaluacionId, res);
          }
        }

        const materiasMap = new Map<string, MateriaEvaluaciones>();

        for (const evaluacion of evaluacionesFiltradas) {
          const smId = (evaluacion as any)?.seccionMateriaId as
            | number
            | undefined;
          const materiaInfo = smId ? materiaPorSeccionMateria.get(smId) : null;
          const materiaNombre = materiaInfo?.nombre
            ? materiaInfo.nombre
            : smId
              ? `Materia ${smId}`
              : "Sin materia asignada";
          const docenteNombre = materiaInfo?.docenteNombre ?? null;
          const key = smId != null ? String(smId) : `sin-${evaluacion.id}`;

          if (!materiasMap.has(key)) {
            materiasMap.set(key, {
              key,
              materiaNombre,
              docenteNombre,
              evaluaciones: [],
            });
          } else if (docenteNombre && !materiasMap.get(key)!.docenteNombre) {
            materiasMap.get(key)!.docenteNombre = docenteNombre;
          }

          const resultado = resultadoPorEvaluacion.get(evaluacion.id);
          const trimestre =
            evaluacion.trimestreId != null
              ? mapaTrimestres.get(evaluacion.trimestreId)
              : null;

          materiasMap.get(key)!.evaluaciones.push({
            id: evaluacion.id,
            fecha: evaluacion.fecha ?? null,
            tema: evaluacion.tema ?? "—",
            trimestreLabel: trimestre
              ? `Trimestre ${trimestre.orden ?? ""}`
              : "Sin trimestre",
            notaNumerica: resultado?.notaNumerica ?? null,
            notaConceptual: resultado?.notaConceptual ?? null,
            observaciones: resultado?.observaciones ?? null,
            estado: resultado ? "Calificada" : "Pendiente",
          });
        }

        const materiasOrdenadas = Array.from(materiasMap.values()).map((mat) => ({
          ...mat,
          evaluaciones: mat.evaluaciones.sort((a, b) =>
            (b.fecha ?? "").localeCompare(a.fecha ?? ""),
          ),
        }));

        setMaterias(
          materiasOrdenadas.sort((a, b) =>
            a.materiaNombre.localeCompare(b.materiaNombre, "es"),
          ),
        );
        setInformesInicial(null);

        const totalEvaluaciones = evaluacionesFiltradas.length;
        const evaluacionesCalificadas = evaluacionesFiltradas.filter((ev) =>
          resultadoPorEvaluacion.has(ev.id),
        ).length;
        setResumen({
          promedio: promedioNumerico(resultados),
          totalEvaluaciones,
          evaluacionesCalificadas,
        });
      } catch (err: any) {
        if (!alive) return;
        setErrorDetalle(
          err?.response?.data?.message ??
            err?.message ??
            "No se pudo cargar la información académica.",
        );
        setMaterias(null);
        setInformesInicial(null);
        setResumen({ promedio: null, totalEvaluaciones: 0, evaluacionesCalificadas: 0 });
      } finally {
        if (alive) setLoadingDetalle(false);
      }
    }

    cargarDetalle();

    return () => {
      alive = false;
    };
  }, [alumnoSeleccionado, calendarVersion]);

  if (initialLoading) {
    return <LoadingState label="Cargando evaluaciones…" />;
  }

  if (initialError) {
    return <div className="text-sm text-red-600">{initialError}</div>;
  }

  if (!alumnosVisibles.length) {
    const sinEvaluacionesMessage =
      scope === "family" && cantidadInicialOcultos > 0
        ? "Tus hijos de nivel inicial no cuentan con exámenes registrados."
        : scope === "student"
          ? "Todavía no hay evaluaciones registradas para tu matrícula."
          : "No hay alumnos asociados para consultar evaluaciones.";
    return (
      <div className="text-sm text-muted-foreground">
        {sinEvaluacionesMessage}
      </div>
    );
  }

  const titulo =
    scope === "student" ? "Mis evaluaciones" : "Evaluaciones de mis hijos";

  const nivel = resolveNivel(alumnoSeleccionado);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h3 className="text-2xl font-semibold tracking-tight">{titulo}</h3>
        <p className="text-sm text-muted-foreground">
          Explorá las calificaciones y observaciones registradas por los
          docentes.
        </p>
      </header>

      {alumnosVisibles.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {alumnosVisibles.map((al) => (
            <Button
              key={al.matriculaId}
              size="sm"
              variant={
                selectedMatriculaId === al.matriculaId ? "default" : "outline"
              }
              onClick={() => setSelectedMatriculaId(al.matriculaId)}
            >
              {al.nombreCompleto}
            </Button>
          ))}
        </div>
      )}

      {alumnoSeleccionado && (
        <Card>
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-xl">
                {alumnoSeleccionado.nombreCompleto}
              </CardTitle>
              <div className="space-y-1 text-sm text-muted-foreground">
                {alumnoSeleccionado.seccionNombre && (
                  <div>
                    Sección: {alumnoSeleccionado.seccionNombre}
                  </div>
                )}
                <div>
                  Nivel: {nivel === NivelAcademicoEnum.INICIAL ? "Inicial" : "Primario"}
                </div>
              </div>
            </div>
            <div className="flex gap-3 text-sm">
              <Badge variant="secondary" className="flex items-center gap-1">
                <GraduationCap className="h-3 w-3" />
                {resumen.totalEvaluaciones} evaluaciones
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {resumen.evaluacionesCalificadas} calificadas
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Promedio: {resumen.promedio ?? "—"}
              </Badge>
            </div>
          </CardHeader>
        </Card>
      )}

      {loadingDetalle && <LoadingState label="Actualizando información…" />}

      {errorDetalle && !loadingDetalle && (
        <div className="text-sm text-red-600">{errorDetalle}</div>
      )}

      {!loadingDetalle && !errorDetalle && nivel === NivelAcademicoEnum.PRIMARIO && (
        <div className="space-y-4">
          {!materias?.length && (
            <div className="text-sm text-muted-foreground">
              No hay evaluaciones registradas para esta sección todavía.
            </div>
          )}

          {materias?.map((mat) => (
            <Card key={mat.key} className="overflow-hidden">
              <CardHeader>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{mat.materiaNombre}</CardTitle>
                    {mat.docenteNombre && (
                      <p className="text-sm text-muted-foreground">
                        Docente: {mat.docenteNombre}
                      </p>
                    )}
                  </div>
                  <Badge variant="outline">
                    {mat.evaluaciones.filter((e) => e.estado === "Calificada").length}
                    /{mat.evaluaciones.length} calificadas
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {mat.evaluaciones.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No se registraron evaluaciones en esta materia.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[120px]">Fecha</TableHead>
                          <TableHead className="min-w-[140px]">
                            Trimestre
                          </TableHead>
                          <TableHead className="min-w-[200px]">Tema</TableHead>
                          <TableHead className="min-w-[120px]">Nota</TableHead>
                          <TableHead className="min-w-[160px]">
                            Observaciones
                          </TableHead>
                          <TableHead className="min-w-[120px] text-right">
                            Estado
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mat.evaluaciones.map((ev) => (
                          <TableRow key={ev.id}>
                            <TableCell>{formatDate(ev.fecha)}</TableCell>
                            <TableCell>{ev.trimestreLabel}</TableCell>
                            <TableCell>{ev.tema}</TableCell>
                            <TableCell>
                              {ev.notaNumerica != null
                                ? ev.notaNumerica
                                : ev.notaConceptual ?? "—"}
                            </TableCell>
                            <TableCell>
                              {ev.observaciones ? (
                                <span className="text-xs text-muted-foreground">
                                  {ev.observaciones}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant={
                                  ev.estado === "Calificada"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {ev.estado}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loadingDetalle && !errorDetalle && nivel === NivelAcademicoEnum.INICIAL && (
        <div className="grid gap-4 md:grid-cols-2">
          {!informesInicial?.length && (
            <div className="text-sm text-muted-foreground">
              Aún no se cargaron informes para los trimestres del nivel inicial.
            </div>
          )}

          {informesInicial?.map((item) => {
            const cerrado = item.trimestre.cerrado ?? false;
            const descripcion = item.informe?.descripcion ?? null;
            return (
              <Card key={item.trimestre.id ?? Math.random()}>
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Trimestre {item.trimestre.orden ?? ""}
                    </CardTitle>
                    <Badge variant={cerrado ? "default" : "outline"}>
                      {cerrado ? "Cerrado" : "En curso"}
                    </Badge>
                  </div>
                  <CardDescription>
                    {formatTrimestre(item.trimestre)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {descripcion ? (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {descripcion}
                    </p>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      Informe pendiente de publicación.
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FamilyEvaluationsView;
