"use client";

import { pdf } from "@react-pdf/renderer";
import type { ReactElement } from "react";

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
  document: ReactElement;
  fileName?: string;
};

export const downloadPdfDocument = async ({
  document: pdfDocument,
  fileName,
}: PdfDownloadParams) => {
  if (typeof window === "undefined") {
    throw new Error("La descarga de PDF solo está disponible en el navegador.");
  }

  const effectiveFileName = fileName ?? suggestPdfFileName("documento");
  const instance = pdf();
  instance.updateContainer(pdfDocument);
  const blob = await instance.toBlob();

  const url = window.URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = effectiveFileName;
  window.document.body.appendChild(link);
  link.click();
  window.document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
