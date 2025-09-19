"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/dashboard/dashboard-layout";
import { api } from "@/services/api";
import type {
  SeccionDTO,
  TrimestreDTO,
  MateriaDTO,
  SeccionMateriaDTO,
  EvaluacionDTO,
} from "@/types/api-generated";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";
import { ActiveTrimestreBadge } from "@/app/dashboard/_components/ActiveTrimestreBadge";
import { getTrimestreEstado } from "@/lib/trimestres";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Edit, Plus, ArrowLeft, School, Clock3 } from "lucide-react";
import NotasExamenDialog from "@/app/dashboard/evaluaciones/_components/NotasExamenDialog";

const fechaFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
});

function formatFecha(fecha?: string | null) {
  if (!fecha) return "Sin fecha";
  const date = new Date(fecha);
  if (Number.isNaN(date.getTime())) return fecha;
  return fechaFormatter.format(date);
}

export default function SeccionEvaluacionesPage() {
  const { id } = useParams<{ id: string }>();
  const seccionId = Number(id);
  const router = useRouter();
  const { getTrimestreByDate } = useActivePeriod();

  // Data
  const [loading, setLoading] = useState(true);
  const [seccion, setSeccion] = useState<SeccionDTO | null>(null);
  const [materias, setMaterias] = useState<MateriaDTO[]>([]);
  const [secMats, setSecMats] = useState<SeccionMateriaDTO[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionDTO[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // UI
  const [filterMateriaId, setFilterMateriaId] = useState<string>("all");
  const [error, setError] = useState<string | null>(null);

  // Nuevo examen
  const [openNew, setOpenNew] = useState(false);
  const todayISO = useMemo(
    () => new Date().toISOString().slice(0, 10),
    [],
  );
  const currentYear = useMemo(() => Number(todayISO.slice(0, 4)), [todayISO]);
  const minDate = `${currentYear}-01-01`;
  const maxDate = `${currentYear}-12-31`;
  const [fecha, setFecha] = useState<string>(todayISO);
  const [tema, setTema] = useState("");
  const [detalle, setDetalle] = useState("");
  const [creating, setCreating] = useState(false);
  const [newMateriaId, setNewMateriaId] = useState<string>("");

  // Notas
  const [openNotas, setOpenNotas] = useState(false);
  const [selEval, setSelEval] = useState<EvaluacionDTO | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        let sec: SeccionDTO | null = null;
        try {
          sec = (await api.secciones.byId?.(seccionId))?.data ?? null;
        } catch {
          const list = (await api.secciones.list()).data ?? [];
          sec = list.find((s) => s.id === seccionId) ?? null;
        }
        if (!sec) throw new Error("No se encontró la sección solicitada.");

        const [mats, smsAll] = await Promise.all([
          api.materias.list().then((r) => r.data ?? []),
          api.seccionMaterias.list().then((r) => r.data ?? []),
        ]);

        const smsSeccion = (smsAll as SeccionMateriaDTO[]).filter(
          (x: any) => x.seccionId === seccionId,
        );
        const smIds = smsSeccion.map((x) => x.id);

        const evs = (await api.evaluaciones.search({ seccionId })).data ?? [];

        if (!alive) return;
        setSeccion(sec);
        setMaterias(mats);
        setSecMats(smsSeccion);
        setEvaluaciones(evs);

        if (filterMateriaId !== "all") {
          const wanted = Number(filterMateriaId);
          if (
            Number.isNaN(wanted) ||
            !smsSeccion.some((sm: any) => sm.materiaId === wanted)
          ) {
            setFilterMateriaId("all");
          }
        }
      } catch (e: any) {
        if (alive)
          setError(
            e?.response?.data?.message ??
              e?.message ??
              "No se pudieron cargar las evaluaciones.",
          );
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [seccionId, filterMateriaId, refreshKey]);

  const materiaNombreById = useMemo(() => {
    const m = new Map<number, string>();
    for (const it of materias) m.set(it.id, it.nombre);
    return m;
  }, [materias]);

  const materiasDeSeccion = useMemo(() => {
    const ids = new Set(
      (secMats ?? []).map((sm) => (sm as any).materiaId as number),
    );
    return materias.filter((m) => ids.has(m.id));
  }, [secMats, materias]);

  const seccionNombre = useMemo(() => {
    if (!seccion) return `Sección #${seccionId}`;
    const nombre = `${seccion.gradoSala ?? ""} ${seccion.division ?? ""}`.trim();
    return nombre || `Sección #${seccion.id}`;
  }, [seccion, seccionId]);

  const turnoNombre = useMemo(() => seccion?.turno ?? "—", [seccion]);

  const filteredEvals = useMemo(() => {
    if (filterMateriaId === "all") return evaluaciones;
    const wanted = Number(filterMateriaId);
    if (Number.isNaN(wanted)) return evaluaciones;
    return evaluaciones.filter((e: any) => {
      const sm = (secMats ?? []).find((x) => x.id === e.seccionMateriaId) as any;
      return sm?.materiaId === wanted;
    });
  }, [evaluaciones, filterMateriaId, secMats]);

  const createExamen = async () => {
    try {
      setCreating(true);

      // Resolver trimestre por fecha
      const tri = getTrimestreByDate(fecha);
      if (!tri) {
        alert("La fecha seleccionada no coincide con un trimestre configurado.");
        return;
      }
      if (getTrimestreEstado(tri) === "cerrado") {
        alert("La fecha seleccionada cae en un trimestre cerrado.");
        return;
      }

      const year = Number(fecha.slice(0, 4));
      if (Number.isNaN(year) || year !== currentYear) {
        alert(`La fecha debe pertenecer al año ${currentYear}.`);
        return;
      }

      // Resolver seccionMateriaId de la materia seleccionada
      const materiaIdNum =
        newMateriaId && newMateriaId !== "all" ? Number(newMateriaId) : NaN;
      if (!materiaIdNum || Number.isNaN(materiaIdNum)) {
        alert("Seleccioná una materia.");
        return;
      }
      const sm = (secMats ?? []).find(
        (x: any) => x.seccionId === seccionId && x.materiaId === materiaIdNum,
      );
      if (!sm) {
        alert("No se encontró la materia para esta sección.");
        return;
      }

      const temaBase = tema.trim() || "Evaluación";
      const detalleTrim = detalle.trim();
      const temaCompleto = detalleTrim
        ? `${temaBase} — ${detalleTrim}`
        : temaBase;

      const body = {
        seccionMateriaId: (sm as any).id,
        trimestreId: tri.id,
        fecha,
        tema: temaCompleto,
      } as any;

      await api.evaluaciones.create(body);
      setOpenNew(false);
      setTema("");
      setDetalle("");
      setNewMateriaId("");
      setRefreshKey((k) => k + 1);
    } catch (e: any) {
      alert(
        e?.response?.data?.message ??
          e?.message ??
          "No se pudo registrar el examen.",
      );
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 text-sm">Cargando…</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Evaluaciones</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="flex items-center gap-1">
                <School className="h-3 w-3" /> {seccionNombre}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock3 className="h-3 w-3" /> Turno {turnoNombre}
              </Badge>
              <Badge variant="outline">
                {evaluaciones.length}{" "}
                {evaluaciones.length === 1 ? "examen" : "exámenes"}
              </Badge>
            </div>
            <ActiveTrimestreBadge className="mt-2" />
          </div>
          <div className="flex items-center gap-2">
            {/* Filtro materia */}
            {materiasDeSeccion.length > 0 && (
              <Select
                value={filterMateriaId}
                onValueChange={(v) => setFilterMateriaId(v)}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Filtrar por materia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las materias</SelectItem>
                  {materiasDeSeccion.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Nuevo examen */}
            <Dialog
              open={openNew}
              onOpenChange={(o) => {
                setOpenNew(o);
                if (o)
                  setNewMateriaId(
                    filterMateriaId !== "all"
                      ? filterMateriaId
                      : materiasDeSeccion.length > 0
                      ? String(materiasDeSeccion[0].id)
                      : "",
                  );
                if (o) {
                  setTema("");
                  setDetalle("");
                  setFecha(todayISO);
                }
              }}
            >
              <DialogTrigger asChild>
                <Button disabled={materiasDeSeccion.length === 0}>
                  <Plus className="h-4 w-4 mr-1" /> Nuevo examen
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nuevo examen</DialogTitle>
                  <DialogDescription>
                    Solo podés agendar evaluaciones dentro del año en curso.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3">
                  <div className="grid gap-2">
                    <label className="text-sm">Materia</label>
                    <Select
                      value={newMateriaId}
                      onValueChange={setNewMateriaId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccioná materia" />
                      </SelectTrigger>
                      <SelectContent>
                        {materiasDeSeccion.map((m) => (
                          <SelectItem key={m.id} value={String(m.id)}>
                            {m.nombre}
                          </SelectItem>
                        ))}
                        {materiasDeSeccion.length === 0 && (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            Esta sección todavía no tiene materias asignadas.
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm mb-1 block">Fecha</label>
                    <Input
                      type="date"
                      value={fecha}
                      min={minDate}
                      max={maxDate}
                      onChange={(e) => {
                        const next = e.target.value;
                        if (!next) {
                          setFecha(minDate);
                          return;
                        }
                        const yearValue = Number(next.slice(0, 4));
                        if (Number.isNaN(yearValue) || yearValue !== currentYear) {
                          setFecha(yearValue < currentYear ? minDate : maxDate);
                          return;
                        }
                        if (next < minDate) {
                          setFecha(minDate);
                          return;
                        }
                        if (next > maxDate) {
                          setFecha(maxDate);
                          return;
                        }
                        setFecha(next);
                      }}
                    />
                  </div>

                  <div>
                    <label className="text-sm mb-1 block">Tema</label>
                    <Input
                      value={tema}
                      onChange={(e) => setTema(e.target.value)}
                      placeholder="Ej.: Evaluación de fracciones"
                    />
                  </div>
                  <div>
                    <label className="text-sm mb-1 block">Detalle (opcional)</label>
                    <Textarea
                      value={detalle}
                      onChange={(e) => setDetalle(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpenNew(false)}>
                      Cancelar
                    </Button>
                    <Button
                      onClick={createExamen}
                      disabled={
                        creating ||
                        !newMateriaId ||
                        newMateriaId === "all" ||
                        materiasDeSeccion.length === 0
                      }
                    >
                      {creating ? "Creando…" : "Crear"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/evaluaciones")}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Volver
            </Button>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}

        {!error && (
          <>
            {filteredEvals.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No hay exámenes para el filtro seleccionado.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEvals.map((e) => {
                  const sm = (secMats ?? []).find(
                    (x) => x.id === (e as any).seccionMateriaId,
                  ) as any;
                  const matNom = sm
                    ? materiaNombreById.get(sm.materiaId)
                    : undefined;
                  const fechaLegible = formatFecha((e as any).fecha);
                  const tema = (e as any).tema ?? "Evaluación";
                  const triLabel = (e as any).trimestreId
                    ? `Trimestre ${(e as any).trimestreId}`
                    : "Trimestre sin asignar";
                  return (
                    <div
                      key={e.id}
                      className="space-y-3 rounded-lg border p-3 transition-colors hover:border-primary/50"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-1">
                          <div className="text-base font-medium text-foreground">
                            {tema}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            {matNom && <Badge variant="outline">{matNom}</Badge>}
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {fechaLegible}
                            </span>
                            <Badge variant="secondary">{triLabel}</Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              router.push(
                                `/dashboard/evaluaciones/examenes/${e.id}`,
                              )
                            }
                          >
                            Ver examen
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelEval(e);
                              setOpenNotas(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Notas
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {selEval && (
          <NotasExamenDialog
            open={openNotas}
            onOpenChange={(v) => {
              setOpenNotas(v);
              if (!v) setSelEval(null);
            }}
            evaluacion={selEval}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
