"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { toast } from "sonner";
import type { SeccionDTO, TrimestreDTO } from "@/types/api-generated";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";
import {
  getTrimestreEstado,
  getTrimestreFin,
  getTrimestreInicio,
  isFechaDentroDeTrimestre,
} from "@/lib/trimestres";

type Props = {
  seccion: SeccionDTO;
  trigger?: React.ReactNode;
  onCreated?: (jornadaId: number) => void;
};

function hoyISO(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function isWeekend(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  const day = date.getDay();
  return day === 0 || day === 6;
}

function capitalize(str: string) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatHumanDate(dateString?: string) {
  if (!dateString) return "";
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  const weekday = capitalize(
    new Intl.DateTimeFormat("es-AR", { weekday: "long" }).format(date),
  );
  const day = new Intl.DateTimeFormat("es-AR", { day: "numeric" }).format(date);
  const month = new Intl.DateTimeFormat("es-AR", { month: "long" }).format(date);
  const year = date.getFullYear();
  return `${weekday} ${day} de ${month}, ${year}`;
}

export function NewJornadaDialog({ seccion, trigger, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [fecha, setFecha] = useState<string>(hoyISO());
  const [creating, setCreating] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const [busyDates, setBusyDates] = useState<Set<string>>(new Set());
  const { trimestreActivo, trimestresDelPeriodo } = useActivePeriod();

  const activeTrimestre = useMemo(() => {
    if (trimestreActivo && getTrimestreEstado(trimestreActivo) === "activo") {
      return trimestreActivo;
    }
    return (
      trimestresDelPeriodo.find(
        (t) => getTrimestreEstado(t) === "activo",
      ) ?? null
    );
  }, [trimestreActivo, trimestresDelPeriodo]);

  const resolveTrimestreForDate = useCallback(
    (value: string): TrimestreDTO | null => {
      if (!value) return null;
      const match = trimestresDelPeriodo.find((t) =>
        isFechaDentroDeTrimestre(value, t),
      );
      if (!match || getTrimestreEstado(match) !== "activo") {
        return null;
      }
      if (activeTrimestre && match.id !== activeTrimestre.id) {
        return null;
      }
      return match;
    },
    [trimestresDelPeriodo, activeTrimestre],
  );

  const computeDateError = useCallback(
    (value: string, existing: Set<string> | null = null): string | null => {
      const set = existing ?? busyDates;
      if (!value) return "Seleccioná una fecha";
      const trimesterForDate = resolveTrimestreForDate(value);
      if (!trimesterForDate) {
        return "No encontramos un trimestre activo para la fecha seleccionada.";
      }
      if (isWeekend(value)) {
        return "No se pueden crear jornadas los fines de semana.";
      }
      if (set.has(value)) {
        return "Ya existe una jornada para este día.";
      }
      return null;
    },
    [busyDates, resolveTrimestreForDate, activeTrimestre],
  );

  const setFechaWithValidation = useCallback(
    (value: string, opts: { showToast?: boolean } = {}) => {
      if (!value) {
        setFecha(value);
        setDateError("Seleccioná una fecha");
        return false;
      }
      const validation = computeDateError(value);
      if (validation) {
        setDateError(validation);
        if (opts.showToast) {
          toast.warning(validation);
        }
        return false;
      }
      setFecha(value);
      setDateError(null);
      return true;
    },
    [computeDateError],
  );

  useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      try {
        const res = await api.jornadasAsistencia.search({
          seccionId: seccion.id,
        });
        if (!alive) return;
        const incoming = new Set<string>();
        for (const row of (res.data ?? []) as any[]) {
          const raw = (row?.fecha ?? "").slice(0, 10);
          if (raw && resolveTrimestreForDate(raw)) {
            incoming.add(raw);
          }
        }
        setBusyDates(incoming);
      } catch (err) {
        console.error(
          "[NewJornadaDialog] No se pudo cargar jornadas previas",
          err,
        );
      }
    })();
    return () => {
      alive = false;
    };
  }, [open, seccion.id, resolveTrimestreForDate]);

  useEffect(() => {
    if (!open) return;
    setDateError(computeDateError(fecha));
  }, [open, fecha, computeDateError]);

  const currentYear = new Date().getFullYear();
  const trimestreInicio = activeTrimestre
    ? getTrimestreInicio(activeTrimestre)
    : "";
  const trimestreFin = activeTrimestre ? getTrimestreFin(activeTrimestre) : "";
  const minFecha = trimestreInicio || `${currentYear}-01-01`;
  const maxFecha = trimestreFin || `${currentYear}-12-31`;
  const formattedFecha = useMemo(() => formatHumanDate(fecha), [fecha]);

  const defaultTrigger = useMemo(
    () => <Button size="sm">Nueva Asistencia</Button>,
    [],
  );

  const handleCreate = async () => {
    try {
      setCreating(true);

      const selectedYear = new Date(fecha).getFullYear();
      if (Number.isNaN(selectedYear) || selectedYear !== currentYear) {
        toast.warning("Solo se permiten fechas dentro del año actual.");
        return;
      }

      const validation = computeDateError(fecha);
      if (validation) {
        setDateError(validation);
        toast.warning(validation);
        return;
      }

      const dupRes = await api.jornadasAsistencia.search({
        seccionId: seccion.id,
        fecha,
      });
      const dupList = Array.isArray(dupRes.data) ? dupRes.data : dupRes.data ? [dupRes.data] : [];
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

      let tri = resolveTrimestreForDate(fecha) ?? undefined;
      if (!tri) {
      const msg =
        "La fecha seleccionada no pertenece al trimestre activo.";
        setDateError(msg);
        toast.warning(msg);
        return;
      }

      if (!isFechaDentroDeTrimestre(fecha, tri)) {
        const msg =
          "La fecha seleccionada no pertenece al trimestre activo.";
        setDateError(msg);
        toast.warning(msg);
        return;
      }

      const body = { seccionId: seccion.id, fecha, trimestreId: tri.id };
      const resp = await api.jornadasAsistencia.create(body as any);
      const jornadaId = resp.data as number;

      toast.success(
        `Jornada creada — ${seccion.gradoSala} ${seccion.division} — ${fecha}`,
      );
      setOpen(false);
      onCreated?.(jornadaId);
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ?? e?.message ?? "Error creando jornada";
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger ?? defaultTrigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Nueva asistencia — {seccion.gradoSala} {seccion.division}
          </DialogTitle>
          <DialogDescription>
            Seleccioná una fecha del año en curso.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="text-sm mb-1 block">Fecha</label>
            <Input
              type="date"
              value={fecha}
              min={minFecha}
              max={maxFecha}
              onChange={(e) => {
                const value = e.target.value;
                if (!value) {
                  setFecha(value);
                  setDateError("Seleccioná una fecha");
                  return;
                }
                const valueYear = new Date(value).getFullYear();
                if (Number.isNaN(valueYear) || valueYear !== currentYear) {
                  toast.warning("Solo se permiten fechas dentro del año actual.");
                  return;
                }
                setFechaWithValidation(value, { showToast: true });
              }}
            />
            {formattedFecha && (
              <p className="text-xs text-muted-foreground mt-1">{formattedFecha}</p>
            )}
            {dateError && (
              <p className="text-xs text-red-600 mt-1">{dateError}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={creating}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={creating || Boolean(dateError)}>
              {creating ? "Creando..." : "Crear"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
