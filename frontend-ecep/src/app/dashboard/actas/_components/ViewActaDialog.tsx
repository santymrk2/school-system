"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { downloadPdfDocument, escapeHtml, suggestPdfFileName } from "@/lib/pdf";
import { Printer, Pencil, Trash2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
  const [downloading, setDownloading] = useState(false);
  const isCerrada = String(acta.estado).toUpperCase() === "CERRADA";

  const handleDownload = async () => {
    if (downloading) return;

    try {
      setDownloading(true);
      const document = buildActaPdfDocument(acta, isCerrada);
      await downloadPdfDocument({
        html: document.html,
        title: document.title,
        fileName: document.fileName,
        includeTitle: document.includeTitle,
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

const buildActaPdfDocument = (acta: ActaVM, isCerrada: boolean) => {
  const title = `Acta de Accidente #${acta.id}`;
  const statusLabel = isCerrada ? "Cerrada" : "Borrador";
  const statusClass = isCerrada ? "cerrada" : "borrador";
  const generatedAt = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());

  const primaryDetails = [
    { label: "Alumno", value: acta.alumno },
    { label: "Sección", value: acta.seccion ?? "—" },
    { label: "Fecha del suceso", value: acta.fecha },
    { label: "Hora", value: acta.hora ?? "—" },
    { label: "Lugar", value: acta.lugar ?? "—" },
    { label: "Estado", value: statusLabel },
  ];

  const participantDetails = [
    { label: "Creada por", value: acta.creadoPor },
    { label: "Informante", value: acta.informante },
    { label: "Firmante", value: acta.firmante },
  ].filter((detail) => detail.value && detail.value.trim().length > 0);

  const renderDetail = (label: string, value: string) => `
    <div class="detail-card">
      <div class="detail-label">${escapeHtml(label)}</div>
      <div class="detail-value">${escapeHtml(value)}</div>
    </div>
  `;

  const renderTextBlock = (value: string | null | undefined, emptyMessage: string) => {
    if (!value || value.trim().length === 0) {
      return `<div class="text-box empty">${escapeHtml(emptyMessage)}</div>`;
    }

    const paragraphs = value
      .trim()
      .split(/\n{2,}/)
      .map((paragraph) =>
        `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`
      )
      .join("");

    return `<div class="text-box">${paragraphs}</div>`;
  };

  const body = `
    <header class="header">
      <div>
        <div class="subtitle">Registro institucional</div>
        <h1>${escapeHtml(title)}</h1>
        <div class="detail-label" style="margin-top: 6px;">Alumno</div>
        <div class="detail-value" style="font-weight: 600;">${escapeHtml(acta.alumno)}</div>
      </div>
      <div class="status-pill ${statusClass}">${escapeHtml(statusLabel)}</div>
    </header>
    <section class="section">
      <h2 class="section-title">Datos principales</h2>
      <div class="details-grid">
        ${primaryDetails.map((detail) => renderDetail(detail.label, detail.value)).join("")}
      </div>
    </section>
    ${
      participantDetails.length
        ? `
            <section class="section">
              <h2 class="section-title">Referentes del acta</h2>
              <div class="details-grid">
                ${participantDetails
                  .map((detail) => renderDetail(detail.label, detail.value ?? "—"))
                  .join("")}
              </div>
            </section>
          `
        : ""
    }
    <section class="section">
      <h2 class="section-title">Descripción del suceso</h2>
      ${renderTextBlock(acta.descripcion, "No se registró una descripción.")}
    </section>
    <section class="section">
      <h2 class="section-title">Acciones realizadas</h2>
      ${renderTextBlock(acta.acciones ?? null, "No se registraron acciones.")}
    </section>
    <footer class="footer">
      <span>Generado el ${escapeHtml(generatedAt)}</span>
      <span>ID interno: ${escapeHtml(String(acta.id))}</span>
    </footer>
  `;

  const fileName = suggestPdfFileName(
    `acta-accidente-${acta.id}-${acta.alumno}`,
    `acta-accidente-${acta.id}`,
  );

  return { html: body, title, fileName, includeTitle: false };
};
