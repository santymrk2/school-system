"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/app/dashboard/dashboard-layout";
import LoadingState from "@/components/common/LoadingState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Megaphone, Trash2, Eye } from "lucide-react";
import { comunicacion, gestionAcademica } from "@/services/api/modules";
import { useViewerScope } from "@/hooks/scope/useViewerScope";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";
import { useScopedSecciones } from "@/hooks/scope/useScopedSecciones";
import { useFamilyAlumnos } from "@/hooks/useFamilyAlumnos";
import NewComunicadoDialog from "./_components/NewComunicadoDialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserRole } from "@/types/api-generated";

const alcanceFilterOptions = [
  { value: "ALL", label: "Todos los alcances" },
  { value: "INSTITUCIONAL", label: "Institucional" },
  { value: "POR_NIVEL", label: "Por nivel" },
  { value: "POR_SECCION", label: "Por sección" },
] as const;

type AlcanceFilter = (typeof alcanceFilterOptions)[number]["value"];

type ComunicadoDTO = {
  id: number;
  alcance: "INSTITUCIONAL" | "POR_NIVEL" | "POR_SECCION";
  seccionId?: number | null;
  nivel?: "INICIAL" | "PRIMARIO" | null;
  titulo: string;
  cuerpo: string;
  publicado: boolean; // lo ignoramos visualmente
  fechaCreacion?: string | null;
  fechaPublicacion?: string | null;
};

type SeccionLite = {
  id: number;
  nombre?: string | null;
  gradoSala?: string | null;
  division?: string | null;
  turno?: string | null;
  nivel?: string | null; // "INICIAL" | "PRIMARIO"
};

function nivelEnumFromSeccion(s: any): "INICIAL" | "PRIMARIO" {
  const n = (
    s?.nivel ??
    s?.seccionActual?.nivel ??
    s?.seccion?.nivel ??
    ""
  )
    .toString()
    .toUpperCase();
  return n === "PRIMARIO" ? "PRIMARIO" : "INICIAL";
}

function seccionIdFrom(item: any): number | null {
  if (!item) return null;
  if (typeof item.seccionId === "number") return item.seccionId;
  if (typeof item.seccionId === "string") return Number(item.seccionId);
  if (typeof item?.seccionActual?.id === "number") return item.seccionActual.id;
  if (typeof item?.seccion?.id === "number") return item.seccion.id;
  if (typeof item?.seccionId?.id === "number") return item.seccionId.id;
  return null;
}

const dateTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
});

function formatDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return dateTimeFormatter.format(date);
}

function fechaVisible(c: ComunicadoDTO): string | null {
  return c.fechaCreacion ?? c.fechaPublicacion ?? c.fechaProgPublicacion ?? null;
}

function preview(text: string, max = 220) {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : clean.slice(0, max) + "…";
}

export default function ComunicadosPage() {
  const { type, activeRole } = useViewerScope();
  const role = activeRole ?? null;

  const isDirector = role === UserRole.DIRECTOR;
  const isAdmin = role === UserRole.ADMIN;
  const isSecret = role === UserRole.SECRETARY;
  const isCoordinator = role === UserRole.COORDINATOR;
  const isTeacher =
    role === UserRole.TEACHER || role === UserRole.ALTERNATE;
  const isAdminLike = isDirector || isAdmin || isSecret || isCoordinator;
  const canCreate = isAdminLike || isTeacher;

  const { periodoEscolarId } = useActivePeriod();
  const { secciones } = useScopedSecciones({
    periodoEscolarId: periodoEscolarId ?? undefined,
  });
  const { alumnos: hijos } = useFamilyAlumnos();

  const [loading, setLoading] = useState(true);
  const [comunicados, setComunicados] = useState<ComunicadoDTO[]>([]);
  const [q, setQ] = useState("");
  const [alcanceFilter, setAlcanceFilter] = useState<AlcanceFilter>("ALL");

  // nombres de sección
  const [allSecciones, setAllSecciones] = useState<SeccionLite[]>([]);
  const seccionNameById = useMemo(() => {
    const m = new Map<number, string>();
    for (const s of allSecciones) {
      const label =
        `${s.gradoSala ?? ""} ${s.division ?? ""}`.trim() ||
        s.nombre ||
        `Sección #${s.id}`;
      m.set(s.id, `${label}${s.turno ? ` (${s.turno})` : ""}`);
    }
    return m;
  }, [allSecciones]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [res, secs] = await Promise.all([
          comunicacion.comunicados.list(),
          gestionAcademica.secciones.list(),
        ]);
        if (!alive) return;
        setComunicados(res.data ?? []);
        setAllSecciones(secs.data ?? []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // destinos del usuario
  const misSeccionesIds = useMemo(() => {
    if (type === "teacher")
      return new Set<number>(
        secciones
          .map((s: any) => Number(seccionIdFrom(s) ?? s?.id))
          .filter((id): id is number => Number.isFinite(id)),
      );
    if (type === "family" || type === "student") {
      const ids = (hijos ?? [])
        .map((h: any) => seccionIdFrom(h) ?? seccionIdFrom(h?.seccionActual))
        .filter((id): id is number => typeof id === "number" && !Number.isNaN(id));
      return new Set<number>(ids);
    }
    return new Set<number>();
  }, [type, secciones, hijos]);

  const misNiveles = useMemo(() => {
    const niveles: Array<"INICIAL" | "PRIMARIO"> = [];
    if (type === "teacher") {
      for (const s of secciones) niveles.push(nivelEnumFromSeccion(s));
    } else if (type === "family" || type === "student") {
      for (const h of hijos ?? []) niveles.push(nivelEnumFromSeccion(h));
    }
    return new Set<string>(niveles);
  }, [type, secciones, hijos]);

  const baseVisibles = useMemo(() => {
    const todos = comunicados ?? [];
    if (type === "staff" || isAdminLike) return todos;
    return todos.filter((c) => {
      if (c.alcance === "INSTITUCIONAL") return true;
      if (c.alcance === "POR_NIVEL")
        return !!c.nivel && misNiveles.has(c.nivel);
      if (c.alcance === "POR_SECCION") {
        const id = c.seccionId;
        return typeof id === "number" && misSeccionesIds.has(id);
      }
      return false;
    });
  }, [comunicados, type, isAdminLike, misNiveles, misSeccionesIds]);

  const visibles = useMemo(() => {
    if (alcanceFilter === "ALL") return baseVisibles;
    return baseVisibles.filter((c) => c.alcance === alcanceFilter);
  }, [baseVisibles, alcanceFilter]);

  // búsqueda
  const lista = useMemo(() => {
    const base = visibles;
    const term = q.trim().toLowerCase();
    const filtered = !term
      ? base
      : base.filter(
          (c) =>
            (c.titulo ?? "").toLowerCase().includes(term) ||
            (c.cuerpo ?? "").toLowerCase().includes(term) ||
            (c.alcance ?? "").toLowerCase().includes(term) ||
            String(c.seccionId ?? "").includes(term) ||
            String(c.nivel ?? "")
              .toLowerCase()
              .includes(term),
        );
    return filtered;
  }, [visibles, q]);

  const refresh = async () => {
    const res = await comunicacion.comunicados.list();
    setComunicados(res.data ?? []);
  };

  const mySeccionIds = useMemo(
    () => new Set<number>(secciones.map((s: any) => s.id)),
    [secciones],
  );

  function canDeleteCom(c: ComunicadoDTO): boolean {
    if (isAdminLike) return true;
    if (isTeacher && c.alcance === "POR_SECCION" && c.seccionId) {
      return mySeccionIds.has(c.seccionId);
    }
    return false;
  }

  async function handleDelete(id: number) {
    try {
      await comunicacion.comunicados.delete(id);
      await refresh();
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ??
          e?.message ??
          "No se pudo eliminar el comunicado",
      );
    }
  }

  // diálogo de detalle
  const [selected, setSelected] = useState<ComunicadoDTO | null>(null);
  const selectedFecha = selected ? fechaVisible(selected) : null;

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Comunicados</h2>
            <div className="text-sm text-muted-foreground">
              Avisos institucionales y dirigidos a tus niveles/secciones
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canCreate && <NewComunicadoDialog asButton onCreated={refresh} />}
          </div>
        </div>

        {/* Buscador */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="w-full md:max-w-sm">
            <Input
              placeholder="Buscar comunicado…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="w-full md:w-auto md:max-w-xs">
            <Select
              value={alcanceFilter}
              onValueChange={(v) => setAlcanceFilter(v as AlcanceFilter)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por alcance" />
              </SelectTrigger>
              <SelectContent>
                {alcanceFilterOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Feed */}
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <LoadingState label="Cargando comunicados…" />
            </CardContent>
          </Card>
        ) : (
          <FeedList
            items={lista}
            seccionNameById={seccionNameById}
            canDelete={canDeleteCom}
            onDelete={handleDelete}
            onOpen={(c) => setSelected(c)}
          />
        )}

        {/* Dialog detalle */}
        <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
          <DialogContent className="max-w-3xl">
            {selected && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    {selected.titulo}
                  </DialogTitle>
                  {/* ⚠️ NO usar DialogDescription aquí: renderiza <p> */}
                  <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2 mt-1">
                    <TipoBadge c={selected} seccionNameById={seccionNameById} />
                    {selectedFecha && (
                      <span className="whitespace-nowrap">
                        Publicado: {formatDateTime(selectedFecha)}
                      </span>
                    )}
                  </div>
                </DialogHeader>

                <div className="whitespace-pre-wrap text-base leading-relaxed">
                  {selected.cuerpo}
                </div>

                {canDeleteCom(selected) && (
                  <div className="flex justify-end">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            ¿Eliminar comunicado?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción lo ocultará para todos (borrado lógico).
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async () => {
                              await handleDelete(selected.id);
                              setSelected(null);
                            }}
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function FeedList({
  items,
  seccionNameById,
  canDelete,
  onDelete,
  onOpen,
}: {
  items: ComunicadoDTO[];
  seccionNameById: Map<number, string>;
  canDelete: (c: ComunicadoDTO) => boolean;
  onDelete: (id: number) => void;
  onOpen: (c: ComunicadoDTO) => void;
}) {
  if (!items.length) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          No hay comunicados para mostrar.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((c) => {
        const fecha = fechaVisible(c);
        return (
          <Card key={c.id} className="hover:shadow-sm transition">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{c.titulo}</CardTitle>

                  {/* ⚠️ No usar CardDescription para divs */}
                <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                  <TipoBadge c={c} seccionNameById={seccionNameById} />
                  {fecha && (
                    <span className="whitespace-nowrap">
                      Publicado: {formatDateTime(fecha)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={() => onOpen(c)}>
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>

                {canDelete(c) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" title="Eliminar">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          ¿Eliminar comunicado?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción lo ocultará para todos (borrado lógico).
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(c.id)}>
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
            </CardHeader>

            <CardContent>
              {/* previsualización del cuerpo en <div>, NO en <p> */}
              <div className="text-sm text-muted-foreground">
                {preview(c.cuerpo)}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function TipoBadge({
  c,
  seccionNameById,
}: {
  c: ComunicadoDTO;
  seccionNameById: Map<number, string>;
}) {
  if (c.alcance === "INSTITUCIONAL")
    return (
      <Badge variant="default">
        <Megaphone className="h-3 w-3 mr-1" />
        Institucional
      </Badge>
    );
  if (c.alcance === "POR_NIVEL")
    return <Badge variant="secondary">Nivel {c.nivel}</Badge>;
  const name = c.seccionId
    ? (seccionNameById.get(c.seccionId) ?? `Sección ${c.seccionId}`)
    : "Sección";
  return <Badge variant="outline">{name}</Badge>;
}
