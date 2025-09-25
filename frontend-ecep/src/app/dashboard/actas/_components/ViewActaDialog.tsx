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

  const styles = `
    <style>
      *, *::before, *::after {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        padding: 32px;
        font-family: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;
        background: #f8fafc;
        color: #0f172a;
      }

      .document {
        max-width: 780px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 20px;
        border: 1px solid #e2e8f0;
        padding: 36px;
        box-shadow: 0 18px 40px -24px rgba(15, 23, 42, 0.35);
      }

      .header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 24px;
        padding-bottom: 24px;
        border-bottom: 2px solid #e2e8f0;
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .brand-icon {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        color: #ffffff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        font-weight: 600;
        box-shadow: 0 8px 16px -12px rgba(37, 99, 235, 0.65);
      }

      .subtitle {
        text-transform: uppercase;
        font-size: 11px;
        letter-spacing: 0.22em;
        color: #64748b;
        font-weight: 600;
      }

      h1 {
        margin: 6px 0 0;
        font-size: 30px;
        color: #0f172a;
        letter-spacing: -0.02em;
      }

      .status-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 10px 20px;
        font-size: 13px;
        font-weight: 600;
        border-radius: 999px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
      }

      .status-pill.cerrada {
        background: #dcfce7;
        color: #15803d;
        border: 1px solid rgba(34, 197, 94, 0.2);
      }

      .status-pill.borrador {
        background: #fef3c7;
        color: #b45309;
        border: 1px solid rgba(245, 158, 11, 0.3);
      }

      .student-highlight {
        margin-top: 20px;
        padding: 18px 22px;
        border-radius: 16px;
        background: linear-gradient(120deg, rgba(59, 130, 246, 0.12), rgba(59, 130, 246, 0.04));
        border: 1px solid rgba(59, 130, 246, 0.24);
      }

      .student-highlight-label {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        font-weight: 600;
        color: #1d4ed8;
      }

      .student-highlight-value {
        margin-top: 6px;
        font-size: 20px;
        font-weight: 700;
        color: #0f172a;
      }

      .section {
        margin-top: 32px;
      }

      .section-title {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        font-size: 15px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        color: #1e293b;
        margin-bottom: 18px;
      }

      .section-title .icon {
        width: 28px;
        height: 28px;
        border-radius: 10px;
        background: #e0f2fe;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        color: #0369a1;
      }

      .details-grid {
        display: grid;
        gap: 14px;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }

      .detail-card {
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 14px 16px;
        background: #f8fafc;
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-height: 92px;
      }

      .detail-label {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.18em;
        color: #64748b;
        font-weight: 600;
      }

      .detail-value {
        font-size: 15px;
        color: #0f172a;
        font-weight: 600;
        line-height: 1.4;
      }

      .text-box {
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 20px;
        background: #ffffff;
        font-size: 15px;
        line-height: 1.6;
        color: #1e293b;
        white-space: normal;
      }

      .text-box p {
        margin: 0 0 12px;
      }

      .text-box p:last-child {
        margin-bottom: 0;
      }

      .text-box.empty {
        color: #94a3b8;
        font-style: italic;
        background: #f8fafc;
      }

      .signature-section {
        margin-top: 40px;
      }

      .signature-box {
        border: 1px dashed rgba(37, 99, 235, 0.45);
        border-radius: 18px;
        padding: 28px;
        background: rgba(59, 130, 246, 0.04);
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
      }

      .signature-icon {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: #1d4ed8;
        color: #ffffff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        box-shadow: 0 12px 26px -18px rgba(37, 99, 235, 0.85);
      }

      .signature-line {
        width: 72%;
        height: 32px;
        border-bottom: 1.5px solid rgba(15, 23, 42, 0.45);
      }

      .signature-name {
        font-size: 15px;
        font-weight: 700;
        color: #0f172a;
      }

      .signature-role {
        font-size: 12px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #475569;
        font-weight: 600;
      }

      .signature-note {
        font-size: 12px;
        color: #64748b;
        max-width: 400px;
      }

      .footer {
        margin-top: 48px;
        padding-top: 18px;
        border-top: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        gap: 16px;
        font-size: 12px;
        color: #64748b;
      }
    </style>
  `;

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

  const assignedSigner = acta.firmante?.trim().length
    ? acta.firmante
    : "Pendiente de asignación";

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
    ${styles}
    <div class="document">
      <header class="header">
        <div class="brand">
          <div class="brand-icon">🏫</div>
          <div>
            <div class="subtitle">Registro institucional</div>
            <h1>${escapeHtml(title)}</h1>
          </div>
        </div>
        <div class="status-pill ${statusClass}">${escapeHtml(statusLabel)}</div>
      </header>
      <div class="student-highlight">
        <div class="student-highlight-label">Alumno involucrado</div>
        <div class="student-highlight-value">${escapeHtml(acta.alumno)}</div>
      </div>
      <section class="section">
        <h2 class="section-title"><span class="icon">📌</span>Datos principales</h2>
        <div class="details-grid">
          ${primaryDetails.map((detail) => renderDetail(detail.label, detail.value)).join("")}
        </div>
      </section>
      ${
        participantDetails.length
          ? `
              <section class="section">
                <h2 class="section-title"><span class="icon">🤝</span>Referentes del acta</h2>
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
        <h2 class="section-title"><span class="icon">📝</span>Descripción del suceso</h2>
        ${renderTextBlock(acta.descripcion, "No se registró una descripción.")}
      </section>
      <section class="section">
        <h2 class="section-title"><span class="icon">⚙️</span>Acciones realizadas</h2>
        ${renderTextBlock(acta.acciones ?? null, "No se registraron acciones.")}
      </section>
      <section class="section signature-section">
        <h2 class="section-title"><span class="icon">✍️</span>Firma de conformidad</h2>
        <div class="signature-box">
          <div class="signature-icon">✔</div>
          <div class="signature-line"></div>
          <div class="signature-name">${escapeHtml(assignedSigner)}</div>
          <div class="signature-role">Responsable / Firmante asignado</div>
          <div class="signature-note">
            Al firmar, la persona responsable registrada en el sistema confirma la veracidad de la información asentada en el acta.
          </div>
        </div>
      </section>
      <footer class="footer">
        <span>Generado el ${escapeHtml(generatedAt)}</span>
        <span>ID interno: ${escapeHtml(String(acta.id))}</span>
      </footer>
    </div>
  `;

  const fileName = suggestPdfFileName(
    `acta-accidente-${acta.id}-${acta.alumno}`,
    `acta-accidente-${acta.id}`,
  );

  return { html: body, title, fileName, includeTitle: false };
};
