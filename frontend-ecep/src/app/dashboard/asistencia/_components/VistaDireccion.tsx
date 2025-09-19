"use client";
import { useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAsistenciasData } from "@/hooks/useAsistenciasData";
import { api } from "@/services/api";
import { toast } from "sonner";

function fmt(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function VistaDireccion() {
  const {
    loading,
    trimestres,
    jornadas,
    detalles,
    diasNoHabiles,
    secciones,
    refreshBase,
  } = useAsistenciasData();

  const [mes, setMes] = useState<string>(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
  );
  const [nuevoTrimestre, setNuevoTrimestre] = useState<{
    inicio?: string;
    fin?: string;
  }>({});
  const [modalTri, setModalTri] = useState(false);
  const [modalNoHabil, setModalNoHabil] = useState(false);
  const [togglingTrimestreId, setTogglingTrimestreId] = useState<number | null>(null);
  const [noHabilFecha, setNoHabilFecha] = useState<string>(
    fmt(new Date().toISOString()),
  );

  const [year, month] = mes.split("-").map(Number);
  const start = new Date(year, (month ?? 1) - 1, 1).toISOString();
  const end = new Date(year, month ?? 1, 0).toISOString();

  const diasNoHabilesEnMes = useMemo(
    () =>
      diasNoHabiles.filter((d) => d.fecha >= start && d.fecha <= end).length,
    [diasNoHabiles, start, end],
  );

  const cierreMensual = secciones.map((s) => {
    const jor = jornadas.filter(
      (j) => j.seccionId === s.id && j.fecha >= start && j.fecha <= end,
    );
    const det = detalles.filter((d) => jor.some((j) => j.id === d.jornadaId));
    const total = det.length || 1;
    const pres = det.filter((d) => d.estado === "PRESENTE").length;
    const pct = Math.round((pres / total) * 100);
    return { s, pct, jCount: jor.length };
  });

  const crearTrimestre = async () => {
    try {
      if (!nuevoTrimestre.inicio || !nuevoTrimestre.fin) {
        toast.error("Completá fechas");
        return;
      }
      if (nuevoTrimestre.inicio > nuevoTrimestre.fin) {
        toast.error("La fecha de inicio no puede ser posterior a la de fin");
        return;
      }
      await api.trimestres.create({
        periodoEscolarId: 1,
        orden: (trimestres.length % 3) + 1,
        fechaInicio: nuevoTrimestre.inicio,
        fechaFin: nuevoTrimestre.fin,
      } as any);
      toast.success("Trimestre creado");
      setModalTri(false);
      await refreshBase();
    } catch {
      toast.error("Error");
    }
  };

  const handleToggleTrimestre = async (tri: any) => {
    if (!tri?.id) return;
    try {
      setTogglingTrimestreId(tri.id);
      if (tri.cerrado) {
        await api.trimestres.reabrir(tri.id);
        toast.success("Trimestre reabierto");
      } else {
        await api.trimestres.cerrar(tri.id);
        toast.success("Trimestre cerrado");
      }
      await refreshBase();
    } catch {
      toast.error("No se pudo actualizar el estado del trimestre");
    } finally {
      setTogglingTrimestreId(null);
    }
  };

  const crearNoHabil = async () => {
    try {
      await api.diasNoHabiles.create({
        fecha: noHabilFecha,
        motivo: "No hábil",
      });
      toast.success("Día no hábil creado");
      setModalNoHabil(false);
      await refreshBase();
    } catch {
      toast.error("Error");
    }
  };

  if (loading) return <p className="p-4">Cargando…</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Períodos</CardTitle>
          <CardDescription>Trimestres escolares</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-3">
            <div className="text-sm">Total: {trimestres.length}</div>
            <Button onClick={() => setModalTri(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Trimestre
            </Button>
          </div>
          <div className="space-y-2">
            {trimestres
              .sort((a, b) =>
                (a.fechaInicio ?? "").localeCompare(b.fechaInicio ?? ""),
              )
              .map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between border rounded p-2"
                >
                  <div className="text-sm">
                    <span className="font-medium">Trimestre {t.orden}</span>{" "}
                    <span className="text-gray-600">
                      ({fmt(t.fechaInicio)} — {fmt(t.fechaFin)})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={t.cerrado ? "destructive" : "default"}>
                      {t.cerrado ? "Cerrado" : "Abierto"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleTrimestre(t)}
                      disabled={togglingTrimestreId === t.id}
                    >
                      {t.cerrado ? "Reabrir" : "Cerrar"}
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cierres mensuales</CardTitle>
          <CardDescription>Consolidado {mes}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Label>Mes</Label>
            <Input
              type="month"
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="w-48"
            />
          </div>
          <div className="space-y-2">
            {cierreMensual.map(({ s, pct, jCount }) => (
              <div
                key={s.id}
                className="flex items-center justify-between border rounded p-2"
              >
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">
                    {s.gradoSala} {s.division}
                  </div>
                  <div className="text-xs text-gray-600">
                    Jornadas: {jCount} — Días no hábiles: {diasNoHabilesEnMes}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm">{pct}%</div>
                  <Progress value={pct} className="w-40 h-2" />
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Días no hábiles</CardTitle>
          <CardDescription>Declaración</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-3">
            <Button onClick={() => setModalNoHabil(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo día no hábil
            </Button>
          </div>
          <div className="text-sm text-gray-600">Listado en construcción…</div>
        </CardContent>
      </Card>

      {/* Nuevo Trimestre */}
      <Dialog open={modalTri} onOpenChange={setModalTri}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Trimestre</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Inicio</Label>
              <Input
                type="date"
                value={nuevoTrimestre.inicio ?? ""}
                onChange={(e) =>
                  setNuevoTrimestre((s) => ({ ...s, inicio: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Fin</Label>
              <Input
                type="date"
                value={nuevoTrimestre.fin ?? ""}
                onChange={(e) =>
                  setNuevoTrimestre((s) => ({ ...s, fin: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalTri(false)}>
              Cancelar
            </Button>
            <Button onClick={crearTrimestre}>Aceptar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nuevo No Hábil */}
      <Dialog open={modalNoHabil} onOpenChange={setModalNoHabil}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo día no hábil</DialogTitle>
          </DialogHeader>
          <div>
            <Label>Fecha</Label>
            <Input
              type="date"
              value={noHabilFecha}
              onChange={(e) => setNoHabilFecha(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalNoHabil(false)}>
              Cancelar
            </Button>
            <Button onClick={crearNoHabil}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
