import type jsPDF from "jspdf";
import autoTable, { type Styles } from "jspdf-autotable";

export type KeyValuePair = { label: string; value: string };

export type TableColumn = {
  label: string;
  width?: "wide";
};

export type ReportSection =
  | { type: "keyValue"; title: string; pairs: KeyValuePair[] }
  | { type: "table"; title: string; columns: TableColumn[]; rows: (string | number)[][] };

export type ReportRenderParams = {
  title: string;
  subtitle?: string;
  detail?: string;
  sections: ReportSection[];
  footer?: string;
  metadataTitle?: string;
};

const REPORT_MARGIN_X = 48;
const REPORT_MARGIN_TOP = 64;

const ensureCursorPosition = (doc: jsPDF, cursorY: number) => {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (cursorY <= pageHeight - 120) {
    return cursorY;
  }

  doc.addPage();
  return REPORT_MARGIN_TOP;
};

const renderKeyValueSection = (
  doc: jsPDF,
  cursorY: number,
  title: string,
  pairs: KeyValuePair[],
  contentWidth: number,
) => {
  if (pairs.length === 0) {
    return cursorY;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text(title.toUpperCase(), REPORT_MARGIN_X, cursorY);

  autoTable(doc, {
    startY: cursorY + 8,
    margin: { left: REPORT_MARGIN_X, right: REPORT_MARGIN_X },
    tableWidth: contentWidth,
    head: [["Detalle", "Valor"]],
    body: pairs.map((pair) => [pair.label, pair.value]),
    styles: {
      font: "helvetica",
      fontSize: 10,
      cellPadding: 6,
    },
    headStyles: {
      fillColor: [226, 232, 240],
      textColor: [15, 23, 42],
      fontStyle: "bold",
    },
    bodyStyles: {
      textColor: [15, 23, 42],
    },
    theme: "grid",
  });

  const finalY = (doc as any).lastAutoTable?.finalY ?? cursorY + 24;
  return finalY + 16;
};

const renderTableSection = (
  doc: jsPDF,
  cursorY: number,
  title: string,
  columns: TableColumn[],
  rows: (string | number)[][],
  contentWidth: number,
) => {
  if (rows.length === 0) {
    return cursorY;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text(title.toUpperCase(), REPORT_MARGIN_X, cursorY);

  const head = [columns.map((column) => column.label)];
  const body = rows.map((row) => row.map((value) => String(value)));

  const columnStyles: Record<number, Partial<Styles>> = {};
  columns.forEach((column, index) => {
    if (column.width === "wide") {
      columnStyles[index] = {
        cellWidth: contentWidth * 0.34,
      };
    }
  });

  autoTable(doc, {
    startY: cursorY + 8,
    margin: { left: REPORT_MARGIN_X, right: REPORT_MARGIN_X },
    tableWidth: contentWidth,
    head,
    body,
    styles: {
      font: "helvetica",
      fontSize: 10,
      cellPadding: 6,
    },
    headStyles: {
      fillColor: [226, 232, 240],
      textColor: [15, 23, 42],
      fontStyle: "bold",
    },
    bodyStyles: {
      textColor: [15, 23, 42],
    },
    columnStyles,
    theme: "grid",
  });

  const finalY = (doc as any).lastAutoTable?.finalY ?? cursorY + 24;
  return finalY + 16;
};

export const renderInstitutionalReport = (doc: jsPDF, params: ReportRenderParams) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - REPORT_MARGIN_X * 2;

  doc.setProperties({
    title: params.metadataTitle ?? params.title,
    author: "Sistema escolar",
    subject: "Reporte institucional",
  });

  let cursorY = REPORT_MARGIN_TOP;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text(params.title, REPORT_MARGIN_X, cursorY);
  cursorY += 24;

  if (params.subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(71, 85, 105);
    doc.text(params.subtitle, REPORT_MARGIN_X, cursorY);
    cursorY += 18;
  }

  if (params.detail) {
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(params.detail, REPORT_MARGIN_X, cursorY);
    cursorY += 16;
  }

  doc.setTextColor(15, 23, 42);

  params.sections.forEach((section) => {
    cursorY = ensureCursorPosition(doc, cursorY);
    if (section.type === "keyValue") {
      cursorY = renderKeyValueSection(doc, cursorY, section.title, section.pairs, contentWidth);
    } else {
      cursorY = renderTableSection(
        doc,
        cursorY,
        section.title,
        section.columns,
        section.rows,
        contentWidth,
      );
    }
  });

  if (params.footer) {
    cursorY = ensureCursorPosition(doc, cursorY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(params.footer, REPORT_MARGIN_X, cursorY + 8, {
      maxWidth: contentWidth,
    });
  }
};
