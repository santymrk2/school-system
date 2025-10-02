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

export type BoletinSummaryCard = { label: string; value: string };

export type BoletinReportTrimester = {
  label: string;
  subjects: {
    name: string;
    teacher?: string | null;
    grade: string;
    observations?: string | null;
  }[];
};

export type BoletinReportParams = {
  title: string;
  metadataTitle?: string;
  student: {
    name: string;
    section: string;
    level: string;
    legajo: string;
  };
  summaryCards: BoletinSummaryCard[];
  details: KeyValuePair[];
  attendanceDetail?: KeyValuePair[] | null;
  trimesters: BoletinReportTrimester[];
  footer?: string;
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

const renderSummaryCardsSection = (
  doc: jsPDF,
  cursorY: number,
  cards: BoletinSummaryCard[],
  contentWidth: number,
) => {
  if (!cards.length) {
    return cursorY;
  }

  const cardGap = 16;
  const cardWidth =
    cards.length > 1
      ? (contentWidth - cardGap * (cards.length - 1)) / cards.length
      : contentWidth;
  const cardHeight = 64;

  cursorY = ensureCursorPosition(doc, cursorY, cardHeight + 12);
  const cardsY = cursorY;

  cards.forEach((card, index) => {
    const cardX =
      REPORT_MARGIN_X + index * (cardWidth + (cards.length > 1 ? cardGap : 0));

    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(cardX, cardsY, cardWidth, cardHeight, 12, 12, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(card.label.toUpperCase(), cardX + 14, cardsY + 18);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text(card.value, cardX + 14, cardsY + 42);
  });

  return cardsY + cardHeight + 18;
};

const getTrimesterCardHeight = (
  doc: jsPDF,
  trimester: BoletinReportTrimester,
  contentWidth: number,
) => {
  const cardPaddingX = 18;
  const cardPaddingY = 18;
  const headerHeight = 18;
  const gradeColumnWidth = 46;
  const subjectTextWidth = contentWidth - cardPaddingX * 2 - gradeColumnWidth;
  const lineHeight = 6.5;
  let total = cardPaddingY * 2 + headerHeight;

  if (!trimester.subjects.length) {
    return total + 16;
  }

  trimester.subjects.forEach((subject, index) => {
    const nameLines = doc.splitTextToSize(subject.name, subjectTextWidth);
    total += nameLines.length * lineHeight;
    if (subject.teacher) {
      const teacherLines = doc.splitTextToSize(
        `Docente: ${subject.teacher}`,
        subjectTextWidth,
      );
      total += teacherLines.length * (lineHeight - 0.5);
    }
    if (subject.observations) {
      const observationLines = doc.splitTextToSize(
        `Observaciones: ${subject.observations}`,
        subjectTextWidth,
      );
      total += observationLines.length * (lineHeight - 0.5);
    }
    total += lineHeight; // space for grade baseline
    if (index < trimester.subjects.length - 1) {
      total += 6;
    }
  });

  return total;
};

const renderTrimesterCardsSection = (
  doc: jsPDF,
  cursorY: number,
  trimesters: BoletinReportTrimester[],
  contentWidth: number,
) => {
  if (!trimesters.length) {
    cursorY = ensureCursorPosition(doc, cursorY, 64);
    const afterTitleY = drawSectionTitle(
      doc,
      "Materias y calificaciones",
      REPORT_MARGIN_X,
      cursorY,
    );

    const cardHeight = 46;
    const cardY = afterTitleY + 4;
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(
      REPORT_MARGIN_X,
      cardY,
      contentWidth,
      cardHeight,
      12,
      12,
      "FD",
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(
      "No hay calificaciones registradas para este alumno.",
      REPORT_MARGIN_X + 16,
      cardY + 28,
    );

    return cardY + cardHeight + 16;
  }

  cursorY = ensureCursorPosition(doc, cursorY, 36);
  let currentY = drawSectionTitle(
    doc,
    "Materias y calificaciones",
    REPORT_MARGIN_X,
    cursorY,
  );
  currentY += 4;

  trimesters.forEach((trimester) => {
    const cardHeight = getTrimesterCardHeight(doc, trimester, contentWidth);
    currentY = ensureCursorPosition(doc, currentY, cardHeight + 12);

    const cardX = REPORT_MARGIN_X;
    const cardY = currentY;
    const cardPaddingX = 18;
    const cardPaddingY = 18;
    const headerHeight = 18;
    const gradeColumnWidth = 46;
    const subjectTextWidth = contentWidth - cardPaddingX * 2 - gradeColumnWidth;
    const lineHeight = 6.5;

    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(cardX, cardY, contentWidth, cardHeight, 12, 12, "FD");

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(
      cardX,
      cardY,
      contentWidth,
      headerHeight + 12,
      12,
      12,
      "F",
    );
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(cardX, cardY, contentWidth, cardHeight, 12, 12, "D");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(trimester.label, cardX + cardPaddingX, cardY + cardPaddingY + 4);

    let subjectY = cardY + cardPaddingY + headerHeight;
    if (!trimester.subjects.length) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(
        "No hay calificaciones registradas para este trimestre.",
        cardX + cardPaddingX,
        subjectY + 10,
      );
      currentY = cardY + cardHeight + 16;
      return;
    }

    trimester.subjects.forEach((subject, index) => {
      const subjectTopY = subjectY + 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);

      const nameLines = doc.splitTextToSize(
        subject.name,
        subjectTextWidth,
      );
      let textCursorY = subjectTopY;
      nameLines.forEach((line) => {
        doc.text(line, cardX + cardPaddingX, textCursorY);
        textCursorY += lineHeight;
      });

      if (subject.teacher) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        const teacherLines = doc.splitTextToSize(
          `Docente: ${subject.teacher}`,
          subjectTextWidth,
        );
        teacherLines.forEach((line) => {
          doc.text(line, cardX + cardPaddingX, textCursorY);
          textCursorY += lineHeight - 0.5;
        });
      }

      if (subject.observations) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        const observationLines = doc.splitTextToSize(
          `Observaciones: ${subject.observations}`,
          subjectTextWidth,
        );
        observationLines.forEach((line) => {
          doc.text(line, cardX + cardPaddingX, textCursorY);
          textCursorY += lineHeight - 0.5;
        });
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(subject.grade ?? "—", cardX + contentWidth - cardPaddingX, subjectTopY, {
        align: "right",
      });

      subjectY = textCursorY + 4;
      if (index < trimester.subjects.length - 1) {
        doc.setDrawColor(226, 232, 240);
        doc.line(
          cardX + cardPaddingX,
          subjectY,
          cardX + contentWidth - cardPaddingX,
          subjectY,
        );
        subjectY += 2;
      }
    });

    currentY = cardY + cardHeight + 18;
  });

  return currentY;
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

export const renderBoletinReport = (doc: jsPDF, params: BoletinReportParams) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - REPORT_MARGIN_X * 2;

  doc.setProperties({
    title: params.metadataTitle ?? params.title,
    author: "Sistema escolar",
    subject: "Reporte de boletín",
  });

  let cursorY = REPORT_MARGIN_TOP;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text(params.title, REPORT_MARGIN_X, cursorY);

  cursorY += 24;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text(params.student.name, REPORT_MARGIN_X, cursorY);

  cursorY += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  const detailLine = `${params.student.section} • Nivel ${params.student.level} • Legajo ${params.student.legajo}`;
  doc.text(detailLine, REPORT_MARGIN_X, cursorY);

  cursorY += 18;
  doc.setTextColor(15, 23, 42);
  cursorY = renderSummaryCardsSection(doc, cursorY, params.summaryCards, contentWidth);

  cursorY = renderKeyValueSection(
    doc,
    cursorY,
    "Información del alumno",
    params.details,
    contentWidth,
  );

  if (params.attendanceDetail && params.attendanceDetail.length) {
    cursorY = renderKeyValueSection(
      doc,
      cursorY,
      "Detalle de asistencia",
      params.attendanceDetail,
      contentWidth,
    );
  }

  cursorY = renderTrimesterCardsSection(doc, cursorY, params.trimesters, contentWidth);

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
