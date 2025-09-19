// app/dashboard/calificaciones/seccion/[id]/_views/InformeInicialView.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
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
import { Badge } from "@/components/ui/badge";
import {
  TRIMESTRE_ESTADO_BADGE_VARIANT,
  TRIMESTRE_ESTADO_LABEL,
  getTrimestreEstado,
} from "@/lib/trimestres";
import { toast } from "sonner";

export default function InformeInicialView({
  seccionId,
}: {
  seccionId: number;
}) {
  const hoy = new Date().toISOString().slice(0, 10);
  const [trimestres, setTrimestres] = useState<any[]>([]);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [informes, setInformes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [triRes, aluRes, infRes] = await Promise.all([
          api.trimestres.list(),
          api.seccionesAlumnos.bySeccionId(seccionId, hoy),
          api.informes.list(),
        ]);
        if (!alive) return;
        setTrimestres(triRes.data ?? []);
        setAlumnos(aluRes.data ?? []);
        setInformes(infRes.data ?? []);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [seccionId, hoy]);

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
  const estadoBadgeVariant =
    TRIMESTRE_ESTADO_BADGE_VARIANT[estado] ?? "secondary";
  const estadoLabel = TRIMESTRE_ESTADO_LABEL[estado];

  useEffect(() => {
    setDesc(existing?.descripcion ?? "");
  }, [existing?.descripcion]);

  const create = async () => {
    const { data: id } = await api.informes.create({
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
      await api.informes.update(existing.id, {
        descripcion: (desc ?? "").trim(),
      });
      onUpsert({ ...existing, descripcion: (desc ?? "").trim() });
      setOpen(false);
    } catch (e: any) {
      console.error(e);
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
        <Badge variant={estadoBadgeVariant}>{estadoLabel}</Badge>
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
