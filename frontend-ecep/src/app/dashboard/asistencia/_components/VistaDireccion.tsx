"use client";
import { useMemo, useState } from "react";
import LoadingState from "@/components/common/LoadingState";
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
import { calendario } from "@/services/api/modules";
import { triggerCalendarRefresh } from "@/hooks/useCalendarRefresh";
import { toast } from "sonner";
import { getTrimestreEstado, TRIMESTRE_ESTADO_LABEL } from "@/lib/trimestres";
import { TrimestreEstadoBadge } from "@/components/trimestres/TrimestreEstadoBadge";
import {
  buildPdfHtml,
  downloadPdfWithHtmlDocs,
  escapeHtml,
  suggestPdfFileName,
} from "@/lib/pdf";

function fmt(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatMonthYearLabel(value: string) {
  if (!value) return value;
  const [yearPart, monthPart] = value.split("-");
  const year = Number(yearPart);
  const monthIndex = Number(monthPart) - 1;
  if (Number.isNaN(year) || Number.isNaN(monthIndex)) return value;
  const label = new Date(year, monthIndex).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
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
    periodoEscolarId,
  } = useAsistenciasData();

  const [mes, setMes] = useState<string>(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`,
  );
  const [exportingCierreSectionId, setExportingCierreSectionId] = useState<number | null>(
    null,
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
    const totalRegistros = det.length;
    const presentes = det.filter((d) => d.estado === "PRESENTE").length;
    const ausentes = det.filter((d) => d.estado === "AUSENTE").length;
    const llegadasTarde = det.filter((d) => d.estado === "TARDE").length;
    const retirosAnticipados = det.filter(
      (d) => d.estado === "RETIRO_ANTICIPADO",
    ).length;
    const pct = totalRegistros
      ? Math.round((presentes / totalRegistros) * 100)
      : 0;
    return {
      s,
      pct,
      jCount: jor.length,
      totalRegistros,
      presentes,
      ausentes,
      llegadasTarde,
      retirosAnticipados,
    };
  });

  const exportCierreMensual = async (item: (typeof cierreMensual)[number]) => {
    const sectionLabel = `${item.s.gradoSala} ${item.s.division}`.trim();
    const monthLabel = formatMonthYearLabel(mes);
    const title = `Cierre mensual ${sectionLabel} – ${monthLabel}`;
    const summaryHtml = `
      <div class="card">
        <p><strong>Sección:</strong> ${escapeHtml(sectionLabel)}</p>
        <p><strong>Mes:</strong> ${escapeHtml(monthLabel)}</p>
        <p><strong>Jornadas registradas:</strong> ${escapeHtml(item.jCount)}</p>
        <p><strong>Días no hábiles declarados:</strong> ${escapeHtml(diasNoHabilesEnMes)}</p>
        <p><strong>Asistencia promedio:</strong> ${escapeHtml(item.pct)}%</p>
      </div>
      <div class="card">
        <h2>Detalle de asistencias</h2>
        <table>
          <tbody>
            <tr><th>Total de registros</th><td>${escapeHtml(item.totalRegistros)}</td></tr>
            <tr><th>Presentes</th><td>${escapeHtml(item.presentes)}</td></tr>
            <tr><th>Ausentes</th><td>${escapeHtml(item.ausentes)}</td></tr>
            <tr><th>Llegadas tarde</th><td>${escapeHtml(item.llegadasTarde)}</td></tr>
            <tr><th>Retiros anticipados</th><td>${escapeHtml(item.retirosAnticipados)}</td></tr>
          </tbody>
        </table>
      </div>
    `;

    try {
      setExportingCierreSectionId(item.s.id);
      const documentHtml = buildPdfHtml({
        title,
        body: summaryHtml,
      });
      await downloadPdfWithHtmlDocs({
        html: documentHtml,
        title,
        fileName: suggestPdfFileName(title),
      });
      toast.success("PDF generado correctamente.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo generar el PDF del cierre mensual.";
      toast.error(message);
    } finally {
      setExportingCierreSectionId(null);
    }
  };

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
      if (!periodoEscolarId) {
        toast.error("No hay un período escolar activo disponible");
        return;
      }
      await calendario.trimestres.create({
        periodoEscolarId,
        orden: (trimestres.length % 3) + 1,
        fechaInicio: nuevoTrimestre.inicio,
        fechaFin: nuevoTrimestre.fin,
      } as any);
      toast.success("Trimestre creado");
      setModalTri(false);
      await refreshBase();
      triggerCalendarRefresh("trimestres");
    } catch {
      toast.error("Error");
    }
  };

  const handleToggleTrimestre = async (tri: any) => {
    if (!tri?.id) return;
    const estado = getTrimestreEstado(tri);
    try {
      setTogglingTrimestreId(tri.id);
      if (estado === "activo") {
        await calendario.trimestres.cerrar(tri.id);
        toast.success("Trimestre cerrado");
      } else {
        await calendario.trimestres.reabrir(tri.id);
        toast.success("Trimestre activado");
      }
      await refreshBase();
      triggerCalendarRefresh("trimestres");
    } catch {
      toast.error("No se pudo actualizar el estado del trimestre");
    } finally {
      setTogglingTrimestreId(null);
    }
  };

  const crearNoHabil = async () => {
    try {
      await calendario.diasNoHabiles.create({
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

  if (loading) return <LoadingState label="Cargando información…" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Períodos</CardTitle>
          <CardDescription>Trimestres escolares</CardDescription>
        </CardHeader>
        <CardContent>
          {!periodoEscolarId ? (
            <p className="mb-3 text-sm text-muted-foreground">
              Abrí un período escolar desde la configuración institucional para
              gestionar los trimestres del ciclo en curso.
            </p>
          ) : null}
          <div className="flex justify-between mb-3">
            <div className="text-sm">Total: {trimestres.length}</div>
            <Button
              onClick={() => setModalTri(true)}
              disabled={!periodoEscolarId}
              title={
                periodoEscolarId
                  ? undefined
                  : "Abrí un período escolar para crear trimestres"
              }
            >
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
                    {(() => {
                      const estado = getTrimestreEstado(t);
                      const label = TRIMESTRE_ESTADO_LABEL[estado] ?? estado;
                      return (
                        <TrimestreEstadoBadge
                          estado={estado}
                          label={label}
                          className="text-xs text-muted-foreground"
                        />
                      );
                    })()}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleTrimestre(t)}
                      disabled={togglingTrimestreId === t.id}
                    >
                      {(() => {
                        const estado = getTrimestreEstado(t);
                        if (estado === "activo") return "Cerrar";
                        if (estado === "cerrado") return "Reabrir";
                        return "Activar";
                      })()}
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
            {cierreMensual.map((item) => {
              const { s, pct, jCount } = item;
              return (
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void exportCierreMensual(item)}
                      disabled={exportingCierreSectionId === s.id}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {exportingCierreSectionId === s.id ? "Generando…" : "PDF"}
                    </Button>
                  </div>
                </div>
              );
            })}
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
