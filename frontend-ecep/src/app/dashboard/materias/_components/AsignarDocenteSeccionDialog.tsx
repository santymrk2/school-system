"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { gestionAcademica } from "@/services/api/modules";
import type { RolSeccion } from "@/types/api-generated";
import { toast } from "sonner";

type EmpleadoLite = {
  id: number;
  nombre?: string | null;
  apellido?: string | null;
};

type Props = {
  seccionId: number;
  seccionNombre?: string | null;
  empleados?: EmpleadoLite[];
  ocupados?: {
    titularId?: number | null;
    suplenteId?: number | null;
  };
  initialRol?: RolSeccion.MAESTRO_TITULAR | RolSeccion.SUPLENTE;
  onClose: () => void;
  onCreated: () => void;
};

const ROL_TITULAR = "MAESTRO_TITULAR" satisfies RolSeccion;
const ROL_SUPLENTE = "SUPLENTE" satisfies RolSeccion;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function fmtEmpleado(p?: EmpleadoLite) {
  if (!p) return "—";
  const ap = (p.apellido ?? "").trim();
  const no = (p.nombre ?? "").trim();
  return ap || no ? `${ap}${ap && no ? ", " : ""}${no}` : `#${p.id}`;
}

export default function AsignarDocenteSeccionDialog({
  seccionId,
  seccionNombre,
  empleados = [],
  ocupados,
  initialRol = ROL_TITULAR,
  onClose,
  onCreated,
}: Props) {
  const [empleadoId, setEmpleadoId] = useState<string>("");
  const [rol, setRol] = useState<RolSeccion.MAESTRO_TITULAR | RolSeccion.SUPLENTE>(
    initialRol,
  );
  const [desde, setDesde] = useState<string>(today());
  const [hasta, setHasta] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const isSuplente = rol === ROL_SUPLENTE;

  useEffect(() => {
    setRol(initialRol);
    setDesde(today());
    setHasta("");
    setEmpleadoId("");
  }, [initialRol]);

  useEffect(() => {
    if (!isSuplente) {
      setDesde(today());
      setHasta("");
    }
  }, [isSuplente]);

  const opciones = useMemo(() => {
    const bloqueadoId = isSuplente ? ocupados?.titularId : ocupados?.suplenteId;
    return (empleados ?? [])
      .map((p) => ({
        id: p.id,
        label: fmtEmpleado(p),
      }))
      .filter((op) => !bloqueadoId || op.id !== bloqueadoId);
  }, [empleados, isSuplente, ocupados?.suplenteId, ocupados?.titularId]);

  useEffect(() => {
    const bloqueadoId = isSuplente ? ocupados?.titularId : ocupados?.suplenteId;
    if (bloqueadoId && Number(empleadoId) === bloqueadoId) {
      setEmpleadoId("");
    }
  }, [empleadoId, isSuplente, ocupados?.suplenteId, ocupados?.titularId]);

  const canSubmit =
    !!empleadoId && (!!desde || !isSuplente) && (!isSuplente || !!hasta);

  const guardar = async () => {
    if (!canSubmit || saving) return;

    if (isSuplente) {
      if (!desde) {
        toast.error("Seleccioná la fecha de inicio de la suplencia.");
        return;
      }
      if (!hasta) {
        toast.error("Seleccioná la fecha de fin de la suplencia.");
        return;
      }
      if (hasta < desde) {
        toast.error("La fecha hasta no puede ser anterior a la fecha desde.");
        return;
      }
    }

    try {
      setSaving(true);
      const payload: any = {
        seccionId,
        empleadoId: Number(empleadoId),
        rol,
        vigenciaDesde: isSuplente ? desde : today(),
      };
      if (isSuplente) {
        payload.vigenciaHasta = hasta as any;
      }
      await gestionAcademica.asignacionDocenteSeccion.create(payload);
      onCreated();
      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "No se pudo asignar el docente a la sección.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(value) => !value && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar docente de sección</DialogTitle>
          {seccionNombre && (
            <DialogDescription>Sección: {seccionNombre}</DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-3">
          <Select value={empleadoId} onValueChange={setEmpleadoId}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccioná docente" />
            </SelectTrigger>
            <SelectContent>
              {opciones.map((o) => (
                <SelectItem key={o.id} value={String(o.id)}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={rol} onValueChange={(value) => setRol(value as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ROL_TITULAR}>Titular</SelectItem>
              <SelectItem value={ROL_SUPLENTE}>Suplente</SelectItem>
            </SelectContent>
          </Select>

          {isSuplente ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm mb-1 block">Desde</label>
                <DatePicker
                  value={desde || undefined}
                  max={hasta || undefined}
                  onChange={(value) => setDesde(value ?? "")}
                />
              </div>
              <div>
                <label className="text-sm mb-1 block">Hasta</label>
                <DatePicker
                  value={hasta || undefined}
                  min={desde || undefined}
                  onChange={(value) => setHasta(value ?? "")}
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              El nuevo titular entrará en vigencia desde hoy. La asignación
              anterior se cerrará automáticamente.
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={guardar} disabled={!canSubmit || saving}>
              Guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
