"use client";

import { useEffect, useMemo, useState } from "react";
import LoadingState from "@/components/common/LoadingState";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { asistencias, gestionAcademica } from "@/services/api/modules";
import type {
  DetalleAsistenciaDTO,
  DetalleAsistenciaCreateDTO,
  AlumnoLiteDTO,
  EstadoAsistencia,
} from "@/types/api-generated";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  seccionId: number;
  jornadaId: number;
  fecha: string; // YYYY-MM-DD
};

function fmt(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function alumnoName(a: any) {
  return (
    a?.nombreCompleto ??
    (a?.apellido && a?.nombre ? `${a.apellido}, ${a.nombre}` : null) ??
    a?.alumnoNombre ??
    a?.nombre ??
    `Alumno #${a?.matriculaId ?? a?.alumnoId ?? "?"}`
  );
}

export default function DetalleDiaDialog({
  open,
  onOpenChange,
  seccionId,
  jornadaId,
  fecha,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [alumnos, setAlumnos] = useState<AlumnoLiteDTO[]>([]);
  const [detalles, setDetalles] = useState<DetalleAsistenciaDTO[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);

  const detalleByMatricula = useMemo(() => {
    const m = new Map<number, DetalleAsistenciaDTO>();
    for (const d of detalles) m.set(d.matriculaId, d);
    return m;
  }, [detalles]);

  const presentes = detalles.filter((d) => d.estado === "PRESENTE").length;
  const total = alumnos.length || detalles.length;
  const porcentaje = total ? Math.round((presentes / total) * 100) : 0;

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoading(true);
        const [alRes, detRes] = await Promise.all([
          gestionAcademica.seccionesAlumnos.bySeccionId(seccionId, fecha),
          asistencias.detalles.byJornada(jornadaId),
        ]);
        setAlumnos(alRes.data ?? []);
        setDetalles(detRes.data ?? []);
      } catch (e: any) {
        toast.error(
          e?.response?.data?.message ??
            e?.message ??
            "No se pudo cargar el detalle",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [open, seccionId, jornadaId, fecha]);

  async function setEstado(matriculaId: number, estado: EstadoAsistencia) {
    try {
      setSavingId(matriculaId);
      const current = detalleByMatricula.get(matriculaId);
      if (current) {
        // Si no hay PUT, podés hacer delete + create. Aquí intento update:
        try {
          await asistencias.detalles.update(current.id, { estado } as any);
          setDetalles((prev) =>
            prev.map((d) => (d.id === current.id ? { ...d, estado } : d)),
          );
        } catch {
          await asistencias.detalles.delete(current.id);
          const body: DetalleAsistenciaCreateDTO = {
            jornadaId,
            matriculaId,
            estado,
            observacion: null,
          } as any;
          await asistencias.detalles.create(body);
          const reload = await asistencias.detalles.byJornada(jornadaId);
          setDetalles(reload.data ?? []);
        }
      } else {
        const body: DetalleAsistenciaCreateDTO = {
          jornadaId,
          matriculaId,
          estado,
          observacion: null,
        } as any;
        await asistencias.detalles.create(body);
        const reload = await asistencias.detalles.byJornada(jornadaId);
        setDetalles(reload.data ?? []);
      }
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ?? e?.message ?? "No se pudo guardar",
      );
    } finally {
      setSavingId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Asistencia del {fmt(fecha)}</DialogTitle>
          <DialogDescription>
            Marcá presente/ausente por alumno.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <LoadingState label="Cargando asistencia…" />
        ) : (
          <div className="space-y-4">
            <div className="border rounded p-3 text-sm">
              <div className="flex justify-between">
                <span>
                  Presentes: <b>{presentes}</b> / Total: <b>{total}</b>
                </span>
                <span>
                  Porcentaje: <b>{porcentaje}%</b>
                </span>
              </div>
              <Progress value={porcentaje} className="h-2 mt-2" />
            </div>

            <div className="space-y-2">
              {alumnos.map((a) => {
                const d = detalleByMatricula.get(a.matriculaId);
                const status = d?.estado ?? null;
                const isSaving = savingId === a.matriculaId;

                return (
                  <div
                    key={a.matriculaId}
                    className="flex items-center justify-between border rounded p-2"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{a.matriculaId}</Badge>
                      <div className="text-sm font-medium">{alumnoName(a)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={status === "PRESENTE" ? "default" : "outline"}
                        disabled={isSaving}
                        onClick={() => setEstado(a.matriculaId, "PRESENTE")}
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 mr-1" />
                        )}
                        Presente
                      </Button>
                      <Button
                        variant={status === "AUSENTE" ? "default" : "outline"}
                        disabled={isSaving}
                        onClick={() => setEstado(a.matriculaId, "AUSENTE")}
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <X className="h-4 w-4 mr-1" />
                        )}
                        Ausente
                      </Button>
                    </div>
                  </div>
                );
              })}
              {alumnos.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No hay alumnos activos en esta fecha.
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
