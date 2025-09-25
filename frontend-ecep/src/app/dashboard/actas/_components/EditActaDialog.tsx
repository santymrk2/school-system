"use client";

import { useEffect, useMemo, useState } from "react";
import LoadingState from "@/components/common/LoadingState";
import { identidad, vidaEscolar } from "@/services/api/modules";
import { pageContent } from "@/lib/page-response";
import type {
  ActaAccidenteDTO,
  EstadoActaAccidente,
  EmpleadoDTO,
  PersonaDTO,
  AlumnoDTO,
} from "@/types/api-generated";
import { RolEmpleado } from "@/types/api-generated";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
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

type PersonaAlumno = { id: number; display: string };

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
  const [alumnos, setAlumnos] = useState<PersonaAlumno[]>([]);
  const [alumnoId, setAlumnoId] = useState<number | null>(acta.alumnoId ?? null);
  const [alumnoQuery, setAlumnoQuery] = useState<string>(
    acta.alumnoId != null ? `Alumno #${acta.alumnoId}` : "",
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
        const [persRes, alumnosRes] = await Promise.all([
          identidad.empleados.list({ rolEmpleado: RolEmpleado.DIRECCION }),
          identidad.alumnos.list().catch(() => ({ data: [] })),
        ]);
        const pers = pageContent<EmpleadoDTO>(persRes.data).filter(
          (p) => (p.rolEmpleado ?? null) === RolEmpleado.DIRECCION,
        );
        if (!alive) return;

        // Prefetch de personas para mostrar nombres correctos
        const pids = Array.from(
          new Set<number>(pers.map((e: any) => e?.personaId).filter(Boolean)),
        );
        const entries = await Promise.all(
          pids.map(async (pid) => {
            try {
              const r = await identidad.personasCore.getById(pid);
              return [pid, r.data ?? null] as const;
            } catch {
              return [pid, null] as const;
            }
          }),
        );

        setPersonal(pers);
        setPersonaMap(new Map(entries));

        const alumnoItems = pageContent<AlumnoDTO>(alumnosRes.data)
          .map((alumno) => {
            const id = alumno?.id ?? null;
            if (id == null) return null;
            const lastName = (alumno.apellido ?? "").trim();
            const firstName = (alumno.nombre ?? "").trim();
            const fullName =
              lastName && firstName
                ? `${lastName}, ${firstName}`
                : (lastName || firstName || "").trim();
            const seccion = (alumno.seccionActualNombre ?? "").trim() || "Sin sección";
            return {
              id,
              display: `${fullName || `Alumno #${id}`} — ${seccion}`,
            } satisfies PersonaAlumno;
          })
          .filter(Boolean) as PersonaAlumno[];

        const sortedAlumnos = alumnoItems.sort((a, b) =>
          a.display.localeCompare(b.display, "es"),
        );

        const selectedId = acta.alumnoId ?? null;
        const selectedAlumno = sortedAlumnos.find((item) => item.id === selectedId);

        setAlumnos(sortedAlumnos);
        setAlumnoId(selectedId);
        setAlumnoQuery(
          selectedAlumno?.display ??
            (selectedId != null ? `Alumno #${selectedId}` : ""),
        );
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

  const alumnoSuggestions = useMemo(() => {
    const q = alumnoQuery.trim().toLowerCase();
    if (q.length < 2) return [] as PersonaAlumno[];
    return alumnos
      .filter((alumno) => alumno.display.toLowerCase().includes(q))
      .slice(0, 8);
  }, [alumnoQuery, alumnos]);

  const needsAlumnoHint = alumnoQuery.trim().length < 2;

  const pickAlumno = (id: number) => {
    setAlumnoId(id);
    const selected = alumnos.find((item) => item.id === id);
    if (selected) setAlumnoQuery(selected.display);
  };

  const normalizedEstado = String(estado ?? "").toUpperCase();
  const allowFirmanteSelection = Boolean(
    canManageFirmante && normalizedEstado !== "BORRADOR",
  );

  const save = async () => {
    try {
      setSaving(true);

      if (!alumnoId) {
        toast.error("Seleccioná un alumno válido.");
        return;
      }

      const informanteId = acta.informanteId ?? null;
      if (informanteId == null) {
        toast.error("El acta no tiene un docente informante asignado.");
        return;
      }

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

      await vidaEscolar.actasAccidente.update(acta.id, {
        alumnoId,
        informanteId,
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
          <LoadingState label="Cargando acta…" />
        ) : (
          <div className="space-y-5 text-sm">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Alumno
              </label>
              <Input
                placeholder="Buscar: Apellido, Nombre — Sección"
                value={alumnoQuery}
                onChange={(e) => {
                  setAlumnoQuery(e.target.value);
                  setAlumnoId(null);
                }}
              />
              <div className="border rounded max-h-40 overflow-auto text-sm">
                {alumnoSuggestions.map((alumno) => (
                  <div
                    key={alumno.id}
                    className={`px-2 py-1 cursor-pointer hover:bg-accent ${
                      alumnoId === alumno.id ? "bg-accent" : ""
                    }`}
                    onClick={() => pickAlumno(alumno.id)}
                  >
                    {alumno.display}
                  </div>
                ))}
                {needsAlumnoHint ? (
                  <div className="px-2 py-1 text-muted-foreground">
                    Escribí al menos 2 letras para buscar.
                  </div>
                ) : alumnoSuggestions.length === 0 ? (
                  <div className="px-2 py-1 text-muted-foreground">
                    Sin resultados…
                  </div>
                ) : null}
              </div>
              {!alumnoId && (
                <div className="text-xs text-red-600">
                  Seleccioná un alumno de la lista.
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm mb-1 block">Fecha del suceso</label>
                <DatePicker
                  value={fecha || undefined}
                  onChange={(value) => setFecha(value ?? "")}
                  required
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
                    <SelectItem value="CERRADA">Cerrada</SelectItem>
                    <SelectItem value="FIRMADA">Firmada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {canManageFirmante && (
              <div>
                <label className="text-sm mb-1 block">
                  Dirección firmante (opcional)
                </label>
                {allowFirmanteSelection ? (
                  <Select
                    value={firmanteId}
                    onValueChange={(v) => setFirmanteId(v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccioná directivo" />
                    </SelectTrigger>
                    <SelectContent>
                      {personal.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {displayPersonal.get(p.id) ?? `Empleado #${p.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground space-y-1">
                    <span>
                      {firmanteId
                        ? displayPersonal.get(Number(firmanteId)) ??
                          `Empleado #${firmanteId}`
                        : "Aún sin dirección firmante asignada."}
                    </span>
                    <span className="block text-xs">
                      Cerrá el acta para habilitar la selección de dirección firmante.
                    </span>
                  </div>
                )}
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
