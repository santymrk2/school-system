"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  informante?: string | null;
  firmante?: string | null;
};

export default function ViewActaDialog({
  acta,
  onClose,
  canEdit = false,
  canDelete = false,
  canMarkSigned = false,
  onEdit,
  onDelete,
  onMarkSigned,
  deleting = false,
  marking = false,
}: {
  acta: ActaVM;
  onClose: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canMarkSigned?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onMarkSigned?: () => void;
  deleting?: boolean;
  marking?: boolean;
}) {
  const [downloading, setDownloading] = useState(false);
  const isCerrada = String(acta.estado).toUpperCase() === "CERRADA";

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
              statusLabel: isCerrada ? "Cerrada" : "Borrador",
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
            <Badge variant={isCerrada ? "default" : "destructive"}>
              {isCerrada ? "Cerrada" : "Borrador"}
            </Badge>
            {acta.creadoPor && (
              <Badge variant="outline">Creada por: {acta.creadoPor}</Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
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
            <div>
              <b>Fecha:</b> {acta.fecha}
            </div>
            <div>
              <b>Hora:</b> {acta.hora ?? "—"}
            </div>
            <div>
              <b>Lugar:</b> {acta.lugar ?? "—"}
            </div>
            <div>
              <b>Estado:</b> {String(acta.estado)}
            </div>
            <div>
              <b>Informante:</b> {acta.informante ?? "—"}
            </div>
            <div>
              <b>Firmante:</b> {acta.firmante ?? "—"}
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
            {canMarkSigned && !isCerrada && (
              <Button onClick={() => onMarkSigned?.()} disabled={marking}>
                <Check className="h-4 w-4 mr-2" />
                {marking ? "Marcando…" : "Marcar como firmada"}
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
