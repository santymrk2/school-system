"use client";

import { useEffect, useMemo, useState } from "react";
import LoadingState from "@/components/common/LoadingState";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/dashboard/dashboard-layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, UserPlus } from "lucide-react";
import { api } from "@/services/api";
import type {
  SeccionDTO,
  SeccionMateriaDTO,
  MateriaDTO,
  NivelAcademico,
  AsignacionDocenteMateriaDTO,
} from "@/types/api-generated";
import AddMateriaToSeccionDialog from "@/app/dashboard/materias/_components/AddMateriaToSeccionDialog";
import AsignarDocenteMateriaDialog from "@/app/dashboard/materias/_components/AsignarDocenteMateriaDialog";
import { useViewerScope } from "@/hooks/scope/useViewerScope";
import { useScopedSecciones } from "@/hooks/scope/useScopedSecciones";
import { UserRole } from "@/types/api-generated";

type Seccion = SeccionDTO;
type SM = SeccionMateriaDTO;
type Materia = MateriaDTO;
type Asignacion = {
  id: number;
  seccionMateriaId: number;
  empleadoId: number;
  rol: "TITULAR" | "SUPLENTE";
  vigenciaDesde: string; // YYYY-MM-DD
  vigenciaHasta?: string | null;
};
type EmpleadoLite = {
  id: number;
  nombre?: string | null;
  apellido?: string | null;
};

function fmtSeccion(s: Seccion) {
  const base =
    `${s.gradoSala ?? ""} ${s.division ?? ""}`.trim() || `Sección #${s.id}`;
  return base;
}
function fmtEmpleado(p?: EmpleadoLite) {
  if (!p) return "—";
  const ap = (p.apellido ?? "").trim();
  const no = (p.nombre ?? "").trim();
  return ap || no ? `${ap}${ap && no ? ", " : ""}${no}` : `#${p.id}`;
}
function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}
function vigenteHoy(a: Asignacion, key = todayKey()) {
  const d = a.vigenciaDesde ?? "0001-01-01";
  const h = a.vigenciaHasta ?? "9999-12-31";
  return d <= key && key <= h;
}
function isPrimario(s: Seccion) {
  const n = (s.nivel as NivelAcademico | undefined) ?? (s as any).nivel;
  if (n) return String(n).toUpperCase() === "PRIMARIO";
  const gs = `${s.gradoSala ?? ""}`.toLowerCase();
  return !gs.includes("sala");
}

function formatTurnoLabel(turno?: string | null) {
  if (!turno) return null;
  const map: Record<string, string> = { MANANA: "Mañana", TARDE: "Tarde" };
  const normalized = map[String(turno).toUpperCase()] ?? turno;
  return `Turno ${normalized}`;
}

export default function MateriasSeccionPage() {
  const { id } = useParams<{ id: string }>();
  const seccionId = Number(id);
  const router = useRouter();
  const { type, activeRole } = useViewerScope();
  const {
    loading: scopedLoading,
    secciones: accesibles,
  } = useScopedSecciones();

  const isAdmin = activeRole === UserRole.ADMIN;
  const isTeacher = type === "teacher";
  const isStaff = type === "staff";
  const teacherHasAccess = useMemo(() => {
    if (!isTeacher) return true;
    return accesibles.some((s) => s.id === seccionId);
  }, [accesibles, isTeacher, seccionId]);

  const [loading, setLoading] = useState(true);
  const [seccion, setSeccion] = useState<Seccion | null>(null);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [sms, setSms] = useState<SM[]>([]);
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [empleados, setEmpleados] = useState<EmpleadoLite[]>([]);

  const [openAdd, setOpenAdd] = useState(false);
  const [openAsignar, setOpenAsignar] = useState<{
    sm: SM;
    materia: Materia;
    ocupados: {
      titularId?: number | null;
      suplenteId?: number | null;
    };
  } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const accessStatus = useMemo(
    () => {
      if (isAdmin) return "admin" as const;
      if (!isStaff && !isTeacher) return "forbidden" as const;
      if (isTeacher && scopedLoading) return "checking" as const;
      if (isTeacher && !teacherHasAccess) return "notAssigned" as const;
      return "ok" as const;
    },
    [
      isAdmin,
      isStaff,
      isTeacher,
      scopedLoading,
      teacherHasAccess,
    ],
  );

  const materiasById = useMemo(
    () => new Map(materias.map((m) => [m.id, m])),
    [materias],
  );
  const empleadoById = useMemo(
    () => new Map(empleados.map((p) => [p.id, p] as const)),
    [empleados],
  );
  const asignacionesBySm = useMemo(() => {
    const m = new Map<number, Asignacion[]>();
    for (const a of asignaciones) {
      const arr = m.get(a.seccionMateriaId) ?? [];
      arr.push(a);
      m.set(a.seccionMateriaId, arr);
    }
    // ordenar por desde desc
    for (const arr of m.values()) {
      arr.sort((a, b) =>
        (b.vigenciaDesde ?? "").localeCompare(a.vigenciaDesde ?? ""),
      );
    }
    return m;
  }, [asignaciones]);

  const turnoBadgeLabel = formatTurnoLabel(seccion?.turno);

  useEffect(() => {
    if (accessStatus !== "ok") return;

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [secRes, matRes, smRes, asgRes, empRes] = await Promise.all([
          api.secciones.list(),
          api.materias.list(),
          api.seccionMaterias.list(),
          api.asignacionDocenteMateria.list(),
          api.empleados.list(),
        ]);

        const allSec = (secRes.data ?? []) as Seccion[];
        const sec = allSec.find((x) => x.id === seccionId) ?? null;
        if (!sec) throw new Error("No existe la sección.");
        if (!isPrimario(sec))
          throw new Error("La sección no pertenece a PRIMARIO.");

        const allMat = (matRes.data ?? []) as Materia[];
        const allSm = ((smRes.data ?? []) as SM[]).filter(
          (x) => x.seccionId === seccionId,
        );
        const smIds = new Set(allSm.map((x) => x.id));
        const allAsgRaw = (asgRes.data ?? []) as AsignacionDocenteMateriaDTO[];
        const allAsg: Asignacion[] = allAsgRaw
          .map((a) => {
            const smId =
              (a as any).seccionMateriaId ?? (a as any).seccionMateria?.id ?? null;
            const empId =
              (a as any).empleadoId ??
              (a as any).personalId ??
              (a as any).docenteId ??
              null;
            if (!smId || !empId) return null;
            const hasta = (a as any).vigenciaHasta ?? null;
            return {
              id: a.id,
              seccionMateriaId: smId,
              empleadoId: empId,
              rol: ((a as any).rol ?? "TITULAR") as "TITULAR" | "SUPLENTE",
              vigenciaDesde: ((a as any).vigenciaDesde || "0001-01-01") as string,
              vigenciaHasta: hasta && String(hasta).length ? String(hasta) : null,
            } satisfies Asignacion;
          })
          .filter((a): a is Asignacion => !!a && smIds.has(a.seccionMateriaId));

        const empleados = (empRes.data ?? []) as any[];
        const personaIds = Array.from(
          new Set(empleados.map((e) => e.personaId).filter(Boolean)),
        ) as number[];
        const personaEntries = await Promise.all(
          personaIds.map(async (pid) => {
            try {
              const res = await api.personasCore.getById(pid);
              return [pid, res.data] as const;
            } catch {
              return [pid, null] as const;
            }
          }),
        );
        const personaMap = new Map<number, any>(personaEntries);
        const per: EmpleadoLite[] = empleados.map((emp) => {
          const persona = personaMap.get(emp.personaId ?? 0);
          return {
            id: emp.id,
            nombre: persona?.nombre ?? null,
            apellido: persona?.apellido ?? null,
          };
        });

        if (!alive) return;
        setSeccion(sec);
        setMaterias(allMat);
        setSms(allSm);
        setAsignaciones(allAsg);
        setEmpleados(per);
      } catch (e: any) {
        if (alive) setError(e?.message ?? "No se pudo cargar la información.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [accessStatus, seccionId, refreshKey]);

  if (accessStatus === "admin") {
    return (
      <DashboardLayout>
        <div className="p-6 text-sm">
          403 — El perfil de Administración no tiene acceso a Materias.
        </div>
      </DashboardLayout>
    );
  }

  if (accessStatus === "forbidden") {
    return (
      <DashboardLayout>
        <div className="p-6 text-sm">
          403 — No tenés acceso a esta sección.
        </div>
      </DashboardLayout>
    );
  }

  if (accessStatus === "checking") {
    return (
      <DashboardLayout>
        <div className="p-6">
          <LoadingState label="Verificando acceso a la sección…" />
        </div>
      </DashboardLayout>
    );
  }

  if (accessStatus === "notAssigned") {
    return (
      <DashboardLayout>
        <div className="p-6 text-sm">
          403 — Esta sección no pertenece a tus asignaciones.
        </div>
      </DashboardLayout>
    );
  }

  const titularVigente = (smId: number) =>
    (asignacionesBySm.get(smId) ?? []).find(
      (a) => a.rol === "TITULAR" && vigenteHoy(a),
    );
  const suplenteVigente = (smId: number) =>
    (asignacionesBySm.get(smId) ?? []).find(
      (a) => a.rol === "SUPLENTE" && vigenteHoy(a),
    );

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/materias")}
        >
          Volver
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Materias</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">
                {seccion ? fmtSeccion(seccion) : `Sección #${seccionId}`}
              </Badge>
              {turnoBadgeLabel && (
                <Badge variant="outline">{turnoBadgeLabel}</Badge>
              )}
              {seccion?.periodoEscolarId && (
                <Badge variant="outline">
                  Período {seccion.periodoEscolarId}
                </Badge>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Asignaciones y vigencias
            </p>
          </div>
          <div>
            <Button onClick={() => setOpenAdd(true)}>
              <Plus className="h-4 w-4 mr-1" /> Agregar materia
            </Button>
          </div>
        </div>

        {loading ? (
          <LoadingState label="Cargando materias…" />
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Listado</CardTitle>
              <CardDescription>
                Docente titular y suplente vigentes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sms.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  Sin materias aún.
                </div>
              )}

              {sms.map((sm) => {
                const mat = materiasById.get(sm.materiaId);
                const tit = titularVigente(sm.id);
                const sup = suplenteVigente(sm.id);

                return (
                  <div key={sm.id} className="border rounded p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">
                        {mat?.nombre ?? `Materia #${sm.materiaId}`}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            mat &&
                              setOpenAsignar({
                                sm,
                                materia: mat,
                                ocupados: {
                                  titularId: titularVigente(sm.id)?.empleadoId ?? null,
                                  suplenteId: suplenteVigente(sm.id)?.empleadoId ?? null,
                                },
                              })
                          }
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Asignar docente
                        </Button>
                        {/* Si luego agregás DELETE en /api/secciones-materias, activás esto */}
                        {/* <Button size="sm" variant="destructive" onClick={() => unlink(sm.id)}>Quitar</Button> */}
                      </div>
                    </div>

                    <Separator className="my-2" />

                    <div className="grid gap-2 sm:grid-cols-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Titular</Badge>
                        <span className="truncate">
                          {fmtEmpleado(empleadoById.get(tit?.empleadoId ?? 0))}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Suplente</Badge>
                        <span className="truncate">
                          {fmtEmpleado(empleadoById.get(sup?.empleadoId ?? 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>

      {openAdd && seccion && (
        <AddMateriaToSeccionDialog
          seccion={seccion}
          materias={materias}
          ocupadas={new Set(sms.map((sm) => sm.materiaId))}
          onClose={() => setOpenAdd(false)}
          onCreated={() => setRefreshKey((k) => k + 1)}
        />
      )}

      {openAsignar && (
        <AsignarDocenteMateriaDialog
          seccionMateria={openAsignar.sm}
          materia={openAsignar.materia}
          empleados={empleados /* siempre [] o array */}
          ocupados={openAsignar.ocupados}
          onClose={() => setOpenAsignar(null)}
          onCreated={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </DashboardLayout>
  );
}
