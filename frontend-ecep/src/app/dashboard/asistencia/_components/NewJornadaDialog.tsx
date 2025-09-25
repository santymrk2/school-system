"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { asistencias } from "@/services/api/modules";
import { toast } from "sonner";
import type { SeccionDTO, TrimestreDTO } from "@/types/api-generated";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";
import {
  getTrimestreEstado,
  getTrimestreFin,
  getTrimestreInicio,
  isFechaDentroDeTrimestre,
} from "@/lib/trimestres";
import { cn } from "@/lib/utils";

type Props = {
  seccion: SeccionDTO;
  trigger?: React.ReactNode;
  onCreated?: (jornadaId: number) => void;
};

function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function hoyISO(): string {
  return formatDateToISO(new Date());
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
  const [datePickerOpen, setDatePickerOpen] = useState(false);
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
    if (!open) {
      setDatePickerOpen(false);
      return;
    }
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
  const selectedDate = useMemo(() => {
    if (!fecha) return undefined;
    const parsed = new Date(`${fecha}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }, [fecha]);
  const minDate = useMemo(() => new Date(`${minFecha}T00:00:00`), [minFecha]);
  const maxDate = useMemo(() => new Date(`${maxFecha}T00:00:00`), [maxFecha]);

  const isDisabledDate = useCallback(
    (date: Date) => {
      const iso = formatDateToISO(date);
      const year = date.getFullYear();
      if (Number.isNaN(year) || year !== currentYear) {
        return true;
      }
      if (iso < minFecha || iso > maxFecha) {
        return true;
      }
      if (isWeekend(iso)) {
        return true;
      }
      return busyDates.has(iso);
    },
    [busyDates, currentYear, minFecha, maxFecha],
  );

  const handleCalendarSelect = useCallback(
    (date: Date | undefined) => {
      if (!date) return;
      const iso = formatDateToISO(date);
      const year = date.getFullYear();
      if (Number.isNaN(year) || year !== currentYear) {
        toast.warning("Solo se permiten fechas dentro del año actual.");
        return;
      }
      const ok = setFechaWithValidation(iso, { showToast: true });
      if (ok) {
        setDatePickerOpen(false);
      }
    },
    [currentYear, setFechaWithValidation],
  );

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

      const dupRes = await asistencias.jornadas.search({
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
        const msg = "La fecha seleccionada no pertenece al trimestre activo.";
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
      const resp = await asistencias.jornadas.create(body as any);
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
            <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !fecha && "text-muted-foreground",
                    dateError && "border-destructive focus-visible:ring-destructive",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formattedFecha || "Seleccioná una fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  defaultMonth={selectedDate ?? minDate}
                  onSelect={handleCalendarSelect}
                  disabled={isDisabledDate}
                  fromDate={minDate}
                  toDate={maxDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
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
