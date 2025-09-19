"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import type {
  ActaAccidenteDTO,
  EstadoActaAccidente,
  EmpleadoDTO,
  PersonaDTO,
} from "@/types/api-generated";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function EditActaDialog({
  acta,
  onClose,
  onSaved,
  canManageFirmante = true,
}: {
  acta: ActaAccidenteDTO;
  onClose: () => void;
  onSaved: () => void;
  canManageFirmante?: boolean;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [personal, setPersonal] = useState<EmpleadoDTO[]>([]);
  const [personaMap, setPersonaMap] = useState<Map<number, PersonaDTO | null>>(
    new Map(),
  );

  // form
  const [fecha, setFecha] = useState(acta.fechaSuceso);
  const [descripcion, setDescripcion] = useState(acta.descripcion ?? "");
  const [hora, setHora] = useState(acta.horaSuceso ?? "");
  const [lugar, setLugar] = useState(acta.lugar ?? "");
  const [acciones, setAcciones] = useState(acta.acciones ?? "");
  const [estado, setEstado] = useState<string>(String(acta.estado));
  const [firmanteId, setFirmanteId] = useState<string>(
    acta.firmanteId ? String(acta.firmanteId) : "",
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const pers = (await api.empleados.list()).data ?? [];
        if (!alive) return;

        // Prefetch de personas para mostrar nombres correctos
        const pids = Array.from(
          new Set<number>(pers.map((e: any) => e?.personaId).filter(Boolean)),
        );
        const entries = await Promise.all(
          pids.map(async (pid) => {
            try {
              const r = await api.personasCore.getById(pid);
              return [pid, r.data ?? null] as const;
            } catch {
              return [pid, null] as const;
            }
          }),
        );

        setPersonal(pers);
        setPersonaMap(new Map(entries));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [acta.id]);

  const displayPersonal = useMemo(() => {
    const m = new Map<number, string>();
    for (const p of personal as any[]) {
      const pid = p?.personaId;
      const per = pid ? personaMap.get(pid) : null;
      const label = per
        ? `${per.apellido ?? ""} ${per.nombre ?? ""}`.trim()
        : `Empleado #${p?.id}`;
      m.set(p?.id, label);
    }
    return m;
  }, [personal, personaMap]);

  const allowFirmanteSelection = Boolean(canManageFirmante);

  const save = async () => {
    try {
      setSaving(true);

      if (!fecha) {
        toast.error("Seleccioná una fecha válida.");
        return;
      }
      if (!hora) {
        toast.error("Ingresá la hora del suceso.");
        return;
      }
      if (!lugar.trim()) {
        toast.error("El lugar del suceso es obligatorio.");
        return;
      }
      if (!descripcion.trim()) {
        toast.error("La descripción es obligatoria.");
        return;
      }
      if (!acciones.trim()) {
        toast.error("Cargá las acciones realizadas.");
        return;
      }

      const chosen = firmanteId ? Number(firmanteId) : undefined;

      await api.actasAccidente.update(acta.id, {
        fechaSuceso: fecha,
        horaSuceso: hora,
        lugar: lugar.trim(),
        descripcion: descripcion.trim(),
        acciones: acciones.trim(),
        estado: estado as EstadoActaAccidente,
        firmanteId: chosen,
        creadoPor: acta.creadoPor ?? undefined,
      });

      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar acta #{acta.id}</DialogTitle>
          <DialogDescription>
            Dirección puede actualizar estado y firmante.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="text-sm">Cargando…</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm mb-1 block">Fecha del suceso</label>
                <Input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm mb-1 block">Hora (24h)</label>
                <Input
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm mb-1 block">Lugar</label>
                <Input
                  value={lugar}
                  onChange={(e) => setLugar(e.target.value)}
                  placeholder="Patio, aula, etc."
                />
              </div>
              <div>
                <label className="text-sm mb-1 block">Estado</label>
                <Select value={estado} onValueChange={(v) => setEstado(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccioná…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BORRADOR">Borrador</SelectItem>
                    <SelectItem value="CERRADA">Cerrada (firmada)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {allowFirmanteSelection && (
              <div>
                <label className="text-sm mb-1 block">
                  Firmante (personal/docente)
                </label>
                <Select
                  value={firmanteId}
                  onValueChange={(v) => setFirmanteId(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccioná firmante (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {personal.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {displayPersonal.get(p.id) ?? `Empleado #${p.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm mb-1 block">Descripción</label>
              <Textarea
                rows={6}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm mb-1 block">Acciones realizadas</label>
              <Textarea
                rows={4}
                value={acciones}
                onChange={(e) => setAcciones(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? "Guardando…" : "Guardar cambios"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
