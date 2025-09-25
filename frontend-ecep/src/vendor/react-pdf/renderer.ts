export type PdfSource = {
  title: string;
  html: string;
  includeTitle?: boolean;
};

export type PdfInstance = {
  toBlob: () => Promise<Blob>;
};

const escapePdfText = (value: string) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\r/g, " ")
    .replace(/\n/g, " ");

const splitLines = (text: string) =>
  text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trimEnd());

const createPdfStream = (lines: string[]) => {
  const sanitized = lines.length > 0 ? lines : [" "];
  const operations = sanitized
    .map((line, index) => {
      const escaped = escapePdfText(line);
      return index === 0 ? `(${escaped}) Tj` : `T* (${escaped}) Tj`;
    })
    .join("\n");

  return [
    "BT",
    "/F1 12 Tf",
    "14 TL",
    "72 780 Td",
    operations,
    "ET",
  ].join("\n");
};

const buildPdfDocument = (lines: string[]) => {
  const streamContent = createPdfStream(lines);
  const encoder = typeof TextEncoder !== "undefined" ? new TextEncoder() : null;
  const streamBytes = encoder ? encoder.encode(streamContent) : undefined;
  const streamLength = streamBytes ? streamBytes.length : streamContent.length;

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
    `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /Name /F1 /BaseFont /Helvetica >>\nendobj\n",
  ];

  let offset = 0;
  const parts: string[] = [];
  const xref: string[] = ["0000000000 65535 f \n"];

  const push = (chunk: string) => {
    parts.push(chunk);
    offset += chunk.length;
  };

  push("%PDF-1.4\n%âãÏÓ\n");

  objects.forEach((object) => {
    xref.push(`${String(offset).padStart(10, "0")} 00000 n \n`);
    push(object);
  });

  const xrefOffset = offset;
  push(`xref\n0 ${objects.length + 1}\n`);
  xref.forEach((entry) => push(entry));
  push(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`);
  push(`startxref\n${xrefOffset}\n%%EOF`);

  return parts.join("");
};

const extractTextLines = (html: string) => {
  if (typeof document === "undefined") {
    throw new Error("PDF generation requires a browser environment.");
  }

  const container = document.createElement("div");
  container.innerHTML = html;

  container.querySelectorAll("br").forEach((br) => {
    br.parentNode?.insertBefore(document.createTextNode("\n"), br);
  });

  container.querySelectorAll("p, li, tr").forEach((el) => {
    const tag = el.tagName.toLowerCase();
    if (tag === "li") {
      el.insertAdjacentText("afterbegin", "• ");
    }
    if (!el.textContent?.trim()) return;
    el.insertAdjacentText("beforeend", "\n");
  });

  const text = container.textContent ?? "";
  return splitLines(text).filter((line, index, array) => line.length > 0 || (index > 0 && array[index - 1].length > 0));
};

class SimplePdfInstance implements PdfInstance {
  constructor(private readonly source: PdfSource) {}

  async toBlob(): Promise<Blob> {
    const lines = extractTextLines(this.source.html);
    const withTitle = this.source.includeTitle === false
      ? lines
      : [this.source.title, "", ...lines];
    const pdfContent = buildPdfDocument(withTitle);
    return new Blob([pdfContent], { type: "application/pdf" });
  }
}

export const pdf = (source: PdfSource): PdfInstance => new SimplePdfInstance(source);

export default pdf;
