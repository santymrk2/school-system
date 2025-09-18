"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CalificacionConceptual,
  EvaluacionDTO,
  ResultadoEvaluacionCreateDTO,
  ResultadoEvaluacionDTO,
  ResultadoEvaluacionUpdateDTO,
} from "@/types/api-generated";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const CONCEPTOS = Object.values(CalificacionConceptual).filter(
  (value): value is CalificacionConceptual => typeof value === "string",
);

type Row = {
  id?: number; // si existe en backend
  matriculaId: number;
  nombre: string;
  notaConceptual?: CalificacionConceptual | null;
  observaciones?: string | null;
};

type NotaExamRow = {
  matriculaId: number;
  nombre: string;
  notaNumerica: number | null;
  observaciones: string;
  resultadoId?: number;
};

type ExamenData = {
  evaluacion: EvaluacionDTO;
  notas: NotaExamRow[];
  baseNotas: NotaExamRow[];
};

const fechaLargaFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
});

function splitTema(rawTema?: string | null) {
  if (!rawTema) return { titulo: "Evaluación", descripcion: "" };
  const [first, ...rest] = rawTema.split(" — ");
  const titulo = (first ?? "").trim() || "Evaluación";
  const descripcion = rest.join(" — ").trim();
  return { titulo, descripcion };
}

function formatFechaCorta(iso?: string | null) {
  if (!iso) return "Sin fecha";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso ?? "Sin fecha";
  return fechaLargaFormatter.format(date);
}

export default function CierrePrimarioView({
  seccionId,
}: {
  seccionId: number;
}) {
  const hoy = new Date().toISOString().slice(0, 10);

  // catálogos
  const [trimestres, setTrimestres] = useState<any[]>([]);
  const [seccionMaterias, setSeccionMaterias] = useState<any[]>([]);
  const [examenes, setExamenes] = useState<ExamenData[]>([]);
  const [loadingExamenes, setLoadingExamenes] = useState(false);
  const [savingExamId, setSavingExamId] = useState<number | null>(null);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [califs, setCalifs] = useState<any[]>([]);

  // UI
  const [triId, setTriId] = useState<string>("");
  const [smId, setSmId] = useState<string>("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRows, setLoadingRows] = useState(false);
  const [saving, setSaving] = useState(false);

  // carga base
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [triRes, smRes, aluRes, cRes] = await Promise.all([
          api.trimestres.list(), // { id, orden, cerrado, fechaInicio, fechaFin, periodoEscolarId }
          api.seccionMaterias.list(), // { id, seccionId, materiaId, materia{nombre}? }
          api.seccionesAlumnos.bySeccionId(seccionId, hoy), // [{ matriculaId, nombre/nombreCompleto }]
          api.calificaciones.list(), // [{ id, trimestreId, seccionMateriaId, matriculaId, ... }]
        ]);
        if (!alive) return;
        setTrimestres(triRes.data ?? []);
        setSeccionMaterias(
          (smRes.data ?? []).filter(
            (sm: any) => (sm.seccionId ?? sm.seccion?.id) === seccionId,
          ),
        );
        setAlumnos(aluRes.data ?? []);
        setCalifs(cRes.data ?? []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [seccionId, hoy]);

  const triOpts = useMemo(
    () =>
      (trimestres ?? [])
        .slice()
        .sort((a: any, b: any) => (a.orden ?? 0) - (b.orden ?? 0))
        .map((t: any) => ({
          id: t.id,
          label: `Trimestre ${t.orden}`,
          cerrado: !!t.cerrado,
        })),
    [trimestres],
  );

  const matOpts = useMemo(
    () =>
      (seccionMaterias ?? []).map((sm: any) => ({
        id: sm.id,
        label: sm.materia?.nombre ?? `Materia #${sm.materiaId ?? sm.id}`,
      })),
    [seccionMaterias],
  );

  const alumnosNombreMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const a of alumnos ?? []) {
      const label =
        (a as any).nombreCompleto ??
        (a as any).nombre ??
        `Matrícula ${a?.matriculaId ?? ""}`;
      if (typeof a?.matriculaId === "number") map.set(a.matriculaId, label);
    }
    return map;
  }, [alumnos]);

  const buildNotaRows = useCallback(
    (resultados: ResultadoEvaluacionDTO[]) => {
      const mapResultados = new Map<number, ResultadoEvaluacionDTO>();
      for (const res of resultados ?? []) {
        const matriculaId = (res as any).matriculaId as number | undefined;
        if (typeof matriculaId === "number") {
          mapResultados.set(matriculaId, res);
        }
      }

      const processed = new Set<number>();
      const sortedAlumnos = [...(alumnos ?? [])].sort((a, b) => {
        const nombreA = ((a as any).nombreCompleto ?? "").toLowerCase();
        const nombreB = ((b as any).nombreCompleto ?? "").toLowerCase();
        return nombreA.localeCompare(nombreB);
      });

      const rows: NotaExamRow[] = [];

      for (const alumno of sortedAlumnos) {
        const matriculaId = alumno.matriculaId;
        if (typeof matriculaId !== "number") continue;
        const existente = mapResultados.get(matriculaId);
        processed.add(matriculaId);
        rows.push({
          matriculaId,
          nombre:
            (alumno as any).nombreCompleto ??
            (alumno as any).nombre ??
            `Matrícula ${matriculaId}`,
          notaNumerica: (existente as any)?.notaNumerica ?? null,
          observaciones: ((existente as any)?.observaciones ?? "") || "",
          resultadoId: existente?.id,
        });
      }

      for (const [matriculaId, res] of mapResultados.entries()) {
        if (processed.has(matriculaId)) continue;
        rows.push({
          matriculaId,
          nombre:
            alumnosNombreMap.get(matriculaId) ?? `Matrícula ${matriculaId}`,
          notaNumerica: (res as any)?.notaNumerica ?? null,
          observaciones: ((res as any)?.observaciones ?? "") || "",
          resultadoId: res.id,
        });
      }

      rows.sort((a, b) => a.nombre.localeCompare(b.nombre));
      return rows;
    },
    [alumnos, alumnosNombreMap],
  );

  const selectedTrimestre = useMemo(
    () => triOpts.find((t) => String(t.id) === triId),
    [triOpts, triId],
  );
  const selectedMateria = useMemo(
    () => matOpts.find((m) => String(m.id) === smId),
    [matOpts, smId],
  );

  const triCerrado = useMemo(() => {
    const t = trimestres.find((x) => x.id === Number(triId));
    return !!t?.cerrado;
  }, [trimestres, triId]);

  useEffect(() => {
    if (loading) return;
    if (!triId && triOpts.length > 0) {
      setTriId(String(triOpts[0].id));
    }
  }, [loading, triId, triOpts]);

  useEffect(() => {
    if (loading) return;
    if (!smId && matOpts.length > 0) {
      setSmId(String(matOpts[0].id));
    }
  }, [loading, smId, matOpts]);

  // sincroniza filas cuando el usuario elige tri/materia
  useEffect(() => {
    if (!triId || !smId || alumnos.length === 0) {
      setRows([]);
      return;
    }
    let alive = true;
    (async () => {
      try {
        setLoadingRows(true);
        // filtramos califs en memoria; si hay muchos, podés crear un endpoint search
        const current = (califs ?? []).filter(
          (c: any) =>
            c.trimestreId === Number(triId) &&
            c.seccionMateriaId === Number(smId),
        );
        const byMat = new Map<number, any>(
          current.map((c: any) => [c.matriculaId, c]),
        );

        const next: Row[] = (alumnos ?? [])
          .map((a: any) => {
            const ex = byMat.get(a.matriculaId);
            return {
              id: ex?.id,
              matriculaId: a.matriculaId,
              nombre:
                a.nombreCompleto ?? a.nombre ?? `Alumno #${a.matriculaId}`,
              notaConceptual: ex?.notaConceptual ?? null,
              observaciones: ex?.observaciones ?? "", // opcional
            };
          })
          .sort((a, b) => a.nombre.localeCompare(b.nombre));
        if (!alive) return;
        setRows(next);
      } finally {
        if (alive) setLoadingRows(false);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triId, smId, alumnos, califs]);

  useEffect(() => {
    if (!triId || !smId) {
      setExamenes([]);
      return;
    }
    const trimestreId = Number(triId);
    if (!Number.isFinite(trimestreId)) {
      setExamenes([]);
      return;
    }

    let alive = true;
    (async () => {
      try {
        setLoadingExamenes(true);
        const evalRes = await api.evaluaciones.search({
          seccionId,
          trimestreId,
        });
        const allEvaluaciones = (evalRes.data ?? []) as EvaluacionDTO[];
        const filtered = allEvaluaciones.filter(
          (ev: any) =>
            (ev?.seccionMateriaId ?? ev?.seccionMateria?.id) === Number(smId),
        );
        const ordered = filtered.sort((a: any, b: any) => {
          const fa = String((a as any)?.fecha ?? "");
          const fb = String((b as any)?.fecha ?? "");
          return fa.localeCompare(fb);
        });
        const resultadosPorEvaluacion = await Promise.all(
          ordered.map((ev) =>
            api.resultadosEvaluacion
              .byEvaluacion(ev.id)
              .then((r) => (r.data ?? []) as ResultadoEvaluacionDTO[])
              .catch(() => []),
          ),
        );
        if (!alive) return;
        const next: ExamenData[] = ordered.map((ev, index) => {
          const rows = buildNotaRows(resultadosPorEvaluacion[index] ?? []);
          return {
            evaluacion: ev,
            notas: rows.map((row) => ({ ...row })),
            baseNotas: rows.map((row) => ({ ...row })),
          };
        });
        setExamenes(next);
      } catch (err) {
        console.error(
          "[CierrePrimarioView] No se pudieron cargar las evaluaciones del trimestre",
          err,
        );
        if (alive) setExamenes([]);
      } finally {
        if (alive) setLoadingExamenes(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [triId, smId, seccionId, buildNotaRows]);

  const handleExamNotaChange = (
    evaluacionId: number,
    matriculaId: number,
    value: string,
  ) => {
    const normalized = value.replace(",", ".").trim();
    const parsed = normalized === "" ? null : Number(normalized);
    if (
      normalized !== "" &&
      (!Number.isFinite(parsed) || parsed < 1 || parsed > 10)
    ) {
      return;
    }

    setExamenes((prev) =>
      prev.map((exam) =>
        exam.evaluacion.id === evaluacionId
          ? {
              ...exam,
              notas: exam.notas.map((row) =>
                row.matriculaId === matriculaId
                  ? { ...row, notaNumerica: parsed }
                  : row,
              ),
            }
          : exam,
      ),
    );
  };

  const handleExamObservacionChange = (
    evaluacionId: number,
    matriculaId: number,
    value: string,
  ) => {
    setExamenes((prev) =>
      prev.map((exam) =>
        exam.evaluacion.id === evaluacionId
          ? {
              ...exam,
              notas: exam.notas.map((row) =>
                row.matriculaId === matriculaId
                  ? { ...row, observaciones: value }
                  : row,
              ),
            }
          : exam,
      ),
    );
  };

  const handleResetExamNotas = (evaluacionId: number) => {
    setExamenes((prev) =>
      prev.map((exam) =>
        exam.evaluacion.id === evaluacionId
          ? {
              ...exam,
              notas: exam.baseNotas.map((row) => ({ ...row })),
            }
          : exam,
      ),
    );
  };

  const handleSaveExamNotas = async (evaluacionId: number) => {
    const exam = examenes.find((e) => e.evaluacion.id === evaluacionId);
    if (!exam) return;

    try {
      setSavingExamId(evaluacionId);
      const pending: Promise<unknown>[] = [];

      for (const row of exam.notas) {
        const base = exam.baseNotas.find(
          (b) => b.matriculaId === row.matriculaId,
        );
        const observacion = (row.observaciones ?? "").trim();
        const payload: ResultadoEvaluacionUpdateDTO = {
          notaNumerica: row.notaNumerica ?? null,
          notaConceptual: null,
          observaciones: observacion ? row.observaciones : null,
        };

        if (row.resultadoId) {
          const changed =
            (base?.notaNumerica ?? null) !== (row.notaNumerica ?? null) ||
            (base?.observaciones ?? "") !== (row.observaciones ?? "");
          if (changed) {
            pending.push(
              api.resultadosEvaluacion.update(row.resultadoId, payload),
            );
          }
          continue;
        }

        const shouldPersist =
          payload.notaNumerica !== null || observacion.length > 0;
        if (!shouldPersist) continue;

        pending.push(
          api.resultadosEvaluacion.create({
            evaluacionId,
            matriculaId: row.matriculaId,
            ...payload,
          } as ResultadoEvaluacionCreateDTO),
        );
      }

      await Promise.all(pending);
      const refreshed =
        await api.resultadosEvaluacion.byEvaluacion(evaluacionId);
      const updatedRows = buildNotaRows(
        (refreshed.data ?? []) as ResultadoEvaluacionDTO[],
      );
      setExamenes((prev) =>
        prev.map((examData) =>
          examData.evaluacion.id === evaluacionId
            ? {
                ...examData,
                notas: updatedRows.map((row) => ({ ...row })),
                baseNotas: updatedRows.map((row) => ({ ...row })),
              }
            : examData,
        ),
      );
      alert("Notas de examen guardadas.");
    } catch (e: any) {
      alert(
        e?.response?.data?.message ??
          e?.message ??
          "No se pudieron guardar las notas del examen.",
      );
    } finally {
      setSavingExamId(null);
    }
  };

  const examHasChanges = useCallback((exam: ExamenData) => {
    const baseMap = new Map<number, NotaExamRow>(
      exam.baseNotas.map((row) => [row.matriculaId, row]),
    );

    for (const row of exam.notas) {
      const base = baseMap.get(row.matriculaId);
      if (!base) {
        if (row.notaNumerica != null || row.observaciones.trim().length > 0) {
          return true;
        }
        continue;
      }
      if (
        (base.notaNumerica ?? null) !== (row.notaNumerica ?? null) ||
        (base.observaciones ?? "") !== (row.observaciones ?? "")
      ) {
        return true;
      }
    }

    return false;
  }, []);

  const onSet = (matId: number, field: keyof Row, val: any) => {
    setRows((prev) =>
      prev.map((r) => (r.matriculaId === matId ? { ...r, [field]: val } : r)),
    );
  };

  const save = async () => {
    if (!triId || !smId) return;
    try {
      setSaving(true);

      // construyo “por cambios”
      const current = (califs ?? []).filter(
        (c: any) =>
          c.trimestreId === Number(triId) &&
          c.seccionMateriaId === Number(smId),
      );
      const byMat = new Map<number, any>(
        current.map((c: any) => [c.matriculaId, c]),
      );

      // 1) upserts
      for (const r of rows) {
        const existing = byMat.get(r.matriculaId);
        const payload = {
          trimestreId: Number(triId),
          seccionMateriaId: Number(smId),
          matriculaId: r.matriculaId,
          notaConceptual: r.notaConceptual ?? null,
          observaciones: r.observaciones ?? null,
        };

        if (!existing) {
          // create
          await api.calificaciones.create(payload);
        } else {
          // Si hay cambios, PUT
          const changed =
            (existing.notaConceptual ?? null) !== (r.notaConceptual ?? null) ||
            (existing.observaciones ?? "") !== (r.observaciones ?? "");

          if (changed) {
            await api.calificaciones.update(existing.id, payload);
          }
        }
      }

      // 2) refresco base para ver IDs y estado real
      const { data: all } = await api.calificaciones.list();
      setCalifs(all ?? []);
      alert("Calificaciones guardadas.");
    } catch (e: any) {
      console.error(e);
      alert(e?.response?.data?.message ?? "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trimestre</CardTitle>
              <CardDescription>
                Elegí el periodo que querés trabajar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {triOpts.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No hay trimestres configurados.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {triOpts.map((o) => {
                    const active = String(o.id) === triId;
                    return (
                      <Button
                        key={o.id}
                        variant={active ? "default" : "outline"}
                        className={cn(
                          "justify-between",
                          !active && "bg-muted/40 hover:bg-muted",
                        )}
                        onClick={() => setTriId(String(o.id))}
                      >
                        <span>{o.label}</span>
                        {o.cerrado && (
                          <Badge variant="destructive" className="ml-3">
                            Cerrado
                          </Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Materia</CardTitle>
              <CardDescription>
                Seleccioná la materia de la sección.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {matOpts.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No hay materias asignadas a esta sección.
                </div>
              ) : (
                <ScrollArea className="h-[240px] pr-2">
                  <div className="flex flex-col gap-2">
                    {matOpts.map((o) => {
                      const active = String(o.id) === smId;
                      return (
                        <Button
                          key={o.id}
                          variant={active ? "default" : "outline"}
                          className={cn(
                            "justify-start text-left",
                            !active && "bg-muted/40 hover:bg-muted",
                          )}
                          onClick={() => setSmId(String(o.id))}
                        >
                          {o.label}
                        </Button>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedMateria?.label ?? "Elegí una materia"}
              </CardTitle>
              {selectedTrimestre ? (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{selectedTrimestre.label}</Badge>
                  <Badge variant="outline">
                    {rows.length} alumno{rows.length === 1 ? "" : "s"}
                  </Badge>
                </div>
              ) : (
                <CardDescription>
                  Seleccioná un trimestre para comenzar
                </CardDescription>
              )}
            </CardHeader>
            {triCerrado && (
              <CardContent>
                <Badge variant="destructive">Trimestre cerrado</Badge>
                <p className="mt-3 text-sm text-muted-foreground">
                  Los datos se muestran solo para consulta.
                </p>
              </CardContent>
            )}
          </Card>

          {(loading || loadingRows) && (
            <Card>
              <CardContent className="py-6 text-sm">Cargando…</CardContent>
            </Card>
          )}

          {!loading && !loadingRows && (!triId || !smId) && (
            <Card>
              <CardContent className="py-6 text-sm text-muted-foreground">
                Seleccioná un trimestre y una materia para cargar
                calificaciones.
              </CardContent>
            </Card>
          )}

          {!loading && !loadingRows && triId && smId && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Listado de alumnos</CardTitle>
                  <CardDescription>
                    Registrá la nota conceptual y observaciones para cada
                    estudiante.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ScrollArea className="max-h-[60vh]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[45%]">Alumno</TableHead>
                          <TableHead className="w-[30%]">
                            Nota conceptual
                          </TableHead>
                          <TableHead>Observaciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.map((r) => (
                          <TableRow key={r.matriculaId}>
                            <TableCell className="font-medium">
                              {r.nombre}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={r.notaConceptual ?? "__none"}
                                onValueChange={(v) =>
                                  onSet(
                                    r.matriculaId,
                                    "notaConceptual",
                                    v === "__none"
                                      ? null
                                      : (v as CalificacionConceptual),
                                  )
                                }
                                disabled={triCerrado}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccioná" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none">—</SelectItem>
                                  {CONCEPTOS.map((c) => (
                                    <SelectItem key={c} value={c}>
                                      {c.replace("_", " ")}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                value={r.observaciones ?? ""}
                                onChange={(e) =>
                                  onSet(
                                    r.matriculaId,
                                    "observaciones",
                                    e.target.value,
                                  )
                                }
                                disabled={triCerrado}
                                placeholder="Opcional"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                  {rows.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No hay alumnos inscriptos en esta materia para el
                      trimestre seleccionado.
                    </p>
                  )}
                </CardContent>
                {!triCerrado && rows.length > 0 && (
                  <CardFooter className="flex justify-end">
                    <Button onClick={save} disabled={saving}>
                      Guardar cambios
                    </Button>
                  </CardFooter>
                )}
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Exámenes del trimestre</CardTitle>
                  <CardDescription>
                    Consultá las notas de los exámenes asociados a la materia
                    seleccionada.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingExamenes ? (
                    <div className="py-4 text-sm text-muted-foreground">
                      Cargando exámenes…
                    </div>
                  ) : examenes.length === 0 ? (
                    <div className="py-4 text-sm text-muted-foreground">
                      No hay exámenes registrados para el trimestre
                      seleccionado.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {examenes.map((examen) => {
                        const { titulo, descripcion } = splitTema(
                          (examen.evaluacion as any)?.tema ?? "",
                        );
                        const fechaLabel = formatFechaCorta(
                          (examen.evaluacion as any)?.fecha,
                        );
                        const peso = (examen.evaluacion as any)?.peso;
                        const hasChanges = examHasChanges(examen);
                        return (
                          <div
                            key={examen.evaluacion.id}
                            className="space-y-3 rounded-md border p-3"
                          >
                            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                              <div>
                                <div className="text-sm font-medium">
                                  {titulo}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {descripcion
                                    ? `${descripcion} · ${fechaLabel}`
                                    : fechaLabel}
                                </div>
                              </div>
                              {typeof peso === "number" && (
                                <div className="text-xs text-muted-foreground">
                                  Peso: {peso}
                                </div>
                              )}
                            </div>

                            {examen.notas.length === 0 ? (
                              <div className="text-sm text-muted-foreground">
                                No hay notas registradas para este examen.
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {examen.notas.map((row) => (
                                  <div
                                    key={`${examen.evaluacion.id}-${row.matriculaId}`}
                                    className="grid grid-cols-1 gap-2 rounded border p-3 text-sm md:grid-cols-12 md:items-start"
                                  >
                                    <div className="md:col-span-4 font-medium">
                                      {row.nombre}
                                    </div>
                                    <div className="md:col-span-2">
                                      <Input
                                        type="number"
                                        min={1}
                                        max={10}
                                        step={1}
                                        inputMode="numeric"
                                        placeholder="Nota"
                                        value={
                                          row.notaNumerica == null
                                            ? ""
                                            : String(row.notaNumerica)
                                        }
                                        onChange={(e) =>
                                          handleExamNotaChange(
                                            examen.evaluacion.id,
                                            row.matriculaId,
                                            e.target.value,
                                          )
                                        }
                                        disabled={
                                          triCerrado ||
                                          savingExamId === examen.evaluacion.id
                                        }
                                      />
                                    </div>
                                    <div className="md:col-span-6">
                                      <Textarea
                                        rows={2}
                                        placeholder="Observaciones"
                                        value={row.observaciones}
                                        onChange={(e) =>
                                          handleExamObservacionChange(
                                            examen.evaluacion.id,
                                            row.matriculaId,
                                            e.target.value,
                                          )
                                        }
                                        disabled={
                                          triCerrado ||
                                          savingExamId === examen.evaluacion.id
                                        }
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {!triCerrado && examen.notas.length > 0 && (
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() =>
                                    handleResetExamNotas(examen.evaluacion.id)
                                  }
                                  disabled={
                                    !hasChanges ||
                                    savingExamId === examen.evaluacion.id
                                  }
                                >
                                  Descartar cambios
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleSaveExamNotas(examen.evaluacion.id)
                                  }
                                  disabled={
                                    !hasChanges ||
                                    savingExamId === examen.evaluacion.id
                                  }
                                >
                                  {savingExamId === examen.evaluacion.id
                                    ? "Guardando…"
                                    : "Guardar notas"}
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
