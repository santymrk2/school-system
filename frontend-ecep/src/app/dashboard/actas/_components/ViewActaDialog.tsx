"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { downloadPdfDocument, suggestPdfFileName } from "@/lib/pdf";
import { renderAccidentActPdf } from "@/lib/pdf/accident-act";
import { cn } from "@/lib/utils";
import { Printer, Pencil, Trash2, Check } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

type ActaVM = {
  id: number;
  alumno: string;
  alumnoDni?: string | null;
  familiar?: string | null;
  familiarDni?: string | null;
  seccion?: string | null;
  fecha: string;
  hora?: string | null;
  lugar?: string | null;
  descripcion: string;
  acciones?: string | null;
  estado: string;
  creadoPor?: string | null;
  firmante?: string | null;
  firmanteDni?: string | null;
  firmanteId?: number | null;
  informante?: string | null;
  informanteDni?: string | null;
  informanteId?: number | null;
};

const UNASSIGNED_FIRMANTE_VALUE = "unassigned";

export default function ViewActaDialog({
  acta,
  onClose,
  canEdit = false,
  canDelete = false,
  canCloseActa = false,
  canMarkFirmada = false,
  canManageFirmante = false,
  onEdit,
  onDelete,
  onCloseActa,
  onMarkFirmada,
  onFirmanteChange,
  deleting = false,
  closing = false,
  markingFirmada = false,
  firmanteOptions,
  firmanteUpdating = false,
}: {
  acta: ActaVM;
  onClose: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canCloseActa?: boolean;
  canMarkFirmada?: boolean;
  canManageFirmante?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onCloseActa?: () => void;
  onMarkFirmada?: () => void;
  onFirmanteChange?: (value: number | null) => void;
  deleting?: boolean;
  closing?: boolean;
  markingFirmada?: boolean;
  firmanteOptions?: { value: string; label: string }[];
  firmanteUpdating?: boolean;
}) {
  const [downloading, setDownloading] = useState(false);
  const estado = String(acta.estado ?? "").toUpperCase();
  const isBorrador = estado === "BORRADOR";
  const isCerrada = estado === "CERRADA";
  const isFirmada = estado === "FIRMADA";
  const estadoLabel = (() => {
    if (isFirmada) return "Firmada";
    if (isCerrada) return "Cerrada";
    if (isBorrador) return "Borrador";
    return acta.estado || "Sin estado";
  })();
  const badgeVariant = (() => {
    if (isFirmada) return "default" as const;
    if (isCerrada) return "secondary" as const;
    if (isBorrador) return "destructive" as const;
    return "outline" as const;
  })();
  const direccionFirmante = acta.firmante
    ? `${acta.firmante}${acta.firmanteDni ? ` (DNI ${acta.firmanteDni})` : ""}`
    : "Pendiente de asignación";
  const informanteLabel = acta.informante
    ? `${acta.informante}${acta.informanteDni ? ` (DNI ${acta.informanteDni})` : ""}`
    : "Pendiente de asignación";
  const firmanteSelectEnabled = Boolean(canManageFirmante && !isBorrador);
  const statusMessage = (() => {
    if (isFirmada) return "El acta se encuentra firmada y lista para archivar.";
    if (isCerrada) return "El acta está cerrada y pendiente de firma directiva.";
    if (isBorrador)
      return "El acta continúa abierta para edición y requiere completar la información restante.";
    return "Estado actualizado según la información registrada.";
  })();
  const descripcionTexto =
    acta.descripcion && acta.descripcion.trim().length > 0
      ? acta.descripcion
      : "No se registró una descripción.";
  const accionesTexto =
    acta.acciones && acta.acciones.trim().length > 0 ? acta.acciones : null;

  const handleDownload = async () => {
    if (downloading) return;

    try {
      setDownloading(true);
      const fileName = suggestPdfFileName(
        `acta-accidente-${acta.id}-${acta.alumno}`,
        `acta-accidente-${acta.id}`,
      );
      await downloadPdfDocument({
        create: (doc) =>
          renderAccidentActPdf(
            doc,
            acta,
            {
              statusLabel: estadoLabel,
            },
          ),
        fileName,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo generar el PDF del acta.";
      toast.error(message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader className="space-y-2">
          <DialogTitle>Acta de Accidente #{acta.id}</DialogTitle>
          <DialogDescription>
            Revisá la información registrada y realizá acciones administrativas desde este
            panel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={badgeVariant}>{estadoLabel}</Badge>
              <span className="text-sm text-muted-foreground">{statusMessage}</span>
            </div>
            {acta.creadoPor && (
              <p className="mt-2 text-xs text-muted-foreground">
                Registrado por {acta.creadoPor}.
              </p>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Información del alumno</CardTitle>
                <CardDescription>Datos personales y de contacto familiar.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 p-6 pt-0 sm:grid-cols-2">
                <InfoTile label="Alumno" value={acta.alumno} className="sm:col-span-2" />
                <InfoTile label="DNI del alumno" value={acta.alumnoDni ?? "—"} />
                <InfoTile label="Sección" value={acta.seccion ?? "—"} />
                <InfoTile label="Familiar responsable" value={acta.familiar ?? "—"} />
                <InfoTile label="DNI del familiar" value={acta.familiarDni ?? "—"} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Detalle del suceso</CardTitle>
                <CardDescription>Fechas, horarios y ubicación del incidente.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 p-6 pt-0 sm:grid-cols-2">
                <InfoTile
                  label="Fecha y horario"
                  value={
                    <span>
                      {acta.fecha} • {acta.hora ?? "—"}
                    </span>
                  }
                  className="sm:col-span-2"
                />
                <InfoTile label="Lugar" value={acta.lugar ?? "—"} />
                <InfoTile label="Estado actual" value={String(acta.estado || "Sin estado")}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Seguimiento institucional</CardTitle>
              <CardDescription>
                Referentes asignados y controles administrativos del acta.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 p-6 pt-0 sm:grid-cols-2">
              <InfoTile label="Docente informante" value={informanteLabel} className="sm:col-span-2" />
              <InfoTile
                label="Dirección firmante"
                value={
                  firmanteSelectEnabled ? (
                    <div className="max-w-sm">
                      <Select
                        value={
                          acta.firmanteId != null
                            ? String(acta.firmanteId)
                            : UNASSIGNED_FIRMANTE_VALUE
                        }
                        onValueChange={(value) =>
                          onFirmanteChange?.(
                            value === UNASSIGNED_FIRMANTE_VALUE
                              ? null
                              : Number(value)
                          )
                        }
                        disabled={firmanteUpdating}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccioná directivo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={UNASSIGNED_FIRMANTE_VALUE}>
                            Sin asignar
                          </SelectItem>
                          {(firmanteOptions ?? []).map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <span className="font-medium">{direccionFirmante}</span>
                      {canManageFirmante && isBorrador && (
                        <span className="text-xs text-muted-foreground">
                          Cerrá el acta para asignar una dirección firmante.
                        </span>
                      )}
                    </div>
                  )
                }
                className="sm:col-span-2"
              />
              {acta.creadoPor && (
                <InfoTile label="Registrado por" value={acta.creadoPor} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Descripción del suceso</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <pre className="whitespace-pre-wrap rounded-md border border-border/40 bg-background/70 p-4 text-sm">
                {descripcionTexto}
              </pre>
            </CardContent>
          </Card>

          {accionesTexto && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Acciones realizadas</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <pre className="whitespace-pre-wrap rounded-md border border-border/40 bg-background/70 p-4 text-sm">
                  {accionesTexto}
                </pre>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            {canCloseActa && isBorrador && (
              <Button onClick={() => onCloseActa?.()} disabled={closing}>
                <Check className="mr-2 h-4 w-4" />
                {closing ? "Cerrando…" : "Cerrar acta"}
              </Button>
            )}
            {canMarkFirmada && isCerrada && (
              <Button
                onClick={() => onMarkFirmada?.()}
                disabled={markingFirmada || !acta.firmanteId}
              >
                <Check className="mr-2 h-4 w-4" />
                {markingFirmada ? "Actualizando…" : "Firmar acta"}
              </Button>
            )}
            {canEdit && (
              <Button variant="outline" onClick={() => onEdit?.()}>
                <Pencil className="mr-2 h-4 w-4" /> Editar
              </Button>
            )}
            {canDelete && (
              <Button
                variant="destructive"
                onClick={() => onDelete?.()}
                disabled={deleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleting ? "Eliminando…" : "Eliminar"}
              </Button>
            )}
            <Button variant="outline" onClick={handleDownload} disabled={downloading}>
              <Printer className="mr-2 h-4 w-4" />
              {downloading ? "Generando…" : "Imprimir"}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoTile({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-border/40 bg-muted/20 p-4",
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-2 text-sm text-foreground">{value}</div>
    </div>
  );
}
