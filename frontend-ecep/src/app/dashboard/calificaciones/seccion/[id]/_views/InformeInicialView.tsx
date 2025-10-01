// app/dashboard/calificaciones/seccion/[id]/_views/InformeInicialView.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { calendario, gestionAcademica } from "@/services/api/modules";
import LoadingState from "@/components/common/LoadingState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TrimestreEstadoBadge } from "@/components/trimestres/TrimestreEstadoBadge";
import {
  TRIMESTRE_ESTADO_LABEL,
  getTrimestreEstado,
  resolveTrimestrePeriodoId,
} from "@/lib/trimestres";
import { toast } from "sonner";
import { useCalendarRefresh } from "@/hooks/useCalendarRefresh";
import { logger } from "@/lib/logger";

const informeInicialLogger = logger.child({
  module: "calificaciones-informe-inicial",
});

const logInformeInicialError = (error: unknown, message?: string) => {
  if (message) {
    informeInicialLogger.error({ err: error }, message);
  } else {
    informeInicialLogger.error({ err: error });
  }
};

export default function InformeInicialView({
  seccionId,
  periodoEscolarId,
}: {
  seccionId: number;
  periodoEscolarId?: number | null;
}) {
  const hoy = new Date().toISOString().slice(0, 10);
  const [trimestres, setTrimestres] = useState<any[]>([]);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [informes, setInformes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const calendarVersion = useCalendarRefresh("trimestres");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [triRes, aluRes, infRes] = await Promise.all([
          calendario.trimestres.list(),
          gestionAcademica.seccionesAlumnos.bySeccionId(seccionId, hoy),
          gestionAcademica.informes.list(),
        ]);
        if (!alive) return;
        const allTrimestres = triRes.data ?? [];
        const filteredTrimestres =
          typeof periodoEscolarId === "number"
            ? allTrimestres.filter(
                (t: any) =>
                  resolveTrimestrePeriodoId(t, undefined) === periodoEscolarId,
              )
            : allTrimestres;
        setTrimestres(filteredTrimestres);
        setAlumnos(aluRes.data ?? []);
        const allowedTrimestreIds = new Set(
          filteredTrimestres
            .map((t: any) => t.id)
            .filter((id: any) => typeof id === "number"),
        );
        const informesFiltrados = (infRes.data ?? []).filter((inf: any) => {
          if (allowedTrimestreIds.size === 0) return true;
          const triId = inf.trimestreId ?? (inf as any)?.trimestre?.id ?? null;
          return typeof triId === "number" && allowedTrimestreIds.has(triId);
        });
        setInformes(informesFiltrados);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [seccionId, hoy, periodoEscolarId, calendarVersion]);

  const byKey = useMemo(() => {
    const m = new Map<string, any>();
    for (const i of informes) m.set(`${i.matriculaId}-${i.trimestreId}`, i);
    return m;
  }, [informes]);

  if (loading) return <LoadingState label="Cargando informes…" />;

  return (
    <div className="space-y-4">
      {alumnos.map((a) => (
        <Card key={a.matriculaId}>
          <CardHeader>
            <CardTitle>
              {a.nombre ?? a.nombreCompleto ?? `Alumno #${a.matriculaId}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            {trimestres
              .slice()
              .sort((x: any, y: any) => (x.orden ?? 0) - (y.orden ?? 0))
              .map((t) => {
                const ex = byKey.get(`${a.matriculaId}-${t.id}`);
                return (
                  <TrimestreInformeTile
                    key={`${a.matriculaId}-${t.id}`}
                    trimestre={t}
                    alumno={a}
                    existing={ex}
                    onUpsert={(obj) =>
                      setInformes((prev) => {
                        // replace or add
                        const idx = prev.findIndex((p) => p.id === obj.id);
                        if (idx >= 0) {
                          const next = prev.slice();
                          next[idx] = obj;
                          return next;
                        }
                        return [...prev, obj];
                      })
                    }
                  />
                );
              })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TrimestreInformeTile({
  trimestre,
  alumno,
  existing,
  onUpsert,
}: {
  trimestre: any;
  alumno: any;
  existing?: any;
  onUpsert: (i: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [desc, setDesc] = useState(existing?.descripcion ?? "");
  const estado = getTrimestreEstado(trimestre);
  const esCerrado = estado === "cerrado";
  const esSoloLectura = estado !== "activo";
  const estadoLabel = TRIMESTRE_ESTADO_LABEL[estado];

  useEffect(() => {
    setDesc(existing?.descripcion ?? "");
  }, [existing?.descripcion]);

  const create = async () => {
    const { data: id } = await gestionAcademica.informes.create({
      trimestreId: trimestre.id,
      matriculaId: alumno.matriculaId,
      descripcion: (desc ?? "").trim(),
    });
    onUpsert({
      id,
      trimestreId: trimestre.id,
      matriculaId: alumno.matriculaId,
      descripcion: (desc ?? "").trim(),
    });
    setOpen(false);
  };

  const update = async () => {
    // Si tu backend NO tiene PUT, esto fallará (405/404). Mostramos aviso.
    try {
      await gestionAcademica.informes.update(existing.id, {
        descripcion: (desc ?? "").trim(),
      });
      onUpsert({ ...existing, descripcion: (desc ?? "").trim() });
      setOpen(false);
    } catch (e: any) {
      logInformeInicialError(e);
      toast.error(
        e?.response?.data?.message ??
          "Tu backend aún no expone UPDATE para informes. Pedilo o habilítalo.",
      );
    }
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Trimestre {trimestre.orden}</CardTitle>
        <TrimestreEstadoBadge
          estado={estado}
          label={estadoLabel}
          className="text-xs text-muted-foreground"
        />
      </CardHeader>
      <CardContent>
        {existing ? (
          <>
            <div className="text-sm whitespace-pre-wrap">
              {existing.descripcion}
            </div>
            {!esSoloLectura && (
              <div className="mt-2">
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      Editar informe
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Editar — {alumno.nombre ?? alumno.nombreCompleto}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <Textarea
                        rows={6}
                        placeholder="Descripción del desarrollo observado…"
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setOpen(false)}
                        >
                          Cancelar
                        </Button>
                        <Button onClick={update}>Guardar</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </>
        ) : (
          <>
            {esSoloLectura ? (
              <div className="text-sm text-muted-foreground">
                {esCerrado
                  ? "Sin informe."
                  : "Trimestre inactivo. Aún no habilitado."}
              </div>
            ) : (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">Cargar informe</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Informe — {alumno.nombre ?? alumno.nombreCompleto}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <Textarea
                      rows={6}
                      placeholder="Descripción del desarrollo observado…"
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={create} disabled={!desc.trim()}>
                        Guardar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
