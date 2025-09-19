"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import type { SeccionMateriaDTO, MateriaDTO } from "@/types/api-generated";

type Materia = MateriaDTO;
type SeccionMateria = SeccionMateriaDTO;
type EmpleadoLite = {
  id: number;
  nombre?: string | null;
  apellido?: string | null;
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function fmtEmpleado(p?: EmpleadoLite) {
  if (!p) return "—";
  const ap = (p.apellido ?? "").trim();
  const no = (p.nombre ?? "").trim();
  return ap || no ? `${ap}${ap && no ? ", " : ""}${no}` : `#${p.id}`;
}

export default function AsignarDocenteMateriaDialog({
  seccionMateria,
  materia,
  empleados = [], // default seguro
  ocupados,
  onClose,
  onCreated,
}: {
  seccionMateria: SeccionMateria;
  materia: Materia;
  empleados?: EmpleadoLite[];
  ocupados?: {
    titularId?: number | null;
    suplenteId?: number | null;
  };
  onClose: () => void;
  onCreated: () => void;
}) {
  const [empleadoId, setEmpleadoId] = useState<string>("");
  const [rol, setRol] = useState<"TITULAR" | "SUPLENTE">("TITULAR");
  const [desde, setDesde] = useState<string>(today());
  const [hasta, setHasta] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const opciones = useMemo(() => {
    const bloqueadoId = rol === "TITULAR" ? ocupados?.suplenteId : ocupados?.titularId;
    return (empleados ?? [])
      .map((p) => ({
        id: p.id,
        label: fmtEmpleado(p),
      }))
      .filter((op) => !bloqueadoId || op.id !== bloqueadoId);
  }, [empleados, ocupados?.suplenteId, ocupados?.titularId, rol]);

  useEffect(() => {
    const bloqueadoId = rol === "TITULAR" ? ocupados?.suplenteId : ocupados?.titularId;
    if (bloqueadoId && Number(empleadoId) === bloqueadoId) {
      setEmpleadoId("");
    }
  }, [empleadoId, ocupados?.suplenteId, ocupados?.titularId, rol]);

  const canSubmit = !!empleadoId && !!rol && !!desde;

  const guardar = async () => {
    if (!canSubmit || saving) return;
    if (hasta && desde && hasta < desde) {
      alert("La fecha hasta no puede ser anterior a la fecha desde.");
      return;
    }
    try {
      setSaving(true);
      const hastaValue = hasta ? hasta : "9999-12-31";
      await api.asignacionDocenteMateria.create({
        seccionMateriaId: seccionMateria.id,
        empleadoId: Number(empleadoId),
        rol,
        vigenciaDesde: desde,
        vigenciaHasta: hastaValue as any,
      } as any);
      onCreated();
      onClose();
    } catch (e: any) {
      alert(
        e?.response?.data?.message ??
          e?.message ??
          "No se pudo asignar el docente a la materia.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar docente</DialogTitle>
          <DialogDescription>Materia: {materia.nombre}</DialogDescription>
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

          <Select value={rol} onValueChange={(v) => setRol(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TITULAR">Titular</SelectItem>
              <SelectItem value="SUPLENTE">Suplente (con fecha fin)</SelectItem>
            </SelectContent>
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm mb-1 block">Desde</label>
              <Input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm mb-1 block">Hasta (opcional)</label>
              <Input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
              />
            </div>
          </div>

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
