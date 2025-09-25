import { pdf } from "@react-pdf/renderer";

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

export type PdfDownloadParams = {
  html: string;
  title: string;
  fileName?: string;
  includeTitle?: boolean;
};

export const downloadPdfDocument = async ({
  html,
  title,
  fileName,
  includeTitle = true,
}: PdfDownloadParams) => {
  if (typeof window === "undefined") {
    throw new Error("La descarga de PDF solo está disponible en el navegador.");
  }

  const effectiveFileName = fileName ?? suggestPdfFileName(title);
  const instance = pdf({ title, html, includeTitle });
  const blob = await instance.toBlob();

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = effectiveFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
