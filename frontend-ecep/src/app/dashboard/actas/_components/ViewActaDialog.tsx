"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { downloadPdfDocument, suggestPdfFileName } from "@/lib/pdf";
import { renderAccidentActPdf } from "@/lib/pdf/accident-act";
import { Printer, Pencil, Trash2, Check } from "lucide-react";
import { useState } from "react";
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Acta de Accidente #{acta.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={badgeVariant}>{estadoLabel}</Badge>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <b>Alumno:</b> {acta.alumno}
            </div>
            <div>
              <b>DNI del alumno:</b> {acta.alumnoDni ?? "—"}
            </div>
            <div>
              <b>Sección:</b> {acta.seccion ?? "—"}
            </div>
            <div>
              <b>Familiar responsable:</b> {acta.familiar ?? "—"}
            </div>
            <div>
              <b>DNI del familiar:</b> {acta.familiarDni ?? "—"}
            </div>
            <div className="sm:col-span-2">
              <b>Fecha y horario:</b> {acta.fecha} • {acta.hora ?? "—"}
            </div>
            <div>
              <b>Lugar:</b> {acta.lugar ?? "—"}
            </div>
            <div>
              <b>Estado:</b> {String(acta.estado)}
            </div>
            <div className="sm:col-span-2">
              <b>Docente informante:</b> {informanteLabel}
            </div>
            <div className="sm:col-span-2">
              <b>Dirección firmante:</b>
              {firmanteSelectEnabled ? (
                <div className="mt-1 max-w-sm">
                  <Select
                    value={
                      acta.firmanteId != null
                        ? String(acta.firmanteId)
                        : ""
                    }
                    onValueChange={(value) =>
                      onFirmanteChange?.(value ? Number(value) : null)
                    }
                    disabled={firmanteUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccioná directivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sin asignar</SelectItem>
                      {(firmanteOptions ?? []).map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="ml-1 flex flex-col">
                  <span>{direccionFirmante}</span>
                  {canManageFirmante && isBorrador && (
                    <span className="text-xs text-muted-foreground">
                      Cerrá el acta para asignar una dirección firmante.
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <b>Descripción del suceso</b>
            <pre className="mt-1 whitespace-pre-wrap text-sm">
              {acta.descripcion}
            </pre>
          </div>

          {acta.acciones && (
            <div>
              <b>Acciones realizadas</b>
              <pre className="mt-1 whitespace-pre-wrap text-sm">
                {acta.acciones}
              </pre>
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            {canCloseActa && isBorrador && (
              <Button onClick={() => onCloseActa?.()} disabled={closing}>
                <Check className="h-4 w-4 mr-2" />
                {closing ? "Cerrando…" : "Cerrar acta"}
              </Button>
            )}
            {canMarkFirmada && isCerrada && (
              <Button
                onClick={() => onMarkFirmada?.()}
                disabled={markingFirmada || !acta.firmanteId}
              >
                <Check className="h-4 w-4 mr-2" />
                {markingFirmada ? "Actualizando…" : "Firmado"}
              </Button>
            )}
            {canEdit && (
              <Button variant="outline" onClick={() => onEdit?.()}>
                <Pencil className="h-4 w-4 mr-2" /> Editar
              </Button>
            )}
            {canDelete && (
              <Button
                variant="destructive"
                onClick={() => onDelete?.()}
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleting ? "Eliminando…" : "Eliminar"}
              </Button>
            )}
            <Button variant="outline" onClick={handleDownload} disabled={downloading}>
              <Printer className="h-4 w-4 mr-2" />
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
