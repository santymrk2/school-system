"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, Pencil, Trash2, Check } from "lucide-react";

type ActaVM = {
  id: number;
  alumno: string;
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
  const isCerrada = String(acta.estado).toUpperCase() === "CERRADA";

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
              <b>Sección:</b> {acta.seccion ?? "—"}
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
            <Button
              variant="outline"
              onClick={() => {
                const w = window.open("", "_blank");
                if (!w) return;
                w.document.write(`
                  <html><head><title>Acta ${acta.id}</title></head>
                  <body>
                    <h2>Acta de Accidente #${acta.id}</h2>
                    <p><b>Alumno:</b> ${acta.alumno}</p>
                    <p><b>Fecha:</b> ${acta.fecha}</p>
                    <p><b>Hora:</b> ${acta.hora ?? "—"}</p>
                    <p><b>Lugar:</b> ${acta.lugar ?? "—"}</p>
                    <p><b>Sección:</b> ${acta.seccion ?? "—"}</p>
                    <p><b>Estado:</b> ${isCerrada ? "Cerrada" : "Borrador"}</p>
                    ${
                      acta.creadoPor
                        ? `<p><b>Creada por:</b> ${acta.creadoPor}</p>`
                        : ""
                    }
                    ${
                      acta.informante
                        ? `<p><b>Informante:</b> ${acta.informante}</p>`
                        : ""
                    }
                    ${
                      acta.firmante
                        ? `<p><b>Firmante:</b> ${acta.firmante}</p>`
                        : ""
                    }
                    <hr/>
                    <h3>Descripción del suceso</h3>
                    <pre style="white-space:pre-wrap;font-family:inherit;">${acta.descripcion ?? ""}</pre>
                    ${
                      acta.acciones
                        ? `<h3>Acciones realizadas</h3><pre style="white-space:pre-wrap;font-family:inherit;">${acta.acciones}</pre>`
                        : ""
                    }
                  </body></html>
                `);
                w.document.close();
                w.focus();
                w.print();
              }}
            >
              <Printer className="h-4 w-4 mr-2" /> Imprimir
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
