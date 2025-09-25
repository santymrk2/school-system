"use client";

import { useEffect, useMemo, useState } from "react";
import LoadingState from "@/components/common/LoadingState";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/dashboard/dashboard-layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import {
  gestionAcademica,
  identidad,
  vidaEscolar,
} from "@/services/api/modules";
import { pageContent } from "@/lib/page-response";
import type {
  ActaAccidenteDTO,
  AlumnoLiteDTO,
  EstadoActaAccidente,
  SeccionDTO,
  AsignacionDocenteSeccionDTO,
  PersonalDTO,
  PersonaDTO,
} from "@/types/api-generated";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";
import ViewActaDialog from "../../_components/ViewActaDialog";
import NewActaDialog from "../../_components/NewActaDialog";
import { useViewerScope } from "@/hooks/scope/useViewerScope";
import { toast } from "sonner";
import EditActaDialog from "../../_components/EditActaDialog";
import { UserRole, RolEmpleado } from "@/types/api-generated";
import {
  fetchAlumnoExtendedInfo,
  type AlumnoExtendedInfo,
} from "../_utils/alumno-info";

type ActaVM = {
  id: number;
  alumnoId: number;
  alumno: string;
  alumnoDni?: string | null;
  familiar?: string | null;
  familiarDni?: string | null;
  seccion?: string | null;
  seccionId?: number | null;
  docente?: string | null;
  fecha: string;
  hora?: string | null;
  lugar?: string | null;
  acciones?: string | null;
  estado: string;
  creadoPor?: string | null;
  descripcion: string;
  firmante?: string | null;
  firmanteDni?: string | null;
  firmanteId?: number | null;
  informanteId?: number | null;
  informante?: string | null;
  informanteDni?: string | null;
};

function vigente(
  desde?: string | null,
  hasta?: string | null,
  hoyISO?: string,
) {
  const today = hoyISO ?? new Date().toISOString().slice(0, 10);
  const okD = !desde || today >= desde;
  const okH = !hasta || today <= hasta;
  return okD && okH;
}

export default function AccidentesSeccionPage() {
  const params = useParams<{ id: string }>();
  const seccionId = Number(params.id);
  const router = useRouter();
  const { hoyISO } = useActivePeriod();
  const { activeRole } = useViewerScope();
  const role = activeRole ?? null;

  const isDirector = role === UserRole.DIRECTOR;
  const isSecret = role === UserRole.SECRETARY;
  const isAdmin = role === UserRole.ADMIN;
  const isTeacher =
    role === UserRole.TEACHER || role === UserRole.ALTERNATE;

  const canCreate = isDirector || isSecret || isAdmin || isTeacher;
  const canManageActas = isDirector || isSecret;
  const canEditActas = canManageActas;
  const canDeleteActas = canManageActas;
  const canCloseActas = canManageActas;
  const canMarkFirmada = canManageActas;
  const canManageFirmante = canManageActas;

  const [loading, setLoading] = useState(true);
  const [seccion, setSeccion] = useState<SeccionDTO | null>(null);
  const [alumnos, setAlumnos] = useState<AlumnoLiteDTO[]>([]);
  const [actas, setActas] = useState<ActaAccidenteDTO[]>([]);
  const [asignaciones, setAsignaciones] = useState<
    AsignacionDocenteSeccionDTO[]
  >([]);
  const [personal, setPersonal] = useState<PersonalDTO[]>([]);
  const [alumnoInfo, setAlumnoInfo] = useState<
    Map<number, AlumnoExtendedInfo>
  >(new Map());
  const [personalPersonas, setPersonalPersonas] = useState<
    Map<number, PersonaDTO | null>
  >(new Map());

  // Filtros
  const [q, setQ] = useState("");
  const [fecha, setFecha] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );

  // Modales
  const [viewActa, setViewActa] = useState<ActaVM | null>(null);
  const [openNew, setOpenNew] = useState(false);
  const [editActa, setEditActa] = useState<ActaAccidenteDTO | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [closingId, setClosingId] = useState<number | null>(null);
  const [firmandoId, setFirmandoId] = useState<number | null>(null);
  const [updatingFirmanteId, setUpdatingFirmanteId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        // Sección
        let sec: SeccionDTO | null = null;
        try {
          sec = (await gestionAcademica.secciones.byId(seccionId)).data ?? null;
        } catch {
          const list = (await gestionAcademica.secciones.list()).data ?? [];
          sec = list.find((s) => s.id === seccionId) ?? null;
        }
        if (!alive) return;
        setSeccion(sec);

        // Alumnos activos en fecha (para alta)
        const als =
          (await gestionAcademica.seccionesAlumnos.bySeccionId(seccionId)).data ?? [];
        if (!alive) return;
        setAlumnos(als);

        // Actas (de toda la escuela, luego filtramos por sección según alumno actual)
        const allActas = (await vidaEscolar.actasAccidente.list()).data ?? [];
        if (!alive) return;
        setActas(allActas);

        // Asignaciones + personal para titular
        const [asigs, pers] = await Promise.all([
          gestionAcademica.asignacionDocenteSeccion
            .list()
            .then((r) => r.data ?? []),
          identidad.empleados
            .list()
            .then((r) => pageContent<PersonalDTO>(r.data)),
        ]);
        if (!alive) return;
        setAsignaciones(asigs);
        setPersonal(pers);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [seccionId, fecha]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const ids = Array.from(
        new Set((actas ?? []).map((a) => a.alumnoId ?? null)),
      ).filter((id): id is number => Number.isFinite(id));
      if (!ids.length) {
        if (alive) setAlumnoInfo(new Map());
        return;
      }

      try {
        const info = await fetchAlumnoExtendedInfo(ids);
        if (alive) setAlumnoInfo(info);
      } catch {
        if (!alive) return;
        const fallback = new Map<number, AlumnoExtendedInfo>();
        ids.forEach((id) => {
          fallback.set(id, {
            name: `Alumno #${id}`,
            dni: null,
            familiarName: null,
            familiarDni: null,
            section: null,
            level: null,
          });
        });
        setAlumnoInfo(fallback);
      }
    })();
    return () => {
      alive = false;
    };
  }, [actas]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!personal.length) {
        if (alive) setPersonalPersonas(new Map());
        return;
      }

      const personaIds = Array.from(
        new Set(
          personal
            .map((p) => p.personaId ?? null)
            .filter((id): id is number => Number.isFinite(id)),
        ),
      );

      if (!personaIds.length) {
        if (alive) setPersonalPersonas(new Map());
        return;
      }

      try {
        const personaMap = new Map<number, PersonaDTO | null>();
        try {
          const res = await identidad.personasCore.getManyById(personaIds);
          const list = Array.isArray(res.data) ? (res.data as PersonaDTO[]) : [];
          for (const persona of list) {
            if (persona?.id != null) {
              personaMap.set(persona.id, persona);
            }
          }
        } catch {
          // fallback individual
        }

        const missing = personaIds.filter((id) => !personaMap.has(id));
        if (missing.length) {
          const entries = await Promise.all(
            missing.map(async (id) => {
              try {
                const res = await identidad.personasCore.getById(id);
                return [id, res.data ?? null] as const;
              } catch {
                return [id, null] as const;
              }
            }),
          );
          for (const [id, persona] of entries) {
            personaMap.set(id, persona);
          }
        }

        const pairs = personal.map((emp) => {
          const persona =
            emp.personaId != null ? personaMap.get(emp.personaId) ?? null : null;
          return [emp.id, persona] as const;
        });

        if (alive) setPersonalPersonas(new Map(pairs));
      } catch {
        if (alive) setPersonalPersonas(new Map());
      }
    })();

    return () => {
      alive = false;
    };
  }, [personal]);

  // Índice alumnoId -> displayName + seccionId actual
  const alumnoNameById = useMemo(() => {
    const m = new Map<number, { name: string; seccionId: number | null }>();
    for (const a of alumnos) {
      const name =
        (a as any).nombreCompleto ??
        (a as any).nombre ??
        ([(a as any).apellido ?? "", (a as any).nombre ?? ""]
          .join(" ")
          .trim() ||
          `Alumno #${a.matriculaId}`);
      m.set(a.alumnoId ?? (a as any).id ?? 0, { name, seccionId: seccionId });
    }
    return m;
  }, [alumnos, seccionId]);

  // Titular de sección
  const titular = useMemo(() => {
    const a = asignaciones.find(
      (x: any) =>
        (x.seccionId ?? x.seccion?.id) === seccionId &&
        String(x.rol ?? "").toUpperCase() === "MAESTRO_TITULAR" &&
        vigente(x.vigenciaDesde, x.vigenciaHasta, hoyISO),
    );
    if (!a) return null;
    const pid = (a as any).personalId ?? (a as any).personal?.id;
    const p = personal.find((pp) => pp.id === pid);
    return p ? `${p.apellido ?? ""} ${p.nombre ?? ""}`.trim() : null;
  }, [asignaciones, personal, seccionId, hoyISO]);

  const seccionDisplayName = useMemo(() => {
    if (!seccion) return null;
    const base = `${seccion.gradoSala ?? ""} ${seccion.division ?? ""}`.trim();
    const turno = String(seccion.turno ?? "").trim();
    if (base && turno) return `${base} (${turno})`;
    return base || null;
  }, [seccion]);

  const personalInfoById = useMemo(() => {
    const map = new Map<number, { label: string; dni?: string | null }>();
    for (const p of personal as any[]) {
      if (p?.id == null) continue;
      const persona =
        p.personaId != null ? personalPersonas.get(p.personaId) ?? null : null;
      const personaNombre = persona
        ? `${persona.apellido ?? ""} ${persona.nombre ?? ""}`.trim()
        : "";
      const fallbackNombre = `${p.apellido ?? ""} ${p.nombre ?? ""}`
        .trim()
        .replace(/\s+/g, " ");
      const label =
        personaNombre ||
        fallbackNombre ||
        (p as any)?.nombreCompleto ||
        `Empleado #${p.id}`;
      map.set(p.id, { label, dni: persona?.dni ?? null });
    }
    return map;
  }, [personal, personalPersonas]);

  const direccionOptions = useMemo(() => {
    const items = (personal ?? []).filter(
      (p) => (p.rolEmpleado ?? null) === RolEmpleado.DIRECCION,
    );
    return items
      .map((p) => ({
        value: String(p.id),
        label: personalInfoById.get(p.id)?.label ?? `Empleado #${p.id}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "es"));
  }, [personal, personalInfoById]);

  // VM filtrada a la sección actual
  const items: ActaVM[] = useMemo(() => {
    const list: ActaVM[] = [];
    for (const a of actas) {
      const idx = alumnoNameById.get(a.alumnoId);
      // si no está en roster activo, igual mostramos si el acta pertenece a esta sección por el seccionId guardado (si lo tuvieras);
      // como fallback, solo mostramos si está en alumnos activos (fecha seleccionada)
      if (!idx) continue;
      const info = alumnoInfo.get(a.alumnoId) ?? null;
      const displayName = info?.name ?? idx.name;
      const seccionLabel = info?.section ?? seccionDisplayName ?? null;
      const informanteId = a.informanteId ?? null;
      const informanteInfo =
        informanteId != null ? personalInfoById.get(informanteId) : undefined;
      const firmanteId = (a as any).firmanteId ?? null;
      const firmanteInfo =
        firmanteId != null ? personalInfoById.get(firmanteId) : undefined;
      list.push({
        id: a.id,
        alumnoId: a.alumnoId,
        alumno: displayName,
        alumnoDni: info?.dni ?? null,
        familiar: info?.familiarName ?? null,
        familiarDni: info?.familiarDni ?? null,
        seccion: seccionLabel,
        seccionId: idx.seccionId,
        docente:
          informanteInfo?.label ??
          (informanteId != null ? `Empleado #${informanteId}` : a.creadoPor ?? null),
        fecha: a.fechaSuceso,
        hora: (a as any).horaSuceso ?? null,
        lugar: (a as any).lugar ?? null,
        acciones: (a as any).acciones ?? null,
        estado: String(a.estado ?? ""),
        creadoPor: a.creadoPor ?? null,
        descripcion: a.descripcion ?? "",
        firmante: firmanteInfo?.label ?? undefined,
        firmanteDni: firmanteInfo?.dni ?? null,
        firmanteId: firmanteId ?? null,
        informanteId,
        informante:
          informanteInfo?.label ??
          (informanteId != null ? `Empleado #${informanteId}` : null),
        informanteDni: informanteInfo?.dni ?? null,
      });
    }
    const term = q.trim().toLowerCase();
    return list
      .filter(
        (x) =>
          !term ||
          x.alumno.toLowerCase().includes(term) ||
          (x.docente ?? "").toLowerCase().includes(term),
      )
      .sort((a, b) => (b.fecha ?? "").localeCompare(a.fecha ?? ""));
  }, [
    actas,
    alumnoNameById,
    alumnoInfo,
    seccionDisplayName,
      personalInfoById,
    q,
  ]);

  const refreshActas = async () => {
    const all = (await vidaEscolar.actasAccidente.list()).data ?? [];
    setActas(all);
  };

  const isFirmadaDto = (dto?: ActaAccidenteDTO | null) =>
    String(dto?.estado ?? "").toUpperCase() === "FIRMADA";

  const openEditActa = (id: number) => {
    const target = actas.find((a) => a.id === id);
    if (!target) return;
    if (isFirmadaDto(target)) {
      toast.warning("El acta ya está firmada y no puede editarse.");
      return;
    }
    setEditActa(target);
  };

  const handleDeleteActa = async (id: number) => {
    if (!confirm("¿Eliminar el acta seleccionada?")) return;
    try {
      setDeletingId(id);
      await vidaEscolar.actasAccidente.delete(id);
      toast.success("Acta eliminada");
      if (viewActa?.id === id) setViewActa(null);
      setActas((prev) => prev.filter((a) => a.id !== id));
      await refreshActas();
    } catch (error: any) {
      toast.error(error?.message ?? "No se pudo eliminar el acta");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCloseActa = async (id: number) => {
    const target = actas.find((a) => a.id === id);
    if (!target) return;
    if (!target.horaSuceso || !(target as any).acciones || !target.lugar) {
      toast.error(
        "El acta no tiene información completa. Editá sus datos antes de cerrar el acta.",
      );
      return;
    }
    if (target.alumnoId == null || target.informanteId == null) {
      toast.error("El acta no tiene asignado un alumno o docente responsable.");
      return;
    }
    try {
      setClosingId(id);
      const today = new Date().toISOString().slice(0, 10);
      await vidaEscolar.actasAccidente.update(id, {
        alumnoId: target.alumnoId,
        informanteId: target.informanteId,
        fechaSuceso: target.fechaSuceso ?? today,
        horaSuceso: target.horaSuceso ?? "00:00",
        lugar: target.lugar ?? "",
        descripcion: target.descripcion ?? "",
        acciones: (target as any).acciones ?? "",
        estado: "CERRADA" as EstadoActaAccidente,
        firmanteId: (target as any).firmanteId ?? undefined,
        creadoPor: target.creadoPor ?? undefined,
      });
      toast.success("Acta cerrada");
      setActas((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                estado: "CERRADA" as EstadoActaAccidente,
              }
            : a,
        ),
      );
      setViewActa((prev) =>
        prev && prev.id === id ? { ...prev, estado: "CERRADA" } : prev,
      );
      await refreshActas();
    } catch (error: any) {
      toast.error(error?.message ?? "No se pudo actualizar el acta");
    } finally {
      setClosingId(null);
    }
  };

  const handleMarkFirmada = async (id: number) => {
    const target = actas.find((a) => a.id === id);
    if (!target) return;
    const estadoActual = String(target.estado ?? "").toUpperCase();
    if (estadoActual !== "CERRADA") {
      toast.error("Primero cerrá el acta antes de marcarla como firmada.");
      return;
    }
    const firmanteId = (target as any).firmanteId ?? null;
    if (firmanteId == null) {
      toast.error("Asigná una dirección firmante antes de marcar el acta como firmada.");
      return;
    }
    if (target.alumnoId == null || target.informanteId == null) {
      toast.error("El acta no tiene asignado un alumno o docente responsable.");
      return;
    }
    try {
      setFirmandoId(id);
      const today = new Date().toISOString().slice(0, 10);
      await vidaEscolar.actasAccidente.update(id, {
        alumnoId: target.alumnoId,
        informanteId: target.informanteId,
        fechaSuceso: target.fechaSuceso ?? today,
        horaSuceso: target.horaSuceso ?? "00:00",
        lugar: target.lugar ?? "",
        descripcion: target.descripcion ?? "",
        acciones: (target as any).acciones ?? "",
        estado: "FIRMADA" as EstadoActaAccidente,
        firmanteId: firmanteId ?? undefined,
        creadoPor: target.creadoPor ?? undefined,
      });
      toast.success("Acta marcada como firmada");
      setActas((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                estado: "FIRMADA" as EstadoActaAccidente,
              }
            : a,
        ),
      );
      setViewActa((prev) =>
        prev && prev.id === id ? { ...prev, estado: "FIRMADA" } : prev,
      );
      await refreshActas();
    } catch (error: any) {
      toast.error(error?.message ?? "No se pudo actualizar el acta");
    } finally {
      setFirmandoId(null);
    }
  };

  const handleAssignFirmante = async (id: number, firmanteId: number | null) => {
    const target = actas.find((a) => a.id === id);
    if (!target) return;
    if (target.alumnoId == null || target.informanteId == null) {
      toast.error("El acta no tiene asignado un alumno o docente responsable.");
      return;
    }
    const estadoActual = String(target.estado ?? "").toUpperCase();
    if (estadoActual === "BORRADOR") {
      toast.error("Cerrá el acta antes de asignar una dirección firmante.");
      return;
    }
    try {
      setUpdatingFirmanteId(id);
      const today = new Date().toISOString().slice(0, 10);
      await vidaEscolar.actasAccidente.update(id, {
        alumnoId: target.alumnoId,
        informanteId: target.informanteId,
        fechaSuceso: target.fechaSuceso ?? today,
        horaSuceso: target.horaSuceso ?? "00:00",
        lugar: target.lugar ?? "",
        descripcion: target.descripcion ?? "",
        acciones: (target as any).acciones ?? "",
        estado: (target.estado ?? "BORRADOR") as EstadoActaAccidente,
        firmanteId: firmanteId ?? undefined,
        creadoPor: target.creadoPor ?? undefined,
      });
      toast.success("Dirección firmante actualizada");
      const info = firmanteId != null ? personalInfoById.get(firmanteId) : undefined;
      setActas((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                firmanteId: firmanteId ?? undefined,
              }
            : a,
        ),
      );
      setViewActa((prev) =>
        prev && prev.id === id
          ? {
              ...prev,
              firmanteId: firmanteId ?? null,
              firmante:
                info?.label ?? (firmanteId != null ? `Empleado #${firmanteId}` : null),
              firmanteDni: info?.dni ?? null,
            }
          : prev,
      );
      await refreshActas();
    } catch (error: any) {
      toast.error(error?.message ?? "No se pudo actualizar el acta");
    } finally {
      setUpdatingFirmanteId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingState label="Cargando actas…" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/accidentes")}
        >
          Volver
        </Button>

        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">
              Actas de Accidentes — Sección{" "}
              {seccion
                ? `${seccion.gradoSala} ${seccion.division}`
                : `#${seccionId}`}
            </h2>
            <p className="text-muted-foreground text-sm">
              Turno {seccion?.turno ?? "—"}{" "}
              {titular ? (
                <>
                  — Titular: <span className="font-medium">{titular}</span>
                </>
              ) : null}
            </p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="hidden md:block">
              <label className="text-xs block mb-1">
                Fecha (roster activo)
              </label>
              <DatePicker
                value={fecha || undefined}
                onChange={(value) => setFecha(value ?? "")}
              />
            </div>
            <div className="relative w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar alumno/docente…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-10"
              />
            </div>
            {canCreate && (
              <NewActaDialog
                open={openNew}
                onOpenChange={setOpenNew}
                seccionId={seccionId}
                fechaRoster={fecha}
                onCreated={refreshActas}
                mode={isDirector || isSecret || isAdmin ? "global" : "teacher"}
              >
                <Button>
                  <Plus className="h-4 w-4 mr-1" /> Nueva acta
                </Button>
              </NewActaDialog>
            )}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registro de actas</CardTitle>
            <CardDescription>Historial por sección</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {items.map((a) => {
                const estadoUpper = a.estado.toUpperCase();
                const estadoBadge = (() => {
                  if (estadoUpper === "FIRMADA")
                    return { label: "Firmada", variant: "default" as const };
                  if (estadoUpper === "CERRADA")
                    return { label: "Cerrada", variant: "secondary" as const };
                  if (estadoUpper === "BORRADOR")
                    return { label: "Borrador", variant: "destructive" as const };
                  return { label: a.estado || "Sin estado", variant: "outline" as const };
                })();
                return (
                  <div
                    key={a.id}
                    className="flex items-center justify-between border rounded p-3"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="font-medium">{a.alumno}</div>
                      <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-4">
                        <span className="inline-flex items-center">
                          <Calendar className="h-3 w-3 mr-1" /> {a.fecha}
                        </span>
                        {a.hora && (
                          <span className="inline-flex items-center">
                            Hora: {a.hora}
                          </span>
                        )}
                        {a.lugar && (
                          <span className="inline-flex items-center">
                            Lugar: {a.lugar}
                          </span>
                        )}
                        {a.informante && (
                          <span className="inline-flex items-center">
                            Docente informante: {a.informante}
                          </span>
                        )}
                        {a.firmante && (
                          <span className="inline-flex items-center">
                            Dirección firmante: {a.firmante}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={estadoBadge.variant}>{estadoBadge.label}</Badge>
                      {canEditActas && estadoUpper !== "FIRMADA" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditActa(a.id)}
                        >
                          <Pencil className="h-4 w-4 mr-1" /> Editar
                        </Button>
                      )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewActa(a)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> Ver
                    </Button>
                    {canDeleteActas && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteActa(a.id)}
                        disabled={deletingId === a.id}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {deletingId === a.id ? "Eliminando…" : "Eliminar"}
                      </Button>
                    )}
                  </div>
                </div>
                  </div>
                );
              })}
              {!items.length && (
                <div className="text-sm text-muted-foreground">
                  No hay actas para los filtros aplicados.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {viewActa && (
          <ViewActaDialog
            acta={viewActa}
            onClose={() => setViewActa(null)}
            canEdit={
              canEditActas && viewActa.estado.toUpperCase() !== "FIRMADA"
            }
            canDelete={canDeleteActas}
            canCloseActa={canCloseActas}
            canMarkFirmada={canMarkFirmada}
            canManageFirmante={canManageFirmante}
            onEdit={() => {
              openEditActa(viewActa.id);
              setViewActa(null);
            }}
            onDelete={() => handleDeleteActa(viewActa.id)}
            onCloseActa={() => handleCloseActa(viewActa.id)}
            onMarkFirmada={() => handleMarkFirmada(viewActa.id)}
            onFirmanteChange={(value) =>
              handleAssignFirmante(viewActa.id, value)
            }
            deleting={deletingId === viewActa.id}
            closing={closingId === viewActa.id}
            markingFirmada={firmandoId === viewActa.id}
            firmanteOptions={direccionOptions}
            firmanteUpdating={updatingFirmanteId === viewActa.id}
          />
        )}
        {editActa && (
          <EditActaDialog
            acta={editActa}
            onClose={() => setEditActa(null)}
            onSaved={async () => {
              setEditActa(null);
              await refreshActas();
            }}
            canManageFirmante={canManageFirmante}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
