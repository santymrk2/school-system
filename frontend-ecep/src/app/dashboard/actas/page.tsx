"use client";

import { useEffect, useMemo, useState } from "react";
import LoadingState from "@/components/common/LoadingState";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Search,
  FileText,
  CheckCircle,
  AlertTriangle,
  Eye,
  Download,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  gestionAcademica,
  identidad,
  vidaEscolar,
} from "@/services/api/modules";
import { useViewerScope } from "@/hooks/scope/useViewerScope";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";
import { toast } from "sonner";
import { useScopedIndex } from "@/hooks/scope/useScopedIndex";
import { pageContent } from "@/lib/page-response";
import FamilyActasView from "@/app/dashboard/actas/_components/FamilyActasView";

import NewActaDialog from "./_components/NewActaDialog";
import ViewActaDialog from "./_components/ViewActaDialog";
import EditActaDialog from "./_components/EditActaDialog";
import {
  fetchAlumnoExtendedInfo,
  type AlumnoExtendedInfo,
} from "./_utils/alumno-info";

import type {
  ActaAccidenteDTO,
  SeccionDTO,
  EstadoActaAccidente,
  EmpleadoDTO,
  PersonaDTO,
} from "@/types/api-generated";
import { UserRole, RolEmpleado } from "@/types/api-generated";

const todayISO = () => new Date().toISOString().slice(0, 10);

type ActaVM = {
  id: number;
  alumnoId: number;
  alumno: string; // "Apellido, Nombre"
  alumnoDni?: string | null;
  familiar?: string | null;
  familiarDni?: string | null;
  seccion?: string | null;
  fecha: string; // fechaSuceso
  hora?: string | null;
  lugar?: string | null;
  descripcion: string;
  estado: string; // enum -> string
  creadoPor?: string | null;
  acciones?: string | null;
  firmante?: string | null;
  firmanteDni?: string | null;
  informante?: string | null;
  informanteDni?: string | null;
  informanteId?: number | null;
  firmanteId?: number | null;
};

export default function AccidentesIndexPage() {
  const { activeRole } = useViewerScope();
  const { periodoEscolarId, hoyISO } = useActivePeriod();
  const {
    scope,
    hijos,
    loading: scopeLoading,
    error: scopeError,
  } = useScopedIndex();


  const role = activeRole ?? null;
  const isDirector = role === UserRole.DIRECTOR;
  const isAdmin = role === UserRole.ADMIN;
  const isSecret = role === UserRole.SECRETARY;
  const isTeacher =
    role === UserRole.TEACHER || role === UserRole.ALTERNATE;
  const isFamilyScope = scope === "family" || scope === "student";

  const noAccess = !isDirector && !isAdmin && !isSecret && !isTeacher;

  const canCreate = isDirector || isSecret || isAdmin || isTeacher;
  const canExport = isDirector || isAdmin || isSecret;
  const canManageActas = isDirector || isSecret;
  const canEditActas = canManageActas;
  const canDeleteActas = canManageActas;
  const canCloseActas = canManageActas;
  const canMarkFirmada = canManageActas;
  const canManageFirmante = canManageActas;
  const createMode: "global" | "teacher" =
    isDirector || isSecret || isAdmin ? "global" : "teacher";

  // datos crudos
  const [actas, setActas] = useState<ActaAccidenteDTO[]>([]);
  const [secciones, setSecciones] = useState<SeccionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [personal, setPersonal] = useState<EmpleadoDTO[]>([]);
  const [personalPersonas, setPersonalPersonas] = useState<
    Map<number, PersonaDTO | null>
  >(new Map());

  // maps auxiliares
  const [alumnoInfo, setAlumnoInfo] = useState<Map<number, AlumnoExtendedInfo>>(
    new Map(),
  );
  const [alumnoSeccion, setAlumnoSeccion] = useState<
    Map<number, string | null>
  >(new Map());

  // filtros
  const [q, setQ] = useState("");
  const [alumnoFilterId, setAlumnoFilterId] = useState<string>("all");
  const [estadoFilter, setEstadoFilter] = useState<
    "todas" | "firmadas" | "cerradas" | "pendientes"
  >("todas");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // dialogs
  const [openNew, setOpenNew] = useState(false);
  const [viewActa, setViewActa] = useState<ActaVM | null>(null);
  const [editActa, setEditActa] = useState<ActaAccidenteDTO | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [closingId, setClosingId] = useState<number | null>(null);
  const [firmandoId, setFirmandoId] = useState<number | null>(null);
  const [updatingFirmanteId, setUpdatingFirmanteId] = useState<number | null>(null);

  // carga inicial: actas + secciones (para mapear alumno→sección vigente hoy)
  useEffect(() => {
    if (isFamilyScope) return;

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [actasRes, seccRes, personalRes] = await Promise.all([
          vidaEscolar.actasAccidente.list().catch(() => ({ data: [] })),
          gestionAcademica.secciones.list().catch(() => ({ data: [] })),
          identidad.empleados.list().catch(() => ({ data: [] })),
        ]);
        if (!alive) return;
        const secs = (seccRes.data ?? []).filter(
          (s: any) =>
            (s.periodoEscolarId ?? s.periodoId ?? s.periodoEscolar?.id) ===
            periodoEscolarId,
        );
        setActas(actasRes.data ?? []);
        setSecciones(secs);
        setPersonal(pageContent<EmpleadoDTO>(personalRes.data));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [isFamilyScope, periodoEscolarId]);

  useEffect(() => {
    if (isFamilyScope) return;

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
          // noop, fallback abajo
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
  }, [isFamilyScope, personal]);

  // alumnoId -> nombre "Apellido, Nombre" (vía Alumno → Persona)
  useEffect(() => {
    if (isFamilyScope) return;

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
  }, [actas, isFamilyScope]);

  // alumnoId -> sección vigente HOY usando seccionesAlumnos.bySeccionId(seccionId, hoyISO)
  useEffect(() => {
    if (isFamilyScope) return;

    let alive = true;
    (async () => {
      try {
        const map = new Map<number, string | null>();
        if (!secciones.length || !hoyISO) {
          setAlumnoSeccion(map);
          return;
        }
        const chunks = await Promise.all(
          secciones.map((s) =>
            gestionAcademica.seccionesAlumnos
              .bySeccionId(s.id, hoyISO)
              .then((r) => r.data ?? [])
              .catch(() => []),
          ),
        );
        const nombreSeccion = (s: SeccionDTO) => {
          const base = `${s.gradoSala ?? ""} ${s.division ?? ""}`.trim();
          const turno = String(s.turno ?? "").trim();
          if (base && turno) return `${base} (${turno})`;
          if (base) return base;
          return `Sección #${s.id}`;
        };
        // asignar
        secciones.forEach((s, idx) => {
          const roster = Array.isArray(chunks[idx]) ? chunks[idx] : [];
          for (const au of roster as any[]) {
            const id = au.alumnoId ?? au.id;
            if (id == null || map.has(id)) continue;
            const etiqueta =
              (au.seccionNombre as string | undefined | null)?.trim() ||
              nombreSeccion(s);
            map.set(id, etiqueta);
          }
        });
        if (alive) setAlumnoSeccion(map);
      } catch {
        if (alive) setAlumnoSeccion(new Map());
      }
    })();
    return () => {
      alive = false;
    };
  }, [hoyISO, isFamilyScope, secciones]);

  const personalInfoById = useMemo(() => {
    const map = new Map<number, { label: string; dni?: string | null }>();
    const items = Array.isArray(personal) ? personal : [];
    for (const p of items as any[]) {
      if (p?.id == null) continue;
      const persona = personalPersonas.get(p.id) ?? null;
      const nombrePersona = `${persona?.apellido ?? ""} ${persona?.nombre ?? ""}`
        .trim()
        .replace(/\s+/g, " ");
      const fallbackNombre = `${p.apellido ?? ""} ${p.nombre ?? ""}`
        .trim()
        .replace(/\s+/g, " ");
      const label =
        nombrePersona ||
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

  // VM
  const actasVM: ActaVM[] = useMemo(() => {
    return (actas ?? []).map((a) => {
      const info = alumnoInfo.get(a.alumnoId) ?? null;
      const alumnoLabel = info?.name ?? `Alumno #${a.alumnoId}`;
      const seccion = alumnoSeccion.get(a.alumnoId) ?? info?.section ?? null;
      const informanteId = a.informanteId ?? null;
      const informanteInfo =
        informanteId != null ? personalInfoById.get(informanteId) : undefined;
      const firmanteId = (a as any).firmanteId ?? null;
      const firmanteInfo =
        firmanteId != null ? personalInfoById.get(firmanteId) : undefined;

      return {
        id: a.id,
        alumnoId: a.alumnoId,
        alumno: alumnoLabel,
        alumnoDni: info?.dni ?? null,
        familiar: info?.familiarName ?? null,
        familiarDni: info?.familiarDni ?? null,
        seccion,
        fecha: a.fechaSuceso,
        hora: (a as any).horaSuceso ?? null,
        lugar: (a as any).lugar ?? null,
        descripcion: a.descripcion ?? "",
        acciones: (a as any).acciones ?? null,
        estado: String((a as any).estado ?? ""),
        creadoPor: (a as any).creadoPor ?? null,
        informante:
          informanteInfo?.label ??
          (informanteId != null ? `Empleado #${informanteId}` : undefined),
        informanteDni: informanteInfo?.dni ?? null,
        firmante: firmanteInfo?.label ?? undefined,
        firmanteDni: firmanteInfo?.dni ?? null,
        informanteId: a.informanteId ?? null,
        firmanteId: firmanteId ?? null,
      } satisfies ActaVM;
    });
  }, [actas, alumnoInfo, alumnoSeccion, personalInfoById]);

  // opciones de filtro por alumno
  const alumnoOptions = useMemo(() => {
    const set = new Map<number, string>();
    for (const a of actasVM) set.set(a.alumnoId, a.alumno);
    return Array.from(set.entries()).sort((x, y) => x[1].localeCompare(y[1]));
  }, [actasVM]);

  // métricas
  const total = actasVM.length;
  const firmadas = actasVM.filter(
    (a) => a.estado.toUpperCase() === "FIRMADA",
  ).length;
  const pendientes = total - firmadas;
  const pctFirmadas = total ? Math.round((firmadas / total) * 100) : 0;

  // filtrado
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const alumnoIdNum = alumnoFilterId !== "all" ? Number(alumnoFilterId) : NaN;
    return actasVM
      .filter((a) => {
        if (!Number.isNaN(alumnoIdNum) && a.alumnoId !== alumnoIdNum)
          return false;
        const estadoUpper = a.estado.toUpperCase();
        if (estadoFilter === "firmadas" && estadoUpper !== "FIRMADA")
          return false;
        if (
          estadoFilter === "pendientes" &&
          estadoUpper === "FIRMADA"
        )
          return false;
        if (estadoFilter === "cerradas" && estadoUpper !== "CERRADA")
          return false;
        if (fromDate && a.fecha < fromDate) return false;
        if (toDate && a.fecha > toDate) return false;
        if (!term) return true;
        const blob =
          `${a.alumno} ${a.alumnoDni ?? ""} ${a.familiar ?? ""} ${
            a.familiarDni ?? ""
          } ${a.seccion ?? ""} ${a.descripcion ?? ""} ${a.firmante ?? ""} ${
            a.lugar ?? ""
          } ${a.acciones ?? ""}`.toLowerCase();
        return blob.includes(term);
      })
      .sort((a, b) => (b.fecha ?? "").localeCompare(a.fecha ?? ""));
  }, [actasVM, alumnoFilterId, estadoFilter, fromDate, toDate, q]);

  const refresh = async () => {
    const [actasRes, personalRes] = await Promise.all([
      vidaEscolar.actasAccidente.list().catch(() => ({ data: [] })),
      identidad.empleados.list().catch(() => ({ data: [] })),
    ]);
    setActas(actasRes.data ?? []);
    setPersonal(pageContent<EmpleadoDTO>(personalRes.data));
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
      await refresh();
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
      await vidaEscolar.actasAccidente.update(id, {
        alumnoId: target.alumnoId,
        informanteId: target.informanteId,
        fechaSuceso: target.fechaSuceso ?? todayISO(),
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
      await refresh();
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
      await vidaEscolar.actasAccidente.update(id, {
        alumnoId: target.alumnoId,
        informanteId: target.informanteId,
        fechaSuceso: target.fechaSuceso ?? todayISO(),
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
      await refresh();
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
      await vidaEscolar.actasAccidente.update(id, {
        alumnoId: target.alumnoId,
        informanteId: target.informanteId,
        fechaSuceso: target.fechaSuceso ?? todayISO(),
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
      await refresh();
    } catch (error: any) {
      toast.error(error?.message ?? "No se pudo actualizar el acta");
    } finally {
      setUpdatingFirmanteId(null);
    }
  };

  const exportCSV = () => {
    const rows = [
      [
        "ID",
        "Alumno",
        "Sección",
        "Fecha",
        "Hora",
        "Lugar",
        "Estado",
        "Firmante",
        "Descripción",
        "Acciones",
      ],
      ...filtered.map((a) => [
        a.id,
        a.alumno,
        a.seccion ?? "-",
        a.fecha,
        a.hora ?? "-",
        a.lugar ?? "-",
        a.estado,
        a.firmante ?? "-",
        (a.descripcion ?? "").replace(/\n/g, " ").slice(0, 1000),
        (a.acciones ?? "").replace(/\n/g, " ").slice(0, 1000),
      ]),
    ];
    const csv = rows
      .map((r) =>
        r
          .map((v) => {
            const s = String(v ?? "");
            return /[\",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
          })
          .join(";"),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `actas-${todayISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isFamilyScope) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Actas de Accidentes</h2>
          <p className="text-sm text-muted-foreground">
            Visualizá los registros vinculados a tus hijos.
          </p>
        </div>
        <FamilyActasView
          alumnos={hijos}
          initialLoading={scopeLoading}
          initialError={scopeError ? String(scopeError) : null}
        />
      </div>
    );
  }

  if (noAccess) {
    return (

        <div className="p-6 text-sm">
          403 — No tenés acceso a Actas de Accidentes.
        </div>
      
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Actas de Accidentes
            </h2>
            <p className="text-muted-foreground">
              {isDirector
                ? "Dirección — gestión completa"
                : isAdmin || isSecret
                  ? "Administración/Secretaría — lectura y reportes"
                  : "Docentes — creación"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canExport && (
              <Button variant="outline" onClick={exportCSV}>
                <Download className="h-4 w-4 mr-1" /> Exportar CSV
              </Button>
            )}
            {canCreate && (
              <NewActaDialog
                open={openNew}
                onOpenChange={setOpenNew}
                onCreated={refresh}
                mode={createMode}
              >
                <Button>Nueva Acta</Button>
              </NewActaDialog>
            )}
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={alumnoFilterId} onValueChange={setAlumnoFilterId}>
            <SelectTrigger className="w-[260px]">
              <SelectValue placeholder="Filtrar por alumno" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los alumnos</SelectItem>
              {alumnoOptions.map(([id, name]) => (
                <SelectItem key={id} value={String(id)}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={estadoFilter}
            onValueChange={(v) => setEstadoFilter(v as any)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="firmadas">Firmadas</SelectItem>
              <SelectItem value="cerradas">Cerradas</SelectItem>
              <SelectItem value="pendientes">Pendientes de firma</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <DatePicker
              value={fromDate || undefined}
              max={toDate || undefined}
              onChange={(value) => {
                const next = value ?? "";
                setFromDate(next);
                if (value && toDate && value > toDate) {
                  setToDate(value);
                }
              }}
            />
            <span className="text-xs text-muted-foreground">a</span>
            <DatePicker
              value={toDate || undefined}
              min={fromDate || undefined}
              onChange={(value) => {
                const next = value ?? "";
                setToDate(next);
                if (value && fromDate && value < fromDate) {
                  setFromDate(value);
                }
              }}
            />
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar texto (alumno/creador/descr.)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Actas
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total}</div>
              <p className="text-xs text-muted-foreground">Acumulado</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Actas firmadas
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">
                {firmadas}
              </div>
              <p className="text-xs text-muted-foreground">
                {pctFirmadas}% del total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Pendientes de firma
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {pendientes}
              </div>
              <p className="text-xs text-muted-foreground">
                Incluye borradores y actas cerradas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Listado */}
        <TooltipProvider delayDuration={200}>
          <Card>
            <CardHeader>
              <CardTitle>Actas</CardTitle>
              <CardDescription>
                Consulta completa (aplican filtros)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading && <LoadingState label="Cargando actas…" />}
                {!loading &&
                  filtered.map((a) => {
                    const estadoUpper = a.estado.toUpperCase();
                    const estadoBadge = (() => {
                      if (estadoUpper === "FIRMADA")
                        return { label: "Firmada", variant: "default" as const };
                      if (estadoUpper === "CERRADA")
                        return { label: "Cerrada", variant: "secondary" as const };
                      if (estadoUpper === "BORRADOR")
                        return { label: "Borrador", variant: "destructive" as const };
                      return {
                        label: a.estado || "Sin estado",
                        variant: "outline" as const,
                      };
                    })();
                    return (
                      <div
                        key={a.id}
                        className="flex items-start justify-between border rounded-lg p-3"
                      >
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                            <div className="font-medium">{a.alumno}</div>
                            <div className="text-xs text-muted-foreground">
                              {a.seccion ?? "—"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {a.fecha}
                            </div>
                            {a.hora && (
                              <div className="text-xs text-muted-foreground">
                                {a.hora}
                              </div>
                            )}
                            {a.lugar && (
                              <div className="text-xs text-muted-foreground">
                                {a.lugar}
                              </div>
                            )}
                          </div>
                          <div className="mt-1 text-sm line-clamp-2 text-muted-foreground whitespace-pre-wrap">
                            {a.descripcion || "—"}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                            <Badge variant={estadoBadge.variant}>
                              {estadoBadge.label}
                            </Badge>
                            {a.informante && (
                              <Badge variant="outline">
                                Docente informante: {a.informante}
                              </Badge>
                            )}
                            {a.firmante && (
                              <Badge variant="outline">
                                Dirección firmante: {a.firmante}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="ml-3 flex items-center gap-2">
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
                    );
                  })}
                {!loading && filtered.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No hay actas para el criterio seleccionado.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TooltipProvider>

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
              await refresh();
            }}
            canManageFirmante={canManageFirmante}
          />
        )}
      </div>
    
  );
}
