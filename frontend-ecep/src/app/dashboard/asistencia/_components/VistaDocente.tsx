"use client";
import { useEffect, useMemo, useState } from "react";
import LoadingState from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Plus, Eye } from "lucide-react";
import { useAsistenciasData } from "@/hooks/useAsistenciasData";
import { useAuth } from "@/hooks/useAuth";
import NuevaAsistenciaDialog from "./NuevaAsistenciaDialog";
import DetalleDiaDialog from "./DetalleDiaDialog";
import type { JornadaAsistenciaDTO, SeccionDTO } from "@/types/api-generated";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getTrimestreEstado,
  isFechaDentroDeTrimestre,
} from "@/lib/trimestres";
import { logger } from "@/lib/logger";

const DBG = !!process.env.NEXT_PUBLIC_DEBUG;
const vistaLogger = logger.child({ module: "VistaDocente" });

const dlog = (...args: any[]) => {
  if (!DBG) return;
  if (!args.length) return;

  const [first, ...rest] = args;

  if (typeof first === "string") {
    if (!rest.length) {
      vistaLogger.debug(first);
      return;
    }

    if (rest.length === 1 && typeof rest[0] === "object") {
      vistaLogger.debug(rest[0] as Record<string, unknown>, first);
      return;
    }

    vistaLogger.debug({ details: rest }, first);
    return;
  }

  vistaLogger.debug({ details: args }, "VistaDocente log");
};

const dgrp = (title: string) => {
  if (!DBG) return;
  vistaLogger.debug({ group: title, phase: "start" }, title);
};

const dgrpEnd = () => {
  if (!DBG) return;
  vistaLogger.debug({ phase: "end" }, "VistaDocente group end");
};

function fmt(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function VistaDocente() {
  const { user } = useAuth();
  const docenteId = user?.personaId ?? 0;

  const {
    loading,
    trimestres,
    secciones,
    asignaciones,
    searchJornadas,
    loadDetallesByJornada,
    loadAlumnosSeccion,
  } = useAsistenciasData();

  // ===== DEBUG: primer snapshot al montar / al cambiar dependencias =====
  useEffect(() => {
    dgrp("snapshot inicial");
    dlog("user", user);
    dlog("docenteId (personaId)", docenteId);
    dlog("trimestres", trimestres);
    dlog("secciones", secciones);
    dlog("asignaciones", asignaciones);
    dgrpEnd();
  }, [user, docenteId, trimestres, secciones, asignaciones]);

  const seccionesDocente: SeccionDTO[] = useMemo(() => {
    const setIds = new Set(
      asignaciones
        .filter((a) => a.docenteId === docenteId)
        .map((a) => a.seccionId),
    );
    const res = secciones.filter((s) => setIds.has(s.id));

    dgrp("calculo seccionesDocente");
    dlog("docenteId", docenteId);
    dlog(
      "asignaciones filtradas",
      asignaciones.filter((a) => a.docenteId === docenteId),
    );
    dlog("ids seccion asignadas", Array.from(setIds));
    dlog("seccionesDocente result", res);
    dgrpEnd();

    return res;
  }, [asignaciones, secciones, docenteId]);

  const trimestreHoy = useMemo(() => {
    const nowIso = new Date().toISOString();
    const nowKey = fmt(nowIso);

    const t =
      trimestres.find(
        (tr) =>
          getTrimestreEstado(tr) === "activo" &&
          isFechaDentroDeTrimestre(nowKey, tr),
      ) ?? null;

    dgrp("calculo trimestreHoy");
    dlog("nowKey", nowKey);
    dlog("trimestre elegido", t);
    dgrpEnd();

    return t;
  }, [trimestres]);

  const [openNuevaFor, setOpenNuevaFor] = useState<number | null>(null);
  const [selected, setSelected] = useState<{
    jornada: JornadaAsistenciaDTO;
    seccionId: number;
  } | null>(null);
  const [historial, setHistorial] = useState<
    Record<number, JornadaAsistenciaDTO[]>
  >({}); // seccionId -> jornadas

  const openHistorial = async (seccionId: number) => {
    dgrp("openHistorial()");
    dlog("params", { seccionId });

    try {
      const js = await searchJornadas({ seccionId });
      dlog("searchJornadas() response", js);

      setHistorial((h) => {
        const sorted = js.sort((a, b) =>
          (b.fecha ?? "").localeCompare(a.fecha ?? ""),
        );
        const next = { ...h, [seccionId]: sorted };
        dlog("historial(new state)[seccionId]", next[seccionId]);
        return next;
      });
    } catch (err) {
      vistaLogger.error({ err }, "openHistorial error");
    } finally {
      dgrpEnd();
    }
  };

  if (loading) return <LoadingState label="Cargando información…" />;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {seccionesDocente.map((sec) => {
          const jornadasSec = historial[sec.id] ?? [];
          const promedio = 100; // placeholder si no abriste historial

          return (
            <Card key={sec.id} className="transition-colors hover:border-primary">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {sec.gradoSala} {sec.division}
                  </CardTitle>
                </div>
                <CardDescription>
                  Promedio aprox: {promedio}% — Última:{" "}
                  {jornadasSec[0]?.fecha ? fmt(jornadasSec[0].fecha) : "—"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Asistencia Promedio</span>
                    <span>{promedio}%</span>
                  </div>
                  <Progress value={promedio} className="h-2" />
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    disabled={!trimestreHoy}
                    onClick={() => {
                      dlog("click Nueva Asistencia", {
                        seccionId: sec.id,
                        trimestreHoy,
                      });
                      setOpenNuevaFor(sec.id);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Asistencia
                  </Button>

                  <Dialog onOpenChange={(o) => o && openHistorial(sec.id)}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Historial
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          Historial — {sec.gradoSala} {sec.division}
                        </DialogTitle>
                        <DialogDescription>
                          Asistencias diarias
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2">
                        {(historial[sec.id] ?? []).map((j) => (
                          <div
                            key={j.id}
                            className="flex items-center justify-between border rounded p-2"
                          >
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">{fmt(j.fecha)}</Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  dgrp("Ver/Editar día");
                                  dlog("jornada", j);
                                  try {
                                    await loadDetallesByJornada(j.id);
                                    setSelected({
                                      jornada: j,
                                      seccionId: sec.id,
                                    });
                                  } catch (e) {
                                    vistaLogger.error(
                                      { err: e, jornadaId: j.id },
                                      "loadDetallesByJornada error",
                                    );
                                  } finally {
                                    dgrpEnd();
                                  }
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" /> Ver / Editar
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {openNuevaFor === sec.id && (
                  <NuevaAsistenciaDialog
                    open
                    onOpenChange={(v) => setOpenNuevaFor(v ? sec.id : null)}
                    seccion={sec}
                    trimestre={trimestreHoy}
                    alumnos={[]}
                    onCreated={() => {
                      dlog("Nueva asistencia creada → refresco historial", {
                        seccionId: sec.id,
                      });
                      openHistorial(sec.id);
                    }}
                    // (opcional) ejemplo de carga de alumnos con logging
                    loadAlumnos={async () => {
                      try {
                        const rows = await loadAlumnosSeccion(sec.id);
                        dlog("alumnos de la sección", {
                          seccionId: sec.id,
                          rows,
                        });
                        return rows;
                      } catch (e) {
                        vistaLogger.error(
                          { err: e, seccionId: sec.id },
                          "loadAlumnosSeccion error",
                        );
                        return [];
                      }
                    }}
                  />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selected && (
        <DetalleDiaDialog
          open
          onOpenChange={() => setSelected(null)}
          jornada={selected.jornada}
          detalles={[]}
          alumnos={[]}
          editable={true}
          onUpdated={() => {
            dlog("Detalles actualizados → refresco historial", {
              seccionId: selected.seccionId,
            });
            openHistorial(selected.seccionId);
          }}
        />
      )}
    </>
  );
}
