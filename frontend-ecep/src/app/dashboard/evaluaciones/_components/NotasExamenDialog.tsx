"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import type {
  EvaluacionDTO,
  ResultadoEvaluacionDTO,
  ResultadoEvaluacionCreateDTO,
  ResultadoEvaluacionUpdateDTO,
  AlumnoLiteDTO,
  TrimestreDTO,
  SeccionMateriaDTO,
} from "@/types/api-generated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getTrimestreEstado, isFechaDentroDeTrimestre } from "@/lib/trimestres";

type Row = {
  matriculaId: number;
  nombre: string;
  notaNumerica?: number | null;
  notaConceptual?: string | null;
  observaciones?: string | null;
  resultadoId?: number;
};

export default function NotasExamenDialog({
  open,
  onOpenChange,
  evaluacion,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  evaluacion: EvaluacionDTO;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [trimestres, setTrimestres] = useState<TrimestreDTO[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fecha = (evaluacion as any)?.fecha as string | undefined;

  const trimestreId = useMemo(() => {
    const triId = (evaluacion as any)?.trimestreId as number | undefined;
    if (triId) return triId;
    if (!fecha) return undefined;
    const tri = trimestres.find((t) => isFechaDentroDeTrimestre(fecha, t));
    return tri?.id;
  }, [evaluacion, trimestres, fecha]);

  const trimestreCerrado = useMemo(() => {
    if (!trimestreId) return false;
    const tri = trimestres.find((t) => t.id === trimestreId);
    return getTrimestreEstado(tri) === "cerrado";
  }, [trimestres, trimestreId]);

  const fetchSeccionIdFromEval = async (): Promise<number> => {
    const smId = (evaluacion as any)?.seccionMateriaId as number | undefined;
    if (!smId) throw new Error("La evaluación no tiene seccionMateriaId.");
    // byId si existe
    try {
      const sm = (await (api.seccionMaterias as any).byId?.(smId))?.data as
        | SeccionMateriaDTO
        | undefined;
      if (sm && (sm as any).seccionId) return (sm as any).seccionId as number;
    } catch {}
    // fallback list
    const all: SeccionMateriaDTO[] =
      (await api.seccionMaterias.list()).data ?? [];
    const found = all.find((x) => x.id === smId);
    const seccionId = (found as any)?.seccionId as number | undefined;
    if (!seccionId)
      throw new Error("No se pudo resolver la sección del examen.");
    return seccionId;
  };

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setErrorMsg(null);
        setLoading(true);

        const tri = (await api.trimestres.list()).data ?? [];
        setTrimestres(tri);

        const seccionId = await fetchSeccionIdFromEval();

        // roster de la sección en la fecha del examen
        const alumnos: AlumnoLiteDTO[] =
          (await api.seccionesAlumnos.bySeccionId(seccionId, fecha)).data ?? [];

        // resultados existentes
        let existentes: ResultadoEvaluacionDTO[] = [];
        try {
          existentes =
            (await api.resultadosEvaluacion.byEvaluacion(
              (evaluacion as any).id,
            )).data ?? [];
        } catch {
          const todos: ResultadoEvaluacionDTO[] =
            (await api.resultadosEvaluacion.list()).data ?? [];
          existentes = todos.filter(
            (r: any) => r.evaluacionId === (evaluacion as any).id,
          );
        }

        const byMat = new Map<number, ResultadoEvaluacionDTO>();
        for (const r of existentes) byMat.set((r as any).matriculaId, r);

        const rws: Row[] = alumnos
          .map((a) => {
            const ex = byMat.get(a.matriculaId);
            const name =
              (a as any).nombreCompleto ??
              ([(a as any).apellido ?? "", (a as any).nombre ?? ""]
                .join(" ")
                .trim() ||
                `Alumno #${a.matriculaId}`);
            return {
              matriculaId: a.matriculaId,
              nombre: name,
              notaNumerica:
                (ex as any)?.notaNumerica ??
                (ex as any)?.nota ??
                null,
              notaConceptual: (ex as any)?.notaConceptual ?? null,
              observaciones: (ex as any)?.observaciones ?? "",
              resultadoId: (ex as any)?.id,
            };
          })
          .sort((a, b) => a.nombre.localeCompare(b.nombre));

        setRows(rws);
      } catch (e: any) {
        setErrorMsg(
          e?.response?.data?.message ??
            e?.message ??
            "Fallo al cargar las notas.",
        );
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, (evaluacion as any)?.id]);

  const setNota = (matriculaId: number, value: string) => {
    const normalizedValue = value.replace(",", ".").trim();
    const parsed = normalizedValue === "" ? null : Number(normalizedValue);
    if (
      normalizedValue !== "" &&
      (!Number.isFinite(parsed) || parsed < 1 || parsed > 10)
    ) {
      return;
    }
    setRows((prev) =>
      prev.map((r) =>
        r.matriculaId === matriculaId ? { ...r, notaNumerica: parsed } : r,
      ),
    );
  };
  const setObs = (matriculaId: number, value: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.matriculaId === matriculaId
          ? { ...r, observaciones: value }
          : r,
      ),
    );
  };

  const save = async () => {
    if (trimestreCerrado) {
      alert("Trimestre cerrado. Solo lectura.");
      return;
    }
    try {
      setSaving(true);

      const pending: Promise<unknown>[] = [];

      for (const r of rows) {
        const basePayload: ResultadoEvaluacionUpdateDTO = {
          notaNumerica: r.notaNumerica ?? null,
          notaConceptual: r.notaConceptual ?? null,
          observaciones: r.observaciones ?? null,
        };

        if (r.resultadoId) {
          pending.push(
            api.resultadosEvaluacion.update(r.resultadoId, basePayload),
          );
          continue;
        }

        const shouldPersist =
          basePayload.notaNumerica !== null ||
          (basePayload.observaciones ?? "").toString().trim().length > 0 ||
          (basePayload.notaConceptual ?? "").toString().trim().length > 0;

        if (!shouldPersist) continue;

        const body: ResultadoEvaluacionCreateDTO = {
          evaluacionId: (evaluacion as any).id,
          matriculaId: r.matriculaId,
          ...basePayload,
        } as ResultadoEvaluacionCreateDTO;
        pending.push(api.resultadosEvaluacion.create(body));
      }

      await Promise.all(pending);

      alert("Notas guardadas.");
      onOpenChange(false);
    } catch (e: any) {
      alert(
        e?.response?.data?.message ??
          e?.message ??
          "No se pudieron guardar las notas.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Notas — {(evaluacion as any).tema ?? "Evaluación"}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-sm p-2">Cargando…</div>
        ) : errorMsg ? (
          <div className="text-sm text-red-600">{errorMsg}</div>
        ) : (
          <>
            {trimestreCerrado && (
              <div className="rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-sm p-2 mb-2">
                Este trimestre está cerrado. Solo lectura.
              </div>
            )}

            <div className="space-y-2 max-h-[55vh] overflow-auto pr-1">
              {rows.map((r) => (
                <div
                  key={r.matriculaId}
                  className="grid grid-cols-12 items-start gap-2 border rounded-md p-2"
                >
                  <div className="col-span-4 text-sm">{r.nombre}</div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      step={1}
                      inputMode="numeric"
                      placeholder="Nota"
                      value={
                        r.notaNumerica === null || r.notaNumerica === undefined
                          ? ""
                          : String(r.notaNumerica)
                      }
                      onChange={(e) => setNota(r.matriculaId, e.target.value)}
                      disabled={trimestreCerrado}
                    />
                  </div>
                  <div className="col-span-6">
                    <Textarea
                      rows={2}
                      placeholder="Observación"
                      value={r.observaciones ?? ""}
                      onChange={(e) => setObs(r.matriculaId, e.target.value)}
                      disabled={trimestreCerrado}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={save} disabled={saving || trimestreCerrado}>
                {saving ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
