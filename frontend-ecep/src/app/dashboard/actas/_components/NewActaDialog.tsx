"use client";

import { useEffect, useMemo, useState } from "react";
import LoadingState from "@/components/common/LoadingState";
import {
  gestionAcademica,
  identidad,
  vidaEscolar,
} from "@/services/api/modules";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";
import { pageContent } from "@/lib/page-response";
import type {
  ActaAccidenteCreateDTO,
  AlumnoDTO,
  AlumnoLiteDTO,
  PersonaResumenDTO,
  EmpleadoDTO,
  AsignacionDocenteSeccionDTO,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const todayISO = () => new Date().toISOString().slice(0, 10);
const min2DaysISO = () => {
  const d = new Date();
  d.setDate(d.getDate() - 2);
  return d.toISOString().slice(0, 10);
};

type PersonaAlumno = { id: number; display: string; seccion?: string | null };

export default function NewActaDialog({
  children,
  open,
  onOpenChange,
  onCreated,
  mode = "global",
}: {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated?: () => void;
  /** "global" (Dirección) o "teacher" (Docente) */
  mode?: "global" | "teacher";
}) {
  const { periodoEscolarId, hoyISO } = useActivePeriod();

  const [me, setMe] = useState<PersonaResumenDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Autocomplete alumnos
  const [allAlumnos, setAllAlumnos] = useState<PersonaAlumno[]>([]);
  const [alumnoQuery, setAlumnoQuery] = useState("");
  const [alumnoId, setAlumnoId] = useState<number | null>(null);

  // Form
  const [fecha, setFecha] = useState(todayISO());
  const [hora, setHora] = useState<string>("");
  const [lugar, setLugar] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [acciones, setAcciones] = useState<string>("");
  const [informanteEmpleadoId, setInformanteEmpleadoId] = useState<
    number | null
  >(null);

  // Firmante (opcional) — solo Dirección
  const [firmadoPorEmpleadoId, setFirmadoPorEmpleadoId] = useState<
    number | undefined
  >(undefined);
  // states
  const [empleados, setEmpleados] = useState<EmpleadoDTO[]>([]);
  const [docentes, setDocentes] = useState<EmpleadoDTO[]>([]);
  const [empleadoNombre, setEmpleadoNombre] = useState<Map<number, string>>(
    new Map(),
  );

  useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      try {
        setLoading(true);

        const meRes = await identidad.me().catch(() => ({ data: null }));
        let empleadosCatalogo: EmpleadoDTO[] = [];
        try {
          const empleadosRes = await identidad.empleados
            .list()
            .catch(() => ({ data: [] }));
          empleadosCatalogo = pageContent<EmpleadoDTO>(empleadosRes.data);
        } catch {
          empleadosCatalogo = [];
        }
        const direccion = empleadosCatalogo.filter(
          (e) => (e.rolEmpleado ?? null) === RolEmpleado.DIRECCION,
        );
        const docentesCatalogo = empleadosCatalogo.filter(
          (e) => (e.rolEmpleado ?? null) === RolEmpleado.DOCENTE,
        );
        const meData: any = meRes.data ?? null;
        const personaId = meData?.personaId ?? null;
        const empleadoActual = personaId
          ? empleadosCatalogo.find((e: any) => e.personaId === personaId)
          : null;
        const empleadoId = empleadoActual?.id ?? null;
        const empleadoRol = empleadoActual?.rolEmpleado ?? null;

        if (
          mode === "teacher" ||
          empleadoRol === RolEmpleado.DOCENTE
        ) {
          setInformanteEmpleadoId(empleadoId ?? null);
        } else {
          setInformanteEmpleadoId(null);
        }

        // Dataset alumnos según modo
        let alumnos: Array<AlumnoDTO | AlumnoLiteDTO> = [];

        if (mode === "global") {
          // Todas las secciones del período activo → alumnos activos hoy por sección
          const secc =
            (await gestionAcademica.secciones
              .list()
              .catch(() => ({ data: [] }))).data ?? [];
          const seccPeriodo = secc.filter(
            (s: any) =>
              (s.periodoEscolarId ?? s.periodoEscolar?.id) === periodoEscolarId,
          );
          const chunks = await Promise.all(
            seccPeriodo.map((s) =>
              gestionAcademica.seccionesAlumnos
                .bySeccionId(s.id, hoyISO) // AlumnoLiteDTO[]
                .then((r) => r.data ?? [])
                .catch(() => []),
            ),
          );
          const uniq = new Map<number, any>();
          for (const arr of chunks)
            for (const a of arr as any[]) uniq.set(a.alumnoId ?? a.id, a);
          alumnos = Array.from(uniq.values());
        } else {
          // Docente: secciones vigentes del docente hoy → alumnos por esas secciones
          let seccionIds: number[] = [];
          try {
            // Si tenés un endpoint específico, podés reemplazar por él
            const list: AsignacionDocenteSeccionDTO[] =
              (await gestionAcademica.asignacionDocenteSeccion.list()).data ?? [];
            const today = hoyISO || todayISO();
            const mine = list.filter((a: any) => {
              const empId = a.empleadoId ?? a.personalId ?? a.docenteId;
              const d = a.vigenciaDesde ?? a.desde;
              const h = a.vigenciaHasta ?? a.hasta;
              const okDesde = !d || today >= String(d);
              const okHasta = !h || today <= String(h);
              return empleadoId && empId === empleadoId && okDesde && okHasta;
            });
            seccionIds = Array.from(
              new Set(
                mine
                  .map((a: any) => a.seccionId ?? a.seccion?.id)
                  .filter(Boolean),
              ),
            );
          } catch {
            seccionIds = [];
          }

          if (seccionIds.length) {
            const chunks = await Promise.all(
              seccionIds.map((sid) =>
                gestionAcademica.seccionesAlumnos
                  .bySeccionId(sid)
                  .then((r) => r.data ?? [])
                  .catch(() => []),
              ),
            );
            const uniq = new Map<number, any>();
            for (const arr of chunks)
              for (const au of arr as any[]) uniq.set(au.alumnoId ?? au.id, au);
            alumnos = Array.from(uniq.values());
          } else {
            // Fallback extremo: todos (no ideal, pero evita dejar vacío)
            alumnos =
              (await identidad.alumnos.list().catch(() => ({ data: [] }))).data ?? [];
          }
        }

        if (!alive) return;

        // Normalizar para autocompletar
        const toDisplay = (a: any): PersonaAlumno => {
          const id = a.alumnoId ?? a.id;
          const full =
            a.nombreCompleto ??
            `${(a.apellido ?? "").trim()}, ${(a.nombre ?? "").trim()}`.replace(
              /,\s*$/,
              ",",
            );
          const seccion =
            a.seccionNombre ??
            a.seccion ??
            a.seccionActual?.nombre ??
            a.gradoSala ??
            null;
          return {
            id,
            display: `${full} — ${seccion ?? "Sin sección"}`,
            seccion,
          };
        };

        setMe(meRes.data ?? null);
        setEmpleados(direccion);
        setDocentes(docentesCatalogo);
        // construir nombres de empleados a partir de Persona
        const map = new Map<number, string>();
        const relevantes = [
          ...direccion,
          ...docentesCatalogo,
        ];
        if (empleadoActual && !relevantes.some((e) => e.id === empleadoActual.id)) {
          relevantes.push(empleadoActual);
        }
        await Promise.all(
          relevantes.map(async (e: any) => {
            let display = `Empleado #${e.id}`;
            if (e.personaId) {
              try {
                const p = await identidad.personasCore
                  .getById(e.personaId)
                  .then((r) => r.data);
                const nom = `${p?.apellido ?? ""} ${p?.nombre ?? ""}`.trim();
                const dni = (p?.dni ?? "").trim();
                if (nom) display = dni ? `${nom} — DNI ${dni}` : nom;
              } catch {
                /* noop */
              }
            }
            map.set(e.id, display);
          }),
        );
        setEmpleadoNombre(map);
        setAllAlumnos((alumnos ?? []).map(toDisplay));

        // reset form
        setAlumnoQuery("");
        setAlumnoId(null);
        setFecha(todayISO());
        setHora("");
        setLugar("");
        setDescripcion("");
        setAcciones("");
        setFirmadoPorEmpleadoId(undefined);
        if (mode === "global") {
          setInformanteEmpleadoId(null);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [open, mode, periodoEscolarId, hoyISO]);

  const suggestions = useMemo(() => {
    const q = alumnoQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return allAlumnos
      .filter((a) => a.display.toLowerCase().includes(q))
      .slice(0, 8);
  }, [alumnoQuery, allAlumnos]);

  const needsQueryHint = alumnoQuery.trim().length < 2;

  const pickAlumno = (id: number) => {
    setAlumnoId(id);
    const sel = allAlumnos.find((a) => a.id === id);
    if (sel) setAlumnoQuery(sel.display);
  };

  const submit = async () => {
    if (!alumnoId) {
      toast.error("Seleccioná un alumno de la lista.");
      return;
    }
    if (!fecha || fecha < min2DaysISO() || fecha > todayISO()) {
      toast.error("Fecha inválida: solo hoy o 2 días previos.");
      return;
    }
    if (
      !hora.trim() ||
      !lugar.trim() ||
      !descripcion.trim() ||
      !acciones.trim()
    ) {
      toast.error("Completá hora, lugar, descripción y acciones.");
      return;
    }

    // Inferir informanteId (Empleado)
    let informanteId: number | undefined = informanteEmpleadoId ?? undefined;
    if (!informanteId) {
      try {
        const meData: any = me ?? (await identidad.me().then((r) => r.data));
        const emps = await identidad.empleados
          .list()
          .then((r) => pageContent<EmpleadoDTO>(r.data))
          .catch(() => []);
        const match = emps.find((e: any) => e.personaId === meData?.personaId);
        if (match?.id != null) {
          informanteId = match.id;
          setInformanteEmpleadoId(match.id);
        }
      } catch {
        /* noop */
      }
    }

    if (!informanteId) {
      toast.error(
        mode === "global"
          ? "Seleccioná un docente informante."
          : "No se pudo determinar el docente informante.",
      );
      return;
    }

    const body: ActaAccidenteCreateDTO & any = {
      alumnoId,
      fechaSuceso: fecha,
      horaSuceso: hora.trim(),
      lugar: lugar.trim(),
      descripcion: descripcion.trim(),
      acciones: acciones.trim(),
      informanteId,
      creadoPor: (me as any)?.personaNombre ?? (me as any)?.email ?? undefined,
    };

    if (firmadoPorEmpleadoId) {
      body.firmanteId = firmadoPorEmpleadoId;
    }

    try {
      setSubmitting(true);
      await vidaEscolar.actasAccidente.create(body as any);
      onOpenChange(false);
      onCreated?.();
    } catch (e: any) {
      console.error("Error creando acta", e?.response?.data ?? e);
      toast.error(
        e?.response?.data?.message ?? e?.message ?? "No se pudo crear el acta.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nueva Acta de Accidente</DialogTitle>
          <DialogDescription>
            {mode === "global"
              ? "Dirección: registre incidente del período activo."
              : "Docente: registre para alumnos de sus secciones vigentes."}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <LoadingState label="Cargando información…" />
        ) : (
          <div className="space-y-5 text-sm">
            {/* Alumno (autocomplete) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Alumno *
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
                {suggestions.map((s) => (
                  <div
                    key={s.id}
                    className={`px-2 py-1 cursor-pointer hover:bg-accent ${alumnoId === s.id ? "bg-accent" : ""}`}
                    onClick={() => pickAlumno(s.id)}
                  >
                    {s.display}
                  </div>
                ))}
                {needsQueryHint ? (
                  <div className="px-2 py-1 text-muted-foreground">
                    Escribí al menos 2 letras para buscar.
                  </div>
                ) : suggestions.length === 0 ? (
                  <div className="px-2 py-1 text-muted-foreground">
                    Sin resultados…
                  </div>
                ) : null}
              </div>
              {!alumnoId && (
                <div className="text-xs text-red-600 mt-1">
                  Seleccioná un alumno de la lista.
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Fecha del suceso *
                </label>
                <DatePicker
                  min={min2DaysISO()}
                  max={todayISO()}
                  value={fecha || undefined}
                  onChange={(value) => setFecha(value ?? "")}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Hora (24h) *
                </label>
                <Input
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Descripción del suceso *
              </label>
              <Textarea
                rows={3}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Lugar del suceso *
              </label>
              <Input
                value={lugar}
                onChange={(e) => setLugar(e.target.value)}
                placeholder="Patio, aula, gimnasio…"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Acciones realizadas *
              </label>
              <Textarea
                rows={3}
                value={acciones}
                onChange={(e) => setAcciones(e.target.value)}
              />
            </div>

            {mode === "global" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Docente informante *
                </label>
                <Select
                  value={
                    informanteEmpleadoId ? String(informanteEmpleadoId) : ""
                  }
                  onValueChange={(v) =>
                    setInformanteEmpleadoId(v ? Number(v) : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar docente informante" />
                  </SelectTrigger>
                  <SelectContent>
                    {docentes.map((docente) => (
                      <SelectItem key={docente.id} value={String(docente.id)}>
                        {empleadoNombre.get(docente.id) ??
                          `Empleado #${docente.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {docentes.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    No se encontraron docentes registrados. Actualizá el padrón
                    de personal para seleccionarlo como informante.
                  </p>
                )}
              </div>
            )}

            {mode === "global" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Dirección firmante — opcional
                </label>
                <Select
                  value={
                    firmadoPorEmpleadoId ? String(firmadoPorEmpleadoId) : ""
                  }
                  onValueChange={(v) => setFirmadoPorEmpleadoId(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar directivo (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {empleados.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {empleadoNombre.get(p.id) ?? `Empleado #${p.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button onClick={submit} disabled={submitting}>
                {submitting ? "Guardando…" : "Registrar acta"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
