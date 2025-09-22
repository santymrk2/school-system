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
import { Input } from "@/components/ui/input";
import {
  Search,
  Calendar,
  CheckCircle,
  X,
  Plus,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { api } from "@/services/api";
import type {
  ActaAccidenteDTO,
  AlumnoLiteDTO,
  EstadoActaAccidente,
  SeccionDTO,
  AsignacionDocenteSeccionDTO,
  PersonalDTO,
} from "@/types/api-generated";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";
import ViewActaDialog from "../../_components/ViewActaDialog";
import NewActaDialog from "../../_components/NewActaDialog";
import { useViewerScope } from "@/hooks/scope/useViewerScope";
import { toast } from "sonner";
import EditActaDialog from "../../_components/EditActaDialog";
import { UserRole } from "@/types/api-generated";

type ActaVM = {
  id: number;
  alumnoId: number;
  alumno: string;
  seccionId?: number | null;
  docente?: string | null;
  fecha: string;
  hora?: string | null;
  lugar?: string | null;
  acciones?: string | null;
  firmada: boolean;
  estado: string;
  creadoPor?: string | null;
  descripcion: string;
  informante?: string | null;
  firmante?: string | null;
  firmanteId?: number | null;
  informanteId?: number | null;
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
  const canMarkSigned = canManageActas;

  const [loading, setLoading] = useState(true);
  const [seccion, setSeccion] = useState<SeccionDTO | null>(null);
  const [alumnos, setAlumnos] = useState<AlumnoLiteDTO[]>([]);
  const [actas, setActas] = useState<ActaAccidenteDTO[]>([]);
  const [asignaciones, setAsignaciones] = useState<
    AsignacionDocenteSeccionDTO[]
  >([]);
  const [personal, setPersonal] = useState<PersonalDTO[]>([]);

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
  const [markingId, setMarkingId] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        // Sección
        let sec: SeccionDTO | null = null;
        try {
          sec = (await api.secciones.byId(seccionId)).data ?? null;
        } catch {
          const list = (await api.secciones.list()).data ?? [];
          sec = list.find((s) => s.id === seccionId) ?? null;
        }
        if (!alive) return;
        setSeccion(sec);

        // Alumnos activos en fecha (para alta)
        const als =
          (await api.seccionesAlumnos.bySeccionId(seccionId)).data ?? [];
        if (!alive) return;
        setAlumnos(als);

        // Actas (de toda la escuela, luego filtramos por sección según alumno actual)
        const allActas = (await api.actasAccidente.list()).data ?? [];
        if (!alive) return;
        setActas(allActas);

        // Asignaciones + personal para titular
        const [asigs, pers] = await Promise.all([
          api.asignacionDocenteSeccion.list().then((r) => r.data ?? []),
          api.empleados.list().then((r) => r.data ?? []),
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

  const personalDisplayById = useMemo(() => {
    const map = new Map<number, string>();
    for (const p of personal as any[]) {
      const label =
        `${p.apellido ?? ""} ${p.nombre ?? ""}`.trim() ||
        p.nombreCompleto ||
        `Empleado #${p.id}`;
      if (p.id != null) map.set(p.id, label);
    }
    return map;
  }, [personal]);

  // VM filtrada a la sección actual
  const items: ActaVM[] = useMemo(() => {
    const list: ActaVM[] = [];
    for (const a of actas) {
      const idx = alumnoNameById.get(a.alumnoId);
      // si no está en roster activo, igual mostramos si el acta pertenece a esta sección por el seccionId guardado (si lo tuvieras);
      // como fallback, solo mostramos si está en alumnos activos (fecha seleccionada)
      if (!idx) continue;
      list.push({
        id: a.id,
        alumnoId: a.alumnoId,
        alumno: idx.name,
        seccionId: idx.seccionId,
        docente:
          personalDisplayById.get(a.firmanteId ?? a.informanteId ?? 0) ??
          a.creadoPor ?? null,
        fecha: a.fechaSuceso,
        hora: (a as any).horaSuceso ?? null,
        lugar: (a as any).lugar ?? null,
        acciones: (a as any).acciones ?? null,
        firmada: (a as any).estado === "CERRADA",
        estado: String(a.estado ?? ""),
        creadoPor: a.creadoPor ?? null,
        descripcion: a.descripcion ?? "",
        informante:
          personalDisplayById.get(a.informanteId ?? 0) ?? undefined,
        firmante:
          personalDisplayById.get((a as any).firmanteId ?? 0) ?? undefined,
        firmanteId: (a as any).firmanteId ?? null,
        informanteId: a.informanteId ?? null,
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
  }, [actas, alumnoNameById, q]);

  const refreshActas = async () => {
    const all = (await api.actasAccidente.list()).data ?? [];
    setActas(all);
  };

  const isCerradaDto = (dto?: ActaAccidenteDTO | null) =>
    String(dto?.estado ?? "").toUpperCase() === "CERRADA";

  const openEditActa = (id: number) => {
    const target = actas.find((a) => a.id === id);
    if (!target) return;
    if (isCerradaDto(target)) {
      toast.warning("El acta ya está firmada y no puede editarse.");
      return;
    }
    setEditActa(target);
  };

  const handleDeleteActa = async (id: number) => {
    if (!confirm("¿Eliminar el acta seleccionada?")) return;
    try {
      setDeletingId(id);
      await api.actasAccidente.delete(id);
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

  const handleMarkSigned = async (id: number) => {
    const target = actas.find((a) => a.id === id);
    if (!target) return;
    if (!target.horaSuceso || !(target as any).acciones || !target.lugar) {
      toast.error(
        "El acta no tiene información completa. Editá sus datos antes de marcarla como firmada.",
      );
      return;
    }
    try {
      setMarkingId(id);
      await api.actasAccidente.update(id, {
        fechaSuceso: target.fechaSuceso ?? new Date().toISOString().slice(0, 10),
        horaSuceso: target.horaSuceso ?? "00:00",
        lugar: target.lugar ?? "",
        descripcion: target.descripcion ?? "",
        acciones: (target as any).acciones ?? "",
        estado: "CERRADA" as EstadoActaAccidente,
        firmanteId: (target as any).firmanteId ?? undefined,
        creadoPor: target.creadoPor ?? undefined,
      });
      toast.success("Acta marcada como firmada");
      setViewActa(null);
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
      await refreshActas();
    } catch (error: any) {
      toast.error(error?.message ?? "No se pudo actualizar el acta");
    } finally {
      setMarkingId(null);
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
              <Input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
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
              {items.map((a) => (
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
                          Informante: {a.informante}
                        </span>
                      )}
                      {a.firmante && (
                        <span className="inline-flex items-center">
                          Firmante: {a.firmante}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={a.firmada ? "default" : "destructive"}>
                      {a.firmada ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" /> Firmada
                        </>
                      ) : (
                        <>
                          <X className="h-3 w-3 mr-1" /> Pendiente
                        </>
                      )}
                    </Badge>
                    {canEditActas && !a.firmada && (
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
              ))}
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
            canEdit={canEditActas && !viewActa.firmada}
            canDelete={canDeleteActas}
            canMarkSigned={canMarkSigned && !viewActa.firmada}
            onEdit={() => {
              openEditActa(viewActa.id);
              setViewActa(null);
            }}
            onDelete={() => handleDeleteActa(viewActa.id)}
            onMarkSigned={() => handleMarkSigned(viewActa.id)}
            deleting={deletingId === viewActa.id}
            marking={markingId === viewActa.id}
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
            canManageFirmante={canManageActas}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
