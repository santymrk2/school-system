import type jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type AccidentActPdfData = {
  id: number | string | null | undefined;
  alumno?: string | null;
  alumnoDni?: string | null;
  seccion?: string | null;
  fecha?: string | null;
  hora?: string | null;
  lugar?: string | null;
  descripcion?: string | null;
  acciones?: string | null;
  firmante?: string | null;
  firmanteDni?: string | null;
  familiar?: string | null;
  familiarDni?: string | null;
};

export type AccidentActPdfOptions = {
  statusLabel?: string;
  generatedAt?: string;
};

const formatText = (value: string | number | null | undefined) => {
  if (value == null) return "";
  const text = String(value).trim();
  return text.length > 0 ? text : "";
};

const fallback = (value: string | number | null | undefined, defaultValue = "—") => {
  const text = formatText(value);
  return text.length > 0 ? text : defaultValue;
};

const formatPersonWithDni = (
  name?: string | null,
  dni?: string | null,
  emptyFallback = "",
) => {
  const formattedName = formatText(name);
  const formattedDni = formatText(dni);
  if (!formattedName && !formattedDni) {
    return emptyFallback;
  }
  if (!formattedName) {
    return formattedDni ? `DNI ${formattedDni}` : emptyFallback;
  }
  return formattedDni ? `${formattedName} — DNI ${formattedDni}` : formattedName;
};

const drawStatusBadge = (doc: jsPDF, label: string, x: number, y: number) => {
  const paddingX = 12;
  const paddingY = 6;
  const textWidth = doc.getTextWidth(label);
  const width = textWidth + paddingX * 2;
  const height = paddingY * 2 + 4;
  const radius = 6;

  doc.setDrawColor(254, 243, 199);
  doc.setFillColor(254, 243, 199);
  doc.roundedRect(x - width, y, width, height, radius, radius, "FD");
  doc.setTextColor(180, 83, 9);
  doc.setFont("helvetica", "bold");
  doc.text(label, x - width / 2, y + height / 2 + 3, { align: "center", baseline: "middle" });
  doc.setTextColor(15, 23, 42);
};

const drawHighlightedBox = (
  doc: jsPDF,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
) => {
  const padding = 12;
  const height = 44;

  doc.setFillColor(240, 249, 255);
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(x, y, width, height, 10, 10, "FD");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235);
  doc.text(label.toUpperCase(), x + padding, y + padding);

  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text(value, x + padding, y + padding + 18);

  return y + height + 14;
};

const drawSectionTitle = (doc: jsPDF, title: string, x: number, y: number) => {
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(title.toUpperCase(), x, y);
  return y + 12;
};

const drawTextBox = (
  doc: jsPDF,
  text: string,
  emptyMessage: string,
  x: number,
  y: number,
  width: number,
) => {
  const padding = 12;
  const maxWidth = width - padding * 2;
  const content = text.trim().length > 0 ? text : emptyMessage;
  const isEmpty = text.trim().length === 0;

  const paragraphs = content.split(/\n{2,}/);
  let totalHeight = padding * 2;

  paragraphs.forEach((paragraph, index) => {
    const lines = doc.splitTextToSize(paragraph, maxWidth);
    totalHeight += lines.length * 12;
    if (index < paragraphs.length - 1) {
      totalHeight += 4;
    }
  });

  const height = Math.max(totalHeight, 48);

  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(isEmpty ? 248 : 255, isEmpty ? 250 : 255, isEmpty ? 252 : 255);
  doc.roundedRect(x, y, width, height, 14, 14, "FD");
  doc.roundedRect(x, y, width, height, 14, 14, "D");

  doc.setFont("helvetica", isEmpty ? "italic" : "normal");
  doc.setFontSize(10);
  doc.setTextColor(isEmpty ? 148 : 31, isEmpty ? 163 : 41, isEmpty ? 184 : 59);

  let cursorY = y + padding + 2;
  paragraphs.forEach((paragraph, index) => {
    const lines = doc.splitTextToSize(paragraph, maxWidth);
    lines.forEach((line) => {
      doc.text(line, x + padding, cursorY, { baseline: "top" });
      cursorY += 12;
    });
    if (index < paragraphs.length - 1) {
      cursorY += 4;
    }
  });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);

  return y + height + 12;
};

const drawSignatureBox = (
  doc: jsPDF,
  data: { title: string; name: string; dni?: string | null; note?: string },
  x: number,
  y: number,
  width: number,
) => {
  const height = 96;
  const padding = 12;
  const lineYOffset = 26;

  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(x, y, width, height, 10, 10, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(data.title.toUpperCase(), x + padding, y + padding);

  const lineY = y + height - lineYOffset;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(1);
  doc.line(x + padding, lineY, x + width - padding, lineY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(data.name, x + width / 2, lineY + 14, { align: "center" });

  if (data.dni) {
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`DNI ${data.dni}`, x + width / 2, lineY + 26, {
      align: "center",
    });
  }

  if (data.note) {
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(data.note, x + width / 2, lineY + 38, {
      align: "center",
    });
  }

  doc.setTextColor(15, 23, 42);

  return y + height + 12;
};

const autoTableFromEntries = (
  doc: jsPDF,
  entries: { label: string; value: string }[],
  startY: number,
  title: string,
  marginX: number,
  tableWidth: number,
) => {
  if (entries.length === 0) {
    return startY;
  }

  const afterTitleY = drawSectionTitle(doc, title, marginX, startY);

  autoTable(doc, {
    startY: afterTitleY,
    margin: { left: marginX, right: marginX },
    tableWidth,
    headStyles: {
      fillColor: [226, 242, 255],
      textColor: [15, 23, 42],
      fontStyle: "bold",
    },
    bodyStyles: {
      textColor: [15, 23, 42],
    },
    head: [["Detalle", "Valor"]],
    body: entries.map((entry) => [entry.label, entry.value]),
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 5,
    },
  });

  return (doc as any).lastAutoTable.finalY + 12;
};

export const renderAccidentActPdf = (
  doc: jsPDF,
  acta: AccidentActPdfData,
  { statusLabel, generatedAt }: AccidentActPdfOptions = {},
) => {
  const marginX = 44;
  let cursorY = 52;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - marginX * 2;

  const effectiveStatus = statusLabel ?? "Borrador";
  const statusIsClosed = effectiveStatus.toLowerCase() === "cerrada";
  const idLabel = fallback(acta.id, "S/D");
  const generatedLabel =
    generatedAt ??
    new Intl.DateTimeFormat("es-AR", { dateStyle: "long", timeStyle: "short" }).format(
      new Date(),
    );

  doc.setProperties({
    title: `Acta de Accidente #${idLabel}`,
    subject: "Registro institucional",
    author: "Sistema escolar",
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42);
  doc.text(`Acta de Accidente #${idLabel}`, marginX, cursorY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text("Acta de la Escuela Complejo Evangelico Pilar", marginX, cursorY + 14);

  const badgeX = pageWidth - marginX;
  if (statusIsClosed) {
    doc.setFillColor(220, 252, 231);
    doc.setDrawColor(134, 239, 172);
    const label = effectiveStatus;
    const paddingX = 12;
    const paddingY = 6;
    const textWidth = doc.getTextWidth(label);
    const width = textWidth + paddingX * 2;
    const height = paddingY * 2 + 4;
    doc.roundedRect(badgeX - width, cursorY - 12, width, height, 6, 6, "FD");
    doc.setTextColor(21, 128, 61);
    doc.setFont("helvetica", "bold");
    doc.text(label, badgeX - width / 2, cursorY + height / 2 - 6, {
      align: "center",
      baseline: "middle",
    });
  } else {
    drawStatusBadge(doc, effectiveStatus, badgeX, cursorY - 12);
  }
  doc.setTextColor(15, 23, 42);

  cursorY += 24;
  cursorY = drawHighlightedBox(
    doc,
    "Alumno involucrado",
    (() => {
      const nombre = fallback(acta.alumno, "Alumno sin registrar");
      const dni = formatText(acta.alumnoDni);
      return dni ? `${nombre} • DNI ${dni}` : nombre;
    })(),
    marginX,
    cursorY,
    contentWidth,
  );

  const fechaHoraValor = (() => {
    const fecha = fallback(acta.fecha);
    const hora = fallback(acta.hora);
    return hora === "—" ? fecha : `${fecha} • ${hora}`;
  })();

  const primaryDetails = [
    { label: "Alumno", value: fallback(acta.alumno, "Alumno sin registrar") },
    { label: "DNI del alumno", value: fallback(acta.alumnoDni) },
    { label: "Sección", value: fallback(acta.seccion) },
    { label: "Fecha y horario", value: fechaHoraValor },
    { label: "Lugar", value: fallback(acta.lugar) },
    { label: "Estado", value: fallback(effectiveStatus) },
  ];

  cursorY = autoTableFromEntries(doc, primaryDetails, cursorY, "Datos principales", marginX, contentWidth);

  const participantDetails = [
    {
      label: "Dirección firmante",
      value: formatPersonWithDni(
        acta.firmante,
        acta.firmanteDni,
        "Pendiente de asignación",
      ),
    },
  ].filter((entry) => entry.value.length > 0);

  if (participantDetails.length > 0) {
    cursorY = autoTableFromEntries(
      doc,
      participantDetails,
      cursorY,
      "Referentes del acta",
      marginX,
      contentWidth,
    );
  }

  const familyDetails = [
    { label: "Familiar responsable", value: fallback(acta.familiar) },
    { label: "DNI del familiar", value: fallback(acta.familiarDni) },
  ];
  if (familyDetails.some((entry) => entry.value !== "—")) {
    cursorY = autoTableFromEntries(
      doc,
      familyDetails,
      cursorY,
      "Información del familiar",
      marginX,
      contentWidth,
    );
  }

  cursorY = drawSectionTitle(doc, "Descripción del suceso", marginX, cursorY);
  cursorY = drawTextBox(
    doc,
    formatText(acta.descripcion ?? ""),
    "No se registró una descripción.",
    marginX,
    cursorY,
    contentWidth,
  );

  cursorY = drawSectionTitle(doc, "Acciones realizadas", marginX, cursorY);
  cursorY = drawTextBox(
    doc,
    formatText(acta.acciones ?? ""),
    "No se registraron acciones.",
    marginX,
    cursorY,
    contentWidth,
  );

  cursorY = drawSectionTitle(doc, "Firma", marginX, cursorY);
  cursorY = drawSignatureBox(
    doc,
    {
      title: "Dirección firmante",
      name: formatText(acta.firmante) || "Pendiente de asignación",
      dni: formatText(acta.firmanteDni) || undefined,
      note: "Dirección del establecimiento",
    },
    marginX,
    cursorY,
    contentWidth,
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generado el ${generatedLabel}`, marginX, cursorY + 6);
  doc.text(`ID interno: ${idLabel}`, pageWidth - marginX, cursorY + 6, { align: "right" });
};
