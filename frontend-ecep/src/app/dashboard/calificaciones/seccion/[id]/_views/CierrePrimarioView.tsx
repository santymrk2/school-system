"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { CalificacionConceptual, EvaluacionDTO, ResultadoEvaluacionDTO } from "@/types/api-generated";
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

export default function CierrePrimarioView({
  seccionId,
}: {
  seccionId: number;
}) {
  const hoy = new Date().toISOString().slice(0, 10);

  // catálogos
  const [trimestres, setTrimestres] = useState<any[]>([]);
  const [seccionMaterias, setSeccionMaterias] = useState<any[]>([]);
  const [materias, setMaterias] = useState<any[]>([]);
  const [promediosExamenes, setPromediosExamenes] = useState<Record<number, number>>({});
  const [loadingPromedios, setLoadingPromedios] = useState(false);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [califs, setCalifs] = useState<any[]>([]);
  const [attendanceByMatricula, setAttendanceByMatricula] = useState<
    Record<
      number,
      {
        percentage: number | null;
        presents: number;
        absents: number;
        total: number;
        hasData: boolean;
      }
    >
  >({});

  // UI
  const [triId, setTriId] = useState<string>("");
  const [smId, setSmId] = useState<string>("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRows, setLoadingRows] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // carga base
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [triRes, smRes, matRes, aluRes, cRes] = await Promise.all([
          api.trimestres.list(), // { id, orden, cerrado, fechaInicio, fechaFin, periodoEscolarId }
          api.seccionMaterias.list(), // { id, seccionId, materiaId, materia{nombre}? }
          api.materias.list(),
          api.seccionesAlumnos.bySeccionId(seccionId, hoy), // [{ matriculaId, nombre/nombreCompleto }]
          api.calificaciones.list(), // [{ id, trimestreId, seccionMateriaId, matriculaId, ... }]
        ]);
        if (!alive) return;
        setTrimestres(triRes.data ?? []);
        setMaterias(matRes.data ?? []);
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

  const materiasPorId = useMemo(() => {
    const map = new Map<number, any>();
    for (const materia of materias ?? []) {
      if (typeof materia?.id === "number") {
        map.set(materia.id, materia);
      }
    }
    return map;
  }, [materias]);

  const matOpts = useMemo(
    () =>
      (seccionMaterias ?? []).map((sm: any) => {
        const materiaId = sm.materiaId ?? sm.materia?.id;
        const materia =
          sm.materia ??
          (typeof materiaId === "number"
            ? materiasPorId.get(materiaId)
            : undefined);
        const label =
          materia?.nombre ??
          (typeof materiaId === "number"
            ? `Materia #${materiaId}`
            : `Materia #${sm.id}`);
        return { id: sm.id, label };
      }),
    [seccionMaterias, materiasPorId],
  );

  const activeTrimestre = useMemo(() => {
    if (!triId) return null;
    return trimestres.find((x) => x.id === Number(triId)) ?? null;
  }, [trimestres, triId]);

  const triCerrado = useMemo(() => {
    return !!activeTrimestre?.cerrado;
  }, [activeTrimestre]);

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
      setPromediosExamenes({});
      setLoadingPromedios(false);
      return;
    }
    const trimestreId = Number(triId);
    const seccionMateriaId = Number(smId);
    if (!Number.isFinite(trimestreId) || !Number.isFinite(seccionMateriaId)) {
      setPromediosExamenes({});
      setLoadingPromedios(false);
      return;
    }

    let alive = true;
    (async () => {
      try {
        setLoadingPromedios(true);
        const evalRes = await api.evaluaciones.search({
          seccionId,
          trimestreId,
        });
        if (!alive) return;

        const allEvaluaciones = (evalRes.data ?? []) as EvaluacionDTO[];
        const filtered = allEvaluaciones.filter(
          (ev: any) =>
            (ev?.seccionMateriaId ?? ev?.seccionMateria?.id) === seccionMateriaId,
        );

        if (filtered.length === 0) {
          if (alive) setPromediosExamenes({});
          return;
        }

        const resultadosPorEvaluacion = await Promise.all(
          filtered.map((ev) =>
            api.resultadosEvaluacion
              .byEvaluacion(ev.id)
              .then((r) => (r.data ?? []) as ResultadoEvaluacionDTO[])
              .catch(() => []),
          ),
        );
        if (!alive) return;

        const totals = new Map<number, { sum: number; count: number }>();
        for (const resultados of resultadosPorEvaluacion) {
          for (const res of resultados) {
            const matriculaId = (res as any)?.matriculaId;
            const nota = (res as any)?.notaNumerica;
            if (typeof matriculaId !== "number" || typeof nota !== "number") {
              continue;
            }
            const entry = totals.get(matriculaId) ?? { sum: 0, count: 0 };
            entry.sum += nota;
            entry.count += 1;
            totals.set(matriculaId, entry);
          }
        }

        const averages: Record<number, number> = {};
        totals.forEach(({ sum, count }, matriculaId) => {
          if (count > 0) {
            averages[matriculaId] = Number((sum / count).toFixed(2));
          }
        });

        if (alive) {
          setPromediosExamenes(averages);
        }
      } catch (err) {
        console.error(
          "[CierrePrimarioView] No se pudieron calcular los promedios de exámenes",
          err,
        );
        if (alive) {
          setPromediosExamenes({});
        }
      } finally {
        if (alive) {
          setLoadingPromedios(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [triId, smId, seccionId]);

  useEffect(() => {
    const start = (activeTrimestre as any)?.fechaInicio;
    const end = (activeTrimestre as any)?.fechaFin;

    if (!triId || !start || !end) {
      setAttendanceByMatricula({});
      setLoadingAttendance(false);
      return;
    }

    let alive = true;
    (async () => {
      try {
        setLoadingAttendance(true);
        const { data } = await api.asistencias.resumenPorAlumno(
          seccionId,
          start,
          end,
        );
        if (!alive) return;

        const map: Record<
          number,
          {
            percentage: number | null;
            presents: number;
            absents: number;
            total: number;
            hasData: boolean;
          }
        > = {};

        for (const item of data ?? []) {
          const rawMatriculaId =
            (item as any)?.matriculaId ??
            (item as any)?.alumnoId ??
            (item as any)?.id;
          if (typeof rawMatriculaId !== "number") {
            continue;
          }

          const presents = typeof item.presentes === "number" ? item.presentes : 0;
          const absents = typeof item.ausentes === "number" ? item.ausentes : 0;
          const totalFromDto =
            typeof (item as any)?.total === "number"
              ? (item as any).total
              : typeof item.totalClases === "number"
                ? item.totalClases
                : undefined;
          const computedTotal =
            typeof totalFromDto === "number"
              ? totalFromDto
              : presents + absents > 0
                ? presents + absents
                : 0;
          const rawPercentage =
            item.porcentaje != null
              ? Number(item.porcentaje)
              : computedTotal > 0
                ? (presents / computedTotal) * 100
                : null;
          const percentage =
            rawPercentage != null
              ? Math.max(0, Math.min(100, Number(rawPercentage.toFixed(2))))
              : null;

          map[rawMatriculaId] = {
            percentage,
            presents,
            absents,
            total: computedTotal,
            hasData:
              computedTotal > 0 ||
              presents > 0 ||
              absents > 0 ||
              percentage != null,
          };
        }

        if (alive) {
          setAttendanceByMatricula(map);
        }
      } catch (error) {
        console.error(
          "[CierrePrimarioView] No se pudo obtener el resumen de asistencia",
          error,
        );
        if (alive) {
          setAttendanceByMatricula({});
        }
      } finally {
        if (alive) {
          setLoadingAttendance(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [activeTrimestre, seccionId, triId]);

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
            await api.calificaciones.update(existing.id, {
              ...payload,
              id: existing.id,
            });
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
      <Card>
        <CardHeader>
          <CardTitle>Configurar calificaciones</CardTitle>
          <CardDescription>
            Elegí el trimestre y la materia para gestionar las notas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Trimestre</Label>
              {triOpts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay trimestres configurados.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {triOpts.map((o) => {
                    const active = String(o.id) === triId;
                    return (
                      <Button
                        key={o.id}
                        type="button"
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
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Materia</Label>
              {matOpts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay materias asignadas a esta sección.
                </p>
              ) : (
                <Select
                  value={smId || undefined}
                  onValueChange={(value) => setSmId(String(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccioná una materia" />
                  </SelectTrigger>
                  <SelectContent>
                    {matOpts.map((o) => (
                      <SelectItem key={o.id} value={String(o.id)}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {(loading || loadingRows) && (
        <Card>
          <CardContent className="py-6 text-sm">Cargando…</CardContent>
        </Card>
      )}

      {!loading && !loadingRows && (!triId || !smId) && (
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            Seleccioná un trimestre y una materia para cargar calificaciones.
          </CardContent>
        </Card>
      )}

      {!loading && !loadingRows && triId && smId && (
        <Card>
          <CardHeader>
            <CardTitle>Listado de alumnos</CardTitle>
            <CardDescription>
              Registrá la nota conceptual y observaciones para cada estudiante.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {triCerrado && (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant="destructive">Trimestre cerrado</Badge>
                <span className="text-muted-foreground">
                  Los datos se muestran solo para consulta.
                </span>
              </div>
            )}
            <ScrollArea className="max-h-[60vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[32%]">Alumno</TableHead>
                    <TableHead className="w-[22%]">
                      Promedio asistencia
                    </TableHead>
                    <TableHead className="w-[18%]">
                      Promedio exámenes
                    </TableHead>
                    <TableHead className="w-[18%]">Nota conceptual</TableHead>
                    <TableHead>Observaciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => {
                    const promedio = promediosExamenes[r.matriculaId];
                    const attendance = attendanceByMatricula[r.matriculaId];
                    const attendancePercentRaw =
                      attendance?.percentage ?? null;
                    const absencePercentRaw =
                      attendance && attendance.total > 0
                        ? Math.max(
                            0,
                            Math.min(
                              100,
                              Number(
                                (
                                  ((attendance.total - attendance.presents) /
                                    (attendance.total || 1)) *
                                  100
                                ).toFixed(2),
                              ),
                            ),
                          )
                        : attendancePercentRaw != null
                          ? Math.max(
                              0,
                              Math.min(
                                100,
                                Number((100 - attendancePercentRaw).toFixed(2)),
                              ),
                            )
                          : null;
                    const safeAttendancePercent =
                      attendancePercentRaw != null
                        ? Math.max(0, Math.min(100, attendancePercentRaw))
                        : 0;
                    const safeAbsencePercent =
                      absencePercentRaw != null
                        ? Math.max(0, Math.min(100, absencePercentRaw))
                        : Math.max(
                            0,
                            Math.min(
                              100,
                              Number((100 - safeAttendancePercent).toFixed(2)),
                            ),
                          );

                    return (
                      <TableRow key={r.matriculaId}>
                        <TableCell className="font-medium">{r.nombre}</TableCell>
                        <TableCell>
                          {loadingAttendance ? (
                            <span className="text-xs text-muted-foreground">
                              Calculando…
                            </span>
                          ) : attendance?.hasData ? (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                <span>
                                  Asistió
                                  {" "}
                                  {safeAttendancePercent.toLocaleString("es-AR", {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  })}
                                  %
                                </span>
                                <span>
                                  Faltó
                                  {" "}
                                  {safeAbsencePercent.toLocaleString("es-AR", {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  })}
                                  %
                                </span>
                              </div>
                              <div className="h-2 overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full bg-emerald-500"
                                  style={{
                                    width: `${safeAttendancePercent}%`,
                                  }}
                                />
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                {attendance.presents} presentes
                                {attendance.total > 0 && (
                                  <>
                                    {" "}/ {attendance.total} clases
                                  </>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Sin registros
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {loadingPromedios ? (
                            <span className="text-xs text-muted-foreground">
                              Calculando…
                            </span>
                          ) : promedio != null ? (
                            promedio.toLocaleString("es-AR", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2,
                            })
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={r.notaConceptual ?? "__none"}
                            onValueChange={(v) =>
                              onSet(
                                r.matriculaId,
                                "notaConceptual",
                                v === "__none" ? null : (v as CalificacionConceptual),
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
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
            {rows.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No hay alumnos inscriptos en esta materia para el trimestre seleccionado.
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
      )}
    </div>
  );
}
