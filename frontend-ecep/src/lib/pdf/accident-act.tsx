import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

export type AccidentActPdfData = {
  id: number | string | null | undefined;
  alumno?: string | null;
  seccion?: string | null;
  fecha?: string | null;
  hora?: string | null;
  lugar?: string | null;
  descripcion?: string | null;
  acciones?: string | null;
  creadoPor?: string | null;
  informante?: string | null;
  firmante?: string | null;
};

export type AccidentActPdfOptions = {
  statusLabel?: string;
  generatedAt?: string;
};

const actaPdfStyles = StyleSheet.create({
  page: {
    padding: 32,
    backgroundColor: "#f8fafc",
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 32,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#0f172a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 20,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#1d4ed8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  brandIconText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1.6,
    color: "#64748b",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 4,
  },
  statusPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    fontWeight: "bold",
    backgroundColor: "#fef3c7",
    color: "#b45309",
  },
  statusCerrada: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
  },
  highlight: {
    borderWidth: 1,
    borderColor: "rgba(59, 130, 246, 0.35)",
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },
  highlightLabel: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.6,
    color: "#1d4ed8",
    fontWeight: "bold",
  },
  highlightValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 6,
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#1e293b",
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  detailCard: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 6,
    marginBottom: 12,
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: "45%",
  },
  detailLabel: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    color: "#64748b",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0f172a",
    lineHeight: 1.4,
  },
  textBox: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 16,
    padding: 18,
    backgroundColor: "#ffffff",
  },
  textBoxEmpty: {
    backgroundColor: "#f8fafc",
  },
  textMuted: {
    color: "#94a3b8",
    fontStyle: "italic",
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.6,
    color: "#1e293b",
    marginBottom: 8,
  },
  signatureBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(37, 99, 235, 0.45)",
    borderRadius: 18,
    backgroundColor: "rgba(59, 130, 246, 0.06)",
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 12,
  },
  signatureIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1d4ed8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  signatureIconText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  signatureLine: {
    width: "70%",
    borderBottomWidth: 1.5,
    borderColor: "rgba(15, 23, 42, 0.45)",
    marginBottom: 12,
  },
  signatureName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  signatureRole: {
    fontSize: 9,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: "#475569",
    marginBottom: 8,
  },
  signatureNote: {
    fontSize: 9,
    color: "#64748b",
    textAlign: "center",
    maxWidth: 320,
  },
  footer: {
    marginTop: 28,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
    color: "#64748b",
  },
});

const textOrNull = (value: string | number | null | undefined): string | null => {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
};

const textOrFallback = (
  value: string | number | null | undefined,
  fallback = "—",
) => {
  return textOrNull(value) ?? fallback;
};

const renderTextBox = (value: string | null | undefined, emptyMessage: string) => {
  if (!value || value.trim().length === 0) {
    return (
      <View style={[actaPdfStyles.textBox, actaPdfStyles.textBoxEmpty]}>
        <Text style={[actaPdfStyles.paragraph, actaPdfStyles.textMuted]}>
          {emptyMessage}
        </Text>
      </View>
    );
  }

  const paragraphs = value.trim().split(/\n{2,}/);

  return (
    <View style={actaPdfStyles.textBox}>
      {paragraphs.map((paragraph, index) => {
        const lines = paragraph.split(/\n/);
        return (
          <Text key={index} style={actaPdfStyles.paragraph}>
            {lines.map((line, lineIndex) => (
              <Text key={lineIndex}>
                {line}
                {lineIndex < lines.length - 1 ? "\n" : ""}
              </Text>
            ))}
          </Text>
        );
      })}
    </View>
  );
};

export const createAccidentActDocument = (
  acta: AccidentActPdfData,
  { statusLabel, generatedAt }: AccidentActPdfOptions = {},
) => {
  const effectiveStatusLabel = statusLabel ?? "Borrador";
  const statusIsCerrada = effectiveStatusLabel.toLowerCase() === "cerrada";
  const idLabel = textOrFallback(acta.id, "S/D");
  const generatedLabel =
    generatedAt ??
    new Intl.DateTimeFormat("es-AR", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date());

  const primaryDetails = [
    {
      label: "Alumno",
      value: textOrFallback(acta.alumno, "Alumno sin registrar"),
    },
    { label: "Sección", value: textOrFallback(acta.seccion) },
    { label: "Fecha del suceso", value: textOrFallback(acta.fecha) },
    { label: "Hora", value: textOrFallback(acta.hora) },
    { label: "Lugar", value: textOrFallback(acta.lugar) },
    { label: "Estado", value: textOrFallback(effectiveStatusLabel) },
  ];

  const participantDetails = [
    { label: "Creada por", value: textOrNull(acta.creadoPor) },
    { label: "Informante", value: textOrNull(acta.informante) },
    { label: "Firmante", value: textOrNull(acta.firmante) },
  ].filter((detail): detail is { label: string; value: string } => {
    return detail.value != null;
  });

  const assignedSigner =
    textOrNull(acta.firmante) ?? "Pendiente de asignación";

  return (
    <Document title={`Acta de Accidente #${idLabel}`} author="Sistema escolar">
      <Page size="A4" style={actaPdfStyles.page}>
        <View style={actaPdfStyles.container}>
          <View style={actaPdfStyles.header}>
            <View style={actaPdfStyles.brand}>
              <View style={actaPdfStyles.brandIcon}>
                <Text style={actaPdfStyles.brandIconText}>🏫</Text>
              </View>
              <View>
                <Text style={actaPdfStyles.subtitle}>Registro institucional</Text>
                <Text style={actaPdfStyles.title}>
                  {`Acta de Accidente #${idLabel}`}
                </Text>
              </View>
            </View>
            <Text
              style={
                statusIsCerrada
                  ? [actaPdfStyles.statusPill, actaPdfStyles.statusCerrada]
                  : [actaPdfStyles.statusPill]
              }
            >
              {effectiveStatusLabel}
            </Text>
          </View>

          <View style={actaPdfStyles.highlight}>
            <Text style={actaPdfStyles.highlightLabel}>Alumno involucrado</Text>
            <Text style={actaPdfStyles.highlightValue}>
              {textOrFallback(acta.alumno, "Alumno sin registrar")}
            </Text>
          </View>

          <View style={actaPdfStyles.section}>
            <Text style={actaPdfStyles.sectionTitle}>Datos principales</Text>
            <View style={actaPdfStyles.detailGrid}>
              {primaryDetails.map((detail) => (
                <View key={detail.label} style={actaPdfStyles.detailCard}>
                  <Text style={actaPdfStyles.detailLabel}>{detail.label}</Text>
                  <Text style={actaPdfStyles.detailValue}>{detail.value}</Text>
                </View>
              ))}
            </View>
          </View>

          {participantDetails.length > 0 ? (
            <View style={actaPdfStyles.section}>
              <Text style={actaPdfStyles.sectionTitle}>Referentes del acta</Text>
              <View style={actaPdfStyles.detailGrid}>
                {participantDetails.map((detail) => (
                  <View key={detail.label} style={actaPdfStyles.detailCard}>
                    <Text style={actaPdfStyles.detailLabel}>{detail.label}</Text>
                    <Text style={actaPdfStyles.detailValue}>
                      {detail.value ?? "—"}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View style={actaPdfStyles.section}>
            <Text style={actaPdfStyles.sectionTitle}>Descripción del suceso</Text>
            {renderTextBox(
              textOrNull(acta.descripcion),
              "No se registró una descripción.",
            )}
          </View>

          <View style={actaPdfStyles.section}>
            <Text style={actaPdfStyles.sectionTitle}>Acciones realizadas</Text>
            {renderTextBox(
              textOrNull(acta.acciones),
              "No se registraron acciones.",
            )}
          </View>

          <View style={actaPdfStyles.section}>
            <Text style={actaPdfStyles.sectionTitle}>Firma de conformidad</Text>
            <View style={actaPdfStyles.signatureBox}>
              <View style={actaPdfStyles.signatureIcon}>
                <Text style={actaPdfStyles.signatureIconText}>✔</Text>
              </View>
              <View style={actaPdfStyles.signatureLine} />
              <Text style={actaPdfStyles.signatureName}>{assignedSigner}</Text>
              <Text style={actaPdfStyles.signatureRole}>
                Responsable / Firmante asignado
              </Text>
              <Text style={actaPdfStyles.signatureNote}>
                Al firmar, la persona responsable registrada en el sistema confirma
                la veracidad de la información asentada en el acta.
              </Text>
            </View>
          </View>

          <View style={actaPdfStyles.footer}>
            <Text>Generado el {generatedLabel}</Text>
            <Text>ID interno: {idLabel}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
