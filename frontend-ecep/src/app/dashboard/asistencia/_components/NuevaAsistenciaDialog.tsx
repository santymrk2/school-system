"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { asistencias } from "@/services/api/modules";
import type {
  EstadoAsistencia,
  JornadaAsistenciaCreateDTO,
  AlumnoLiteDTO,
  SeccionDTO,
  TrimestreDTO,
  DetalleAsistenciaCreateDTO,
} from "@/types/api-generated";
import {
  getTrimestreFin,
  getTrimestreInicio,
  isFechaDentroDeTrimestre,
} from "@/lib/trimestres";

function fmt(d?: string | null) {
  if (!d) return "";
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}

function todayISO() {
  return fmt(new Date().toISOString());
}

function isWeekend(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  const day = date.getDay();
  return day === 0 || day === 6;
}

export default function NuevaAsistenciaDialog({
  open,
  onOpenChange,
  seccion,
  trimestre,
  alumnos,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  seccion: SeccionDTO;
  trimestre: TrimestreDTO | null;
  alumnos: AlumnoLiteDTO[];
  onCreated: () => void;
}) {
  const [fecha, setFecha] = useState<string>(todayISO());
  const [modo, setModo] = useState<"paso" | "tabla">("paso");
  const [index, setIndex] = useState(0);
  const [marcas, setMarcas] = useState<Record<number, EstadoAsistencia>>({});
  const [dateError, setDateError] = useState<string | null>(null);
  const [busyDates, setBusyDates] = useState<Set<string>>(new Set());

  const computeDateError = useCallback(
    (value: string, existing: Set<string> | null = null): string | null => {
      const set = existing ?? busyDates;
      if (!value) return "Seleccioná una fecha";
      if (isWeekend(value)) {
        return "No se pueden crear jornadas los fines de semana.";
      }
      if (set.has(value)) {
        return "Ya existe una jornada para este día.";
      }
      return null;
    },
    [busyDates],
  );

  useEffect(() => {
    if (!open) return;
    const today = todayISO();
    setFecha(today);
    setModo("paso");
    setIndex(0);
    setMarcas({});
    setDateError(computeDateError(today));
  }, [open, computeDateError]);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      try {
        const res = await asistencias.jornadas.search({
          seccionId: seccion.id,
        });
        if (!alive) return;
        const incoming = new Set<string>();
        for (const row of (res.data ?? []) as any[]) {
          const raw = (row?.fecha ?? "").slice(0, 10);
          if (raw) incoming.add(raw);
        }
        setBusyDates(incoming);
      } catch (err) {
        console.error(
          "[NuevaAsistenciaDialog] No se pudieron cargar jornadas previas",
          err,
        );
      }
    })();
    return () => {
      alive = false;
    };
  }, [open, seccion.id]);

  useEffect(() => {
    if (!open) return;
    setDateError(computeDateError(fecha));
  }, [open, fecha, busyDates, computeDateError]);

  const dentro = isFechaDentroDeTrimestre(fecha, trimestre);
  const marcar = (matriculaId: number, estado: EstadoAsistencia) =>
    setMarcas((m) => ({ ...m, [matriculaId]: estado }));

  const guardar = async () => {
    if (!trimestre) {
      toast.error("No hay trimestre activo");
      return;
    }
    try {
      const validation = computeDateError(fecha);
      if (validation) {
        setDateError(validation);
        if (validation.includes("jornada")) {
          toast.warning(validation);
        }
        return;
      }

      const dupRes = await asistencias.jornadas.search({
        seccionId: seccion.id,
        fecha,
      });
      const dupList = Array.isArray(dupRes.data)
        ? dupRes.data
        : dupRes.data
          ? [dupRes.data]
          : [];
      const hasDuplicate = dupList.some(
        (row: any) => (row?.fecha ?? "").slice(0, 10) === fecha,
      );
      if (hasDuplicate) {
        const msg = "Ya existe una jornada para este día.";
        setBusyDates((prev) => new Set(prev).add(fecha));
        setDateError(msg);
        toast.warning(msg);
        return;
      }

      const bodyJ: JornadaAsistenciaCreateDTO = {
        seccionId: seccion.id,
        fecha,
        trimestreId: trimestre.id,
      } as any;
      const jornadaId = (await asistencias.jornadas.create(bodyJ))
        .data as unknown as number;

      const payload: DetalleAsistenciaCreateDTO[] = alumnos.map((a) => ({
        jornadaId,
        matriculaId: a.matriculaId,
        estado: marcas[a.matriculaId] ?? "PRESENTE",
        observacion: null,
      })) as any;

      await asistencias.detalles.bulk(payload);
      toast.success("Asistencia guardada");
      onOpenChange(false);
      onCreated();
    } catch {
      toast.error("Error al guardar");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Nueva Asistencia — {seccion.gradoSala} {seccion.division}
          </DialogTitle>
          <DialogDescription>Elegí la fecha y el modo</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Fecha</Label>
            <DatePicker
              value={fecha || undefined}
              min={getTrimestreInicio(trimestre) || undefined}
              max={getTrimestreFin(trimestre) || undefined}
              onChange={(value) => {
                const next = value ?? "";
                setFecha(next);
                if (!value) {
                  setDateError("Seleccioná una fecha");
                  return;
                }
                setDateError(computeDateError(value));
              }}
              error={Boolean(dateError)}
              required
            />
            {!dentro && (
              <p className="text-xs text-red-600 mt-1">Fuera del trimestre</p>
            )}
            {dateError && (
              <p className="text-xs text-red-600 mt-1">{dateError}</p>
            )}
          </div>
          <div>
            <Label>Modo</Label>
            <Select value={modo} onValueChange={(v) => setModo(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paso">Paso a paso</SelectItem>
                <SelectItem value="tabla">Tabla</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {modo === "paso" ? (
          <div className="mt-4 text-center">
            {alumnos.length ? (
              <>
                <p className="text-sm text-gray-600 mb-1">
                  {index + 1} / {alumnos.length}
                </p>
                <h3 className="text-xl font-semibold mb-4">
                  {alumnos[index].nombreCompleto}
                </h3>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() =>
                      marcar(alumnos[index].matriculaId, "PRESENTE")
                    }
                  >
                    Presente
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      marcar(alumnos[index].matriculaId, "AUSENTE")
                    }
                  >
                    Ausente
                  </Button>
                </div>
                <div className="flex justify-between mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setIndex((i) => Math.min(alumnos.length - 1, i + 1))
                    }
                  >
                    Siguiente
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-600">No hay alumnos</p>
            )}
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {alumnos.map((a) => {
              const estado = marcas[a.matriculaId] ?? "PRESENTE";
              return (
                <div
                  key={a.matriculaId}
                  className="flex items-center justify-between border rounded p-2"
                >
                  <span className="text-sm">{a.nombreCompleto}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={estado === "PRESENTE" ? "default" : "outline"}
                      onClick={() => marcar(a.matriculaId, "PRESENTE")}
                    >
                      Presente
                    </Button>
                    <Button
                      size="sm"
                      variant={estado === "AUSENTE" ? "destructive" : "outline"}
                      onClick={() => marcar(a.matriculaId, "AUSENTE")}
                    >
                      Ausente
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            onClick={guardar}
            disabled={!dentro || !alumnos.length || Boolean(dateError)}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
