"use client";

import { useEffect, useMemo, useState } from "react";
import LoadingState from "@/components/common/LoadingState";
import { useParams, useRouter } from "next/navigation";
import { gestionAcademica } from "@/services/api/modules";
import type {
  EvaluacionDTO,
  ResultadoEvaluacionDTO,
  SeccionDTO,
  MateriaDTO,
  AlumnoLiteDTO,
} from "@/types/api-generated";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { School, Clock3 } from "lucide-react";
import { useViewerScope } from "@/hooks/scope/useViewerScope";
import { toast } from "sonner";
import { UserRole } from "@/types/api-generated";

const fechaLargaFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "long",
});

function formatFecha(fecha?: string | null) {
  if (!fecha) return "Sin fecha";
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return fecha;
  return fechaLargaFormatter.format(date);
}

function splitTema(tema?: string | null) {
  if (!tema) return { nombre: "", descripcion: "" };
  const [first, ...rest] = tema.split(" — ");
  return {
    nombre: (first ?? "").trim(),
    descripcion: rest.join(" — ").trim(),
  };
}

type NotaRow = {
  matriculaId: number;
  nombre: string;
  notaNumerica: number | null;
  observaciones: string;
  resultadoId?: number;
};

export default function ExamenDetailPage() {
  const params = useParams<{ id: string }>();
  const examenId = Number(params?.id);
  const router = useRouter();
  const { activeRole } = useViewerScope();
  const role = activeRole ?? null;
  const isAdmin = role === UserRole.ADMIN;

  const isStaff =
    role === UserRole.DIRECTOR ||
    role === UserRole.SECRETARY ||
    role === UserRole.COORDINATOR;
  const isTeacher =
    role === UserRole.TEACHER || role === UserRole.ALTERNATE;
  const canEdit = !isAdmin && (isStaff || isTeacher);


  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [evaluacion, setEvaluacion] = useState<EvaluacionDTO | null>(null);
  const [seccion, setSeccion] = useState<SeccionDTO | null>(null);
  const [materia, setMateria] = useState<MateriaDTO | null>(null);
  const [resultados, setResultados] = useState<ResultadoEvaluacionDTO[]>([]);
  const [alumnos, setAlumnos] = useState<AlumnoLiteDTO[]>([]);

  const [editOpen, setEditOpen] = useState(false);
  const [editNombre, setEditNombre] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editFecha, setEditFecha] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [notasRows, setNotasRows] = useState<NotaRow[]>([]);
  const [savingNotas, setSavingNotas] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(examenId)) {
      setError("Identificador de examen inválido.");
      setLoading(false);
      return;
    }

    if (isAdmin) {
      setError("El perfil de Administración no tiene acceso a este examen.");
      setLoading(false);
      return;
    }

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const evalRes = await gestionAcademica.evaluaciones.byId(examenId);
        const evalData = evalRes.data;
        if (!evalData) throw new Error("El examen no existe o fue eliminado.");

        const seccionMateriaId = (evalData as any).seccionMateriaId as number | undefined;
        if (!seccionMateriaId) throw new Error("El examen no tiene materia asociada.");

        const seccionMaterias = (await gestionAcademica.seccionMaterias.list()).data ?? [];
        const sm = seccionMaterias.find((x) => x.id === seccionMateriaId) ?? null;
        if (!sm) throw new Error("No se encontró la asignación de materia para este examen.");

        const seccionId = (sm as any).seccionId as number | undefined;
        const materiaId = (sm as any).materiaId as number | undefined;

        const [seccionResp, materiaResp, resultadosResp, alumnosResp] = await Promise.all([
          seccionId
            ? gestionAcademica.secciones.byId(seccionId).then((r) => r.data)
            : Promise.resolve(null),
          materiaId
            ? gestionAcademica.materias.byId(materiaId).then((r) => r.data)
            : Promise.resolve(null),
          gestionAcademica.resultadosEvaluacion
            .byEvaluacion(examenId)
            .then((r) => r.data ?? []),
          seccionId
            ? gestionAcademica.seccionesAlumnos
                .bySeccionId(seccionId, (evalData as any).fecha)
                .then((r) => r.data ?? [])
            : Promise.resolve([]),
        ]);

        if (!alive) return;

        setEvaluacion(evalData);
        setSeccion(seccionResp);
        setMateria(materiaResp);
        setResultados(resultadosResp);
        setAlumnos(alumnosResp);
        const split = splitTema((evalData as any).tema ?? "");
        setEditNombre(split.nombre);
        setEditDescripcion(split.descripcion);
        setEditFecha((evalData as any).fecha ?? "");
      } catch (e: any) {
        if (!alive) return;
        setError(
          e?.response?.data?.message ??
            e?.message ??
            "No pudimos cargar el examen solicitado.",
        );
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [examenId, isAdmin]);

  if (isAdmin) {
    return (
      
        <div className="p-6 text-sm">
          403 — El perfil de Administración no tiene acceso a Exámenes.
        </div>
      
    );
  }

  const nombreAlumnosPorMatricula = useMemo(() => {
    const map = new Map<number, string>();
    for (const a of alumnos) map.set(a.matriculaId, (a as any).nombreCompleto ?? "—");
    return map;
  }, [alumnos]);

  const composeNotaRows = useMemo(() => {
    const mapResultados = new Map<number, ResultadoEvaluacionDTO>();
    for (const res of resultados) {
      const matriculaId = (res as any).matriculaId as number | undefined;
      if (matriculaId != null) mapResultados.set(matriculaId, res);
    }

    const processed = new Set<number>();
    const sortedAlumnos = [...alumnos].sort((a, b) => {
      const nombreA = ((a as any).nombreCompleto ?? "").toLowerCase();
      const nombreB = ((b as any).nombreCompleto ?? "").toLowerCase();
      return nombreA.localeCompare(nombreB);
    });

    const rows: NotaRow[] = [];

    for (const alumno of sortedAlumnos) {
      const matriculaId = alumno.matriculaId;
      const existente = mapResultados.get(matriculaId);
      processed.add(matriculaId);
      rows.push({
        matriculaId,
        nombre:
          (alumno as any).nombreCompleto ??
          `Matricula ${matriculaId}`,
        notaNumerica: (existente as any)?.notaNumerica ?? null,
        observaciones: ((existente as any)?.observaciones ?? "") || "",
        resultadoId: (existente as any)?.id,
      });
    }

    for (const res of resultados) {
      const matriculaId = (res as any).matriculaId as number | undefined;
      if (matriculaId == null || processed.has(matriculaId)) continue;
      rows.push({
        matriculaId,
        nombre: nombreAlumnosPorMatricula.get(matriculaId) ?? `Matricula ${matriculaId}`,
        notaNumerica: (res as any).notaNumerica ?? null,
        observaciones: ((res as any).observaciones ?? "") || "",
        resultadoId: res.id,
      });
    }

    rows.sort((a, b) => a.nombre.localeCompare(b.nombre));
    return rows;
  }, [alumnos, resultados, nombreAlumnosPorMatricula]);

  useEffect(() => {
    setNotasRows(composeNotaRows.map((row) => ({ ...row })));
  }, [composeNotaRows]);

  const handleNotaChange = (matriculaId: number, value: string) => {
    const normalized = value.replace(",", ".").trim();
    const parsed = normalized === "" ? null : Number(normalized);
    if (
      normalized !== "" &&
      (!Number.isFinite(parsed) || parsed < 1 || parsed > 10)
    ) {
      return;
    }
    setNotasRows((prev) =>
      prev.map((row) =>
        row.matriculaId === matriculaId
          ? { ...row, notaNumerica: parsed }
          : row,
      ),
    );
  };

  const handleObservacionChange = (matriculaId: number, value: string) => {
    setNotasRows((prev) =>
      prev.map((row) =>
        row.matriculaId === matriculaId
          ? { ...row, observaciones: value }
          : row,
      ),
    );
  };

  const handleCancelNotas = () => {
    setNotasRows(composeNotaRows.map((row) => ({ ...row })));
  };

  const handleSaveNotas = async () => {
    if (!canEdit) return;
    try {
      setSavingNotas(true);
      const pending: Promise<unknown>[] = [];

      for (const row of notasRows) {
        const observacion = (row.observaciones ?? "").trim();
        const basePayload: ResultadoEvaluacionUpdateDTO = {
          notaNumerica: row.notaNumerica ?? null,
          notaConceptual: null,
          observaciones: observacion ? row.observaciones : null,
        };

        if (row.resultadoId) {
          pending.push(
            gestionAcademica.resultadosEvaluacion.update(
              row.resultadoId,
              basePayload,
            ),
          );
          continue;
        }

        const shouldPersist =
          basePayload.notaNumerica !== null || observacion.length > 0;

        if (!shouldPersist) continue;

        pending.push(
          gestionAcademica.resultadosEvaluacion.create({
            evaluacionId: examenId,
            matriculaId: row.matriculaId,
            ...basePayload,
          } as ResultadoEvaluacionCreateDTO),
        );
      }

      await Promise.all(pending);
      const refreshed = await gestionAcademica.resultadosEvaluacion.byEvaluacion(
        examenId,
      );
      setResultados(refreshed.data ?? []);
      toast.success("Notas guardadas.");
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ??
          e?.message ??
          "No se pudieron guardar las notas.",
      );
    } finally {
      setSavingNotas(false);
    }
  };

  const handleOpenEdit = () => {
    if (!evaluacion) return;
    const split = splitTema((evaluacion as any).tema ?? "");
    setEditNombre(split.nombre);
    setEditDescripcion(split.descripcion);
    setEditFecha((evaluacion as any).fecha ?? "");
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!evaluacion) return;
    try {
      setSavingEdit(true);
      const nombre = editNombre.trim() || "Evaluación";
      const descripcion = editDescripcion.trim();
      const temaFinal = descripcion ? `${nombre} — ${descripcion}` : nombre;
      const payload: EvaluacionDTO = {
        ...evaluacion,
        fecha: editFecha || (evaluacion as any).fecha,
        tema: temaFinal,
      } as EvaluacionDTO;
      await gestionAcademica.evaluaciones.update(examenId, payload as any);
      setEvaluacion(payload);
      if (seccion && (payload as any).fecha) {
        gestionAcademica.seccionesAlumnos
          .bySeccionId(seccion.id, (payload as any).fecha)
          .then((r) => setAlumnos(r.data ?? []))
          .catch(() => undefined);
      }
      setEditOpen(false);
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ??
          e?.message ??
          "No pudimos actualizar los datos del examen.",
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const { nombre: nombreExamen, descripcion: descripcionExamen } = useMemo(
    () => splitTema((evaluacion as any)?.tema ?? ""),
    [evaluacion],
  );
  const tituloExamen = nombreExamen || "Evaluación";
  const fechaTexto = formatFecha((evaluacion as any)?.fecha);
  const seccionEtiqueta = seccion
    ? `${seccion.gradoSala ?? ""} ${seccion.division ?? ""}`.trim() || `Sección #${seccion.id}`
    : "Sección";
  const turnoEtiqueta = seccion?.turno ?? "—";

  if (loading) {
    return (
      
        <LoadingState label="Cargando examen…" />
      
    );
  }

  if (error) {
    return (
      
        <div className="p-6 space-y-4">
          <Button variant="outline" onClick={() => router.back()}>
            Volver
          </Button>
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        </div>
      
    );
  }

  if (!evaluacion) {
    return (
      
        <div className="p-6 space-y-4">
          <Button variant="outline" onClick={() => router.back()}>
            Volver
          </Button>
          <div className="rounded-md border p-4 text-sm">
            No encontramos datos para el examen solicitado.
          </div>
        </div>
      
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
        <Button variant="outline" onClick={() => router.back()}>
          Volver
        </Button>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{tituloExamen}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="flex items-center gap-1">
                <School className="h-3 w-3" /> {seccionEtiqueta}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock3 className="h-3 w-3" /> Turno {turnoEtiqueta}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {canEdit && (
              <Button onClick={handleOpenEdit}>Editar examen</Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalle del examen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><strong>Nombre:</strong> {tituloExamen}</div>
            <div>
              <strong>Descripción:</strong> {descripcionExamen || "—"}
            </div>
            <div><strong>Materia:</strong> {materia?.nombre ?? "—"}</div>
            <div><strong>Fecha:</strong> {fechaTexto}</div>
            <div>
              <strong>Trimestre:</strong> {(evaluacion as any).trimestreId ?? "—"}
            </div>
            {typeof (evaluacion as any).peso === "number" && (
              <div>
                <strong>Peso:</strong> {(evaluacion as any).peso}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notas registradas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {notasRows.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                Todavía no hay notas cargadas para este examen.
              </div>
            ) : (
              <div className="space-y-3">
                {notasRows.map((row) => (
                  <div
                    key={row.matriculaId}
                    className="grid grid-cols-1 gap-2 rounded-md border p-3 text-sm md:grid-cols-12 md:items-start"
                  >
                    <div className="md:col-span-4 font-medium">{row.nombre}</div>

                    {canEdit ? (
                      <div className="md:col-span-2">
                        <Input
                          type="number"
                          min={1}
                          max={10}
                          step={1}
                          inputMode="numeric"
                          placeholder="Nota"
                          value={
                            row.notaNumerica === null || row.notaNumerica === undefined
                              ? ""
                              : String(row.notaNumerica)
                          }
                          onChange={(e) =>
                            handleNotaChange(row.matriculaId, e.target.value)
                          }
                          disabled={savingNotas}
                        />
                      </div>
                    ) : (
                      <div className="md:col-span-2">
                        Nota: {row.notaNumerica ?? "—"}
                      </div>
                    )}

                    {canEdit ? (
                      <div className="md:col-span-6">
                        <Textarea
                          rows={2}
                          placeholder="Observaciones"
                          value={row.observaciones}
                          onChange={(e) =>
                            handleObservacionChange(row.matriculaId, e.target.value)
                          }
                          disabled={savingNotas}
                        />
                      </div>
                    ) : (
                      <div className="md:col-span-6 text-muted-foreground">
                        Observación: {row.observaciones || "Sin observaciones"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {canEdit && notasRows.length > 0 && (
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={handleCancelNotas}
                  disabled={savingNotas}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveNotas} disabled={savingNotas}>
                  {savingNotas ? "Guardando…" : "Guardar notas"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar examen</DialogTitle>
              <DialogDescription>
                Modificá el nombre, la descripción o la fecha del examen. El trimestre permanece sin cambios.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Nombre</label>
                <Input
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  placeholder="Nombre del examen"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">
                  Descripción
                </label>
                <Textarea
                  rows={3}
                  value={editDescripcion}
                  onChange={(e) => setEditDescripcion(e.target.value)}
                  placeholder="Descripción u observaciones generales"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Fecha</label>
                <DatePicker
                  value={editFecha || undefined}
                  onChange={(value) => setEditFecha(value ?? "")}
                  required
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit} disabled={savingEdit || !editFecha.trim()}>
                {savingEdit ? "Guardando…" : "Guardar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    
  );
}
