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

const REPORT_MARGIN_X = 44;
const REPORT_MARGIN_TOP = 52;
const TABLE_FONT_SIZE = 9;
const TABLE_CELL_PADDING = 4;

const ensureCursorPosition = (doc: jsPDF, cursorY: number, neededSpace = 0) => {
  const pageHeight = doc.internal.pageSize.getHeight();
  const bottomLimit = pageHeight - 72;
  if (cursorY + neededSpace <= bottomLimit) {
    return cursorY;
  }

  doc.addPage();
  return REPORT_MARGIN_TOP;
};

const drawSectionTitle = (doc: jsPDF, title: string, x: number, y: number) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(title.toUpperCase(), x, y);
  return y + 10;
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

  const cardPaddingX = 14;
  const cardPaddingY = 12;
  const innerWidth = contentWidth - cardPaddingX * 2;

  const estimatedHeight = (() => {
    let total = cardPaddingY * 2;
    pairs.forEach((pair, index) => {
      const valueLines = doc.splitTextToSize(pair.value, innerWidth);
      total += 10; // label line
      total += valueLines.length * 10;
      if (index < pairs.length - 1) {
        total += 8;
      }
    });
    return total + 8; // extra spacing after section
  })();

  cursorY = ensureCursorPosition(doc, cursorY, estimatedHeight);

  const afterTitleY = drawSectionTitle(doc, title, REPORT_MARGIN_X, cursorY);
  const cardY = afterTitleY + 2;
  const cardHeight = (() => {
    let total = cardPaddingY * 2;
    pairs.forEach((pair, index) => {
      const valueLines = doc.splitTextToSize(pair.value, innerWidth);
      total += 10;
      total += valueLines.length * 10;
      if (index < pairs.length - 1) {
        total += 8;
      }
    });
    return Math.max(total, 54);
  })();

  doc.setDrawColor(191, 219, 254);
  doc.setFillColor(240, 249, 255);
  doc.roundedRect(
    REPORT_MARGIN_X,
    cardY,
    contentWidth,
    cardHeight,
    12,
    12,
    "FD",
  );
  doc.roundedRect(REPORT_MARGIN_X, cardY, contentWidth, cardHeight, 12, 12, "D");

  let textY = cardY + cardPaddingY + 2;
  pairs.forEach((pair, index) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(37, 99, 235);
    doc.text(pair.label.toUpperCase(), REPORT_MARGIN_X + cardPaddingX, textY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    textY += 10;

    const valueLines = doc.splitTextToSize(pair.value, innerWidth);
    valueLines.forEach((line) => {
      doc.text(line, REPORT_MARGIN_X + cardPaddingX, textY);
      textY += 10;
    });

    if (index < pairs.length - 1) {
      textY += 6;
    }
  });

  return cardY + cardHeight + 12;
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

  cursorY = ensureCursorPosition(doc, cursorY, 96);
  const afterTitleY = drawSectionTitle(doc, title, REPORT_MARGIN_X, cursorY);

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
    startY: afterTitleY + 6,
    margin: { left: REPORT_MARGIN_X, right: REPORT_MARGIN_X },
    tableWidth: contentWidth,
    head,
    body,
    styles: {
      font: "helvetica",
      fontSize: TABLE_FONT_SIZE,
      cellPadding: TABLE_CELL_PADDING,
      lineColor: [226, 232, 240],
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [226, 242, 255],
      textColor: [15, 23, 42],
      fontStyle: "bold",
    },
    bodyStyles: {
      textColor: [15, 23, 42],
      fillColor: [255, 255, 255],
      halign: "left",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles,
    theme: "grid",
  });

  const finalY = (doc as any).lastAutoTable?.finalY ?? afterTitleY + 28;
  return finalY + 14;
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

  if (params.subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text(params.subtitle, REPORT_MARGIN_X, cursorY + 16);
  }

  if (params.detail) {
    const detailY = params.subtitle ? cursorY + 28 : cursorY + 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(params.detail, REPORT_MARGIN_X, detailY);
    cursorY = detailY + 18;
  } else {
    cursorY += params.subtitle ? 32 : 26;
  }

  doc.setTextColor(15, 23, 42);

  params.sections.forEach((section) => {
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
