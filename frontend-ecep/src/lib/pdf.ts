const DEFAULT_STYLES = `
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    margin: 24px;
    color: #0f172a;
    font-size: 14px;
    line-height: 1.6;
    background: #ffffff;
  }
  h1 {
    font-size: 24px;
    margin-bottom: 16px;
  }
  h2 {
    font-size: 18px;
    margin-top: 24px;
    margin-bottom: 12px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 12px;
  }
  th, td {
    border: 1px solid #cbd5f5;
    padding: 8px;
    font-size: 13px;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: #e0e7ff;
  }
  .card {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    margin-top: 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
  }
  .muted {
    color: #64748b;
    font-size: 12px;
  }
`;

const sanitizeFileName = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .replace(/-{2,}/g, "-");

export const suggestPdfFileName = (title: string, fallback = "documento") => {
  const clean = sanitizeFileName(title || fallback);
  const date = new Date().toISOString().slice(0, 10);
  return `${clean || fallback}-${date}.pdf`;
};

export const buildPdfHtml = ({
  title,
  body,
  styles,
}: {
  title: string;
  body: string;
  styles?: string;
}) => {
  const combinedStyles = `${DEFAULT_STYLES}\n${styles ?? ""}`;
  return `<!DOCTYPE html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <title>${escapeHtml(title)}</title>
      <style>${combinedStyles}</style>
    </head>
    <body>
      <h1>${escapeHtml(title)}</h1>
      ${body}
    </body>
  </html>`;
};

const escapeMap: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export const escapeHtml = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[&<>"']/g, (char) => escapeMap[char] ?? char);
};

export type HtmlDocsDownloadParams = {
  html: string;
  title: string;
  fileName?: string;
};

export const downloadPdfWithHtmlDocs = async ({
  html,
  title,
  fileName,
}: HtmlDocsDownloadParams) => {
  if (typeof window === "undefined") {
    throw new Error("La descarga de PDF solo está disponible en el navegador.");
  }

  const effectiveFileName = fileName ?? suggestPdfFileName(title);

  const response = await fetch("/api/pdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ html, title, fileName: effectiveFileName }),
  });

  if (!response.ok) {
    let message = "No se pudo generar el documento PDF.";
    try {
      const data = await response.json();
      if (typeof data?.error === "string") {
        message = data.error;
      }
    } catch {
      // ignore parsing errors
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = effectiveFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
