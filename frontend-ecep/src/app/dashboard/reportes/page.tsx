"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCalendarRefresh } from "@/hooks/useCalendarRefresh";
import { pageContent } from "@/lib/page-response";
import { DashboardLayout } from "@/app/dashboard/dashboard-layout";
import LoadingState from "@/components/common/LoadingState";
import { LicenseSummaryCards } from "./_components/LicenseSummaryCards";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  Download,
  GraduationCap,
  Users,
  TrendingUp,
  AlertCircle,
  X,
  Clock,
  Search,
  Calendar,
  Printer,
} from "lucide-react";
import {
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod";
import { asistencias, calendario, gestionAcademica, identidad, vidaEscolar } from "@/services/api/modules";
import {
  ActaAccidenteDTO,
  EmpleadoDTO,
  EstadoActaAccidente,
  LicenciaDTO,
  UserRole,
} from "@/types/api-generated";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { downloadPdfDocument, suggestPdfFileName } from "@/lib/pdf";
import type { PdfCreateCallback } from "@/lib/pdf";
import { renderAccidentActPdf } from "@/lib/pdf/accident-act";
import { fetchAlumnoExtendedInfo } from "../actas/_utils/alumno-info";
import {
  renderInstitutionalReport,
  type KeyValuePair,
  type ReportSection,
  type TableColumn,
} from "@/lib/pdf/report-helpers";

// -----------------------------------------------------------------------------
// Mock data (mantener hasta integrar API real en los demás reportes)
// -----------------------------------------------------------------------------

type BoletinSubjectGrade = {
  trimestreId: number;
  trimestreLabel: string;
  notaNumerica?: number | null;
  notaConceptual?: string | null;
  observaciones?: string | null;
};

type BoletinSubject = {
  id: string;
  name: string;
  teacher?: string | null;
  grades: BoletinSubjectGrade[];
};

type BoletinInforme = {
  trimestreId: number;
  trimestreLabel: string;
  descripcion: string;
};

type BoletinAttendance = {
  workingDays: number;
  attended: number;
  justified: number;
  unjustified: number;
};

type BoletinStudent = {
  id: string;
  matriculaId: number | null;
  alumnoId: number | null;
  name: string;
  section: string;
  sectionId: number;
  level: "Inicial" | "Primario";
  average?: number | null;
  attendancePercentage?: number | null;
  absencePercentage?: number | null;
  attendanceDetail?: BoletinAttendance | null;
  status?: string;
  subjects: BoletinSubject[];
  informes?: BoletinInforme[];
};

type BoletinSection = {
  id: number;
  label: string;
  level: "Inicial" | "Primario";
  students: BoletinStudent[];
};

const sanitizeTeacherName = (teacher?: string | null) => {
  if (!teacher) return null;
  const trimmed = String(teacher).trim();
  return trimmed && trimmed !== "—" ? trimmed : null;
};

const getBoletinGradeDisplay = (grade?: BoletinSubjectGrade | null) => {
  if (!grade) return "—";

  const conceptual = grade.notaConceptual?.trim();
  if (conceptual && conceptual !== "—") {
    return conceptual;
  }

  const numeric = typeof grade.notaNumerica === "number" ? grade.notaNumerica : null;
  if (numeric != null && Number.isFinite(numeric)) {
    return numeric.toFixed(1);
  }

  return "—";
};

type ApprovalSummary = {
  totalSubjects: number;
  approved: number;
  failed: number;
  subjectWithMoreFails: string;
  studentsWithPending: number;
};

type ApprovalRecord = {
  studentId: string;
  studentName: string;
  subject: string;
  grade: number;
  status: "APROBADO" | "DESAPROBADO";
  average: number;
  failedCount: number;
};

type ApprovalSection = {
  id: string;
  label: string;
  stats: {
    approved: number;
    failed: number;
    averageApprovedPerStudent: number;
  };
  records: ApprovalRecord[];
};

type AttendanceSummaryStudent = {
  id: string;
  name: string;
  total: number;
  presentes: number;
  ausentes: number;
  tarde: number;
  retiroAnticipado: number;
  attendance: number;
};

type AttendanceSummarySection = {
  sectionId: string;
  label: string;
  level: "Inicial" | "Primario";
  students: AttendanceSummaryStudent[];
  totalDays: number;
  attended: number;
};

type LicenseReportRow = {
  id: string;
  teacherId: number | null;
  teacherName: string;
  cargo?: string;
  situacion?: string;
  tipo: string;
  tipoLabel: string;
  start: string;
  end: string | null;
  startLabel: string;
  endLabel: string | null;
  rangeLabel: string;
  durationDays: number | null;
  horas: number | null;
  justificada: boolean;
  motivo: string;
  isActive: boolean;
  expiresSoon: boolean;
};

type ActaRegistro = {
  id: string;
  student: string;
  studentDni?: string | null;
  section: string;
  level: "Inicial" | "Primario";
  teacher: string;
  date: string;
  time: string;
  location: string;
  description: string;
  actions: string;
  signer?: string;
  signerDni?: string | null;
  signed: boolean;
  familyName?: string | null;
  familyDni?: string | null;
};

type CachedAlumnoInfo = {
  name: string;
  section: string;
  level: "Inicial" | "Primario";
  dni?: string | null;
  familyName?: string | null;
  familyDni?: string | null;
};

const APPROVAL_DATA = {
  summary: {
    totalSubjects: 0,
    approved: 0,
    failed: 0,
    subjectWithMoreFails: "Sin datos",
    studentsWithPending: 0,
  },
  sections: [] as ApprovalSection[],
};

const PIE_COLORS = ["#0ea5e9", "#fb7185", "#6366f1", "#22c55e"];

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const parseISO = (value: string) => new Date(`${value}T00:00:00`);

const withinRange = (value: string, from?: string, to?: string) => {
  const date = parseISO(value).getTime();
  if (from) {
    const fromDate = parseISO(from).getTime();
    if (date < fromDate) return false;
  }
  if (to) {
    const toDate = parseISO(to).getTime();
    if (date > toDate) return false;
  }
  return true;
};

const DAY_IN_MS = 1000 * 60 * 60 * 24;

const tipoLicenciaOptions = [
  { value: "ENFERMEDAD", label: "Enfermedad" },
  { value: "CUIDADO_FAMILIAR", label: "Cuidado familiar" },
  { value: "FORMACION", label: "Formación" },
  { value: "PERSONAL", label: "Motivo personal" },
  { value: "MATERNIDAD", label: "Maternidad / Paternidad" },
  { value: "OTRA", label: "Otra" },
];

const dateFormatter = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" });

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const parsed = parseISO(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return dateFormatter.format(parsed);
};

const formatTipoLicencia = (value?: string | null) => {
  if (!value) return "Sin tipo";
  const option = tipoLicenciaOptions.find((opt) => opt.value === value);
  if (option) return option.label;
  const normalized = value.replace(/_/g, " ").toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const toDateOrNull = (value?: string | null) => {
  if (!value) return null;
  const parsed = parseISO(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const startOfDay = (date: Date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const formatPercent = (value: number, digits = 0) =>
  `${(value * 100).toFixed(digits)}%`;


const computeAttendanceMetrics = (
  section: AttendanceSection,
  from?: string,
  to?: string,
) => {
  const students = section.students.map((student) => {
    const filtered = student.records.filter((r) => withinRange(r.date, from, to));
    const total = filtered.length;
    const attended = filtered.filter((r) => r.status === "ASISTIO").length;
    const justified = filtered.filter((r) => r.status === "JUSTIFICADA").length;
    const unjustified = filtered.filter((r) => r.status === "INJUSTIFICADA").length;
    const attendance = total ? attended / total : 0;
    return {
      id: student.id,
      name: student.name,
      total,
      attended,
      justified,
      unjustified,
      attendance,
    };
  });
  const totalDays = students.reduce((acc, cur) => acc + cur.total, 0);
  const attended = students.reduce((acc, cur) => acc + cur.attended, 0);
  return { students, totalDays, attended };
};

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default function ReportesPage() {
  const { hasRole, loading, user } = useAuth();
  const { periodoEscolarId } = useActivePeriod();
  const router = useRouter();
  const calendarVersion = useCalendarRefresh("trimestres");

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    const allowed =
      hasRole(UserRole.DIRECTOR) ||
      hasRole(UserRole.ADMIN) ||
      hasRole(UserRole.SECRETARY);

    if (!allowed) {
      router.replace("/dashboard");
    }
  }, [loading, user, hasRole, router]);

  const [tab, setTab] = useState<string>("boletines");
  const [exportingPdf, setExportingPdf] = useState(false);
  const [boletinSections, setBoletinSections] = useState<BoletinSection[]>([]);
  const [loadingBoletines, setLoadingBoletines] = useState<boolean>(true);
  const [boletinError, setBoletinError] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [activeBoletin, setActiveBoletin] = useState<BoletinStudent | null>(null);
  const [exportingBoletin, setExportingBoletin] = useState(false);
  const [empleadoMap, setEmpleadoMap] = useState<
    Record<
      number,
      { name: string; cargo?: string; situacion?: string; dni?: string | null }
    >
  >({});
  const [personalSummary, setPersonalSummary] = useState({
    total: 0,
    activos: 0,
    enLicencia: 0,
  });
  const [licenses, setLicenses] = useState<LicenciaDTO[]>([]);
  const [licenseLoading, setLicenseLoading] = useState(false);
  const [licenseError, setLicenseError] = useState<string | null>(null);
  const [licenseQuery, setLicenseQuery] = useState<string>("");
  const [licenseTypeFilter, setLicenseTypeFilter] = useState<string>("all");
  const [licenseJustificationFilter, setLicenseJustificationFilter] = useState<
    "all" | "justified" | "unjustified"
  >("all");
  const [licenseTeacherFilter, setLicenseTeacherFilter] = useState<string>("all");
  const [licenseFrom, setLicenseFrom] = useState<string>("");
  const [licenseTo, setLicenseTo] = useState<string>("");
  const [actaRegistros, setActaRegistros] = useState<ActaRegistro[]>([]);
  const [loadingActasRegistro, setLoadingActasRegistro] = useState(false);
  const [actaErrorMsg, setActaErrorMsg] = useState<string | null>(null);
  const actasCacheRef = useRef<ActaAccidenteDTO[] | null>(null);
  const alumnoCacheRef = useRef<Map<number, CachedAlumnoInfo>>(new Map());
  const lastActaPeriodoRef = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingBoletines(true);
        setBoletinError(null);

        const [
          seccionesRes,
          materiasRes,
          seccionMateriasRes,
          calificacionesRes,
          informesRes,
          trimestresRes,
        ] = await Promise.all([
          gestionAcademica.secciones.list(),
          gestionAcademica.materias.list(),
          gestionAcademica.seccionMaterias.list(),
          gestionAcademica.calificaciones.list(),
          gestionAcademica.informes.list(),
          calendario.trimestres.list(),
        ]);
        if (!alive) return;

        const seccionesRaw = seccionesRes.data ?? [];
        const materias = materiasRes.data ?? [];
        const seccionMaterias = seccionMateriasRes.data ?? [];
        const calificaciones = calificacionesRes.data ?? [];
        const informes = informesRes.data ?? [];
        const trimestres = (trimestresRes.data ?? []).sort(
          (a: any, b: any) => (a.orden ?? 0) - (b.orden ?? 0),
        );

        const trimestreMap = new Map<number, string>();
        trimestres.forEach((t: any, index) => {
          const label = t.orden ? `Trimestre ${t.orden}` : `Trimestre ${index + 1}`;
          trimestreMap.set(t.id, label);
        });

        const materiaMap = new Map<number, any>();
        materias.forEach((m: any) => {
          materiaMap.set(m.id, m);
        });

        const seccionMateriasBySeccion = new Map<number, any[]>();
        seccionMaterias.forEach((sm: any) => {
          const sid = sm.seccionId ?? sm.seccion?.id;
          if (!sid) return;
          if (!seccionMateriasBySeccion.has(sid)) {
            seccionMateriasBySeccion.set(sid, []);
          }
          seccionMateriasBySeccion.get(sid)!.push(sm);
        });

        const seccionesFiltradas = seccionesRaw.filter((sec: any) => {
          const nivel = String(sec.nivel ?? "").toUpperCase();
          if (!(nivel === "PRIMARIO" || nivel === "INICIAL")) return false;
          if (!periodoEscolarId) return true;
          const periodoSec =
            sec.periodoEscolarId ?? sec.periodoId ?? sec.periodoEscolar?.id;
          return !periodoSec || periodoSec === periodoEscolarId;
        });

        const alumnosBySeccion = new Map<number, any[]>();
        await Promise.all(
          seccionesFiltradas.map(async (sec: any) => {
            try {
              const { data } = await gestionAcademica.secciones.alumnos(sec.id);
              if (!alive) return;
              alumnosBySeccion.set(sec.id, data ?? []);
            } catch (error) {
              console.error("No se pudo cargar alumnos de la sección", sec.id, error);
              if (!alive) return;
              alumnosBySeccion.set(sec.id, []);
            }
          }),
        );

        const sections: BoletinSection[] = seccionesFiltradas.map((sec: any) => {
          const nivelLiteral = String(sec.nivel ?? "").toUpperCase();
          const level: "Inicial" | "Primario" =
            nivelLiteral === "INICIAL" ? "Inicial" : "Primario";
          const label =
            `${sec.gradoSala ?? ""} ${sec.division ?? ""}`.trim() ||
            `Sección #${sec.id}`;
          const studentsLite = alumnosBySeccion.get(sec.id) ?? [];
          const sectionMateriasList = seccionMateriasBySeccion.get(sec.id) ?? [];

          const students: BoletinStudent[] = studentsLite.map((student: any) => {
            const matriculaId = student.matriculaId ?? student.id ?? null;
            const alumnoId = student.alumnoId ?? null;
            const studentName =
              student.nombreCompleto ??
              student.nombre ??
              `Alumno #${alumnoId ?? matriculaId ?? ""}`.trim();

            if (level === "Primario") {
              const subjectEntries = sectionMateriasList
                .map((sm: any) => {
                  const smId = sm.id ?? sm.seccionMateriaId;
                  const subjectCalifs = calificaciones.filter(
                    (c: any) =>
                      c.matriculaId === matriculaId &&
                      c.seccionMateriaId === smId,
                  );
                  if (!subjectCalifs.length) return null;
                  const materia = materiaMap.get(
                    sm.materiaId ?? sm.materia?.id ?? sm.materiaId,
                  );
                  const grades = subjectCalifs
                    .map((calif: any) => {
                      const trimestreId = calif.trimestreId;
                      return {
                        trimestreId,
                        trimestreLabel:
                          trimestreMap.get(trimestreId) ??
                          `Trimestre ${trimestreId ?? ""}`,
                        notaNumerica: calif.notaNumerica ?? null,
                        notaConceptual: calif.notaConceptual ?? null,
                        observaciones: calif.observaciones ?? null,
                      } as BoletinSubjectGrade;
                    })
                    .sort((a, b) => a.trimestreId - b.trimestreId);

                  return {
                    id: String(smId),
                    name:
                      materia?.nombre ?? `Materia #${sm.materiaId ?? smId ?? ""}`,
                    teacher: null,
                    grades,
                  } as BoletinSubject;
                })
                .filter(Boolean) as BoletinSubject[];

              const numericGrades = subjectEntries
                .flatMap((subject) => subject.grades.map((g) => g.notaNumerica))
                .filter((grade): grade is number => typeof grade === "number");

              const average = numericGrades.length
                ? numericGrades.reduce((sum, val) => sum + val, 0) /
                  numericGrades.length
                : null;

              const status = subjectEntries.length
                ? typeof average === "number"
                  ? average >= 6
                    ? "Promociona"
                    : "No Promociona"
                  : "Sin promedio"
                : "Sin calificaciones";

              return {
                id: `${sec.id}-${matriculaId ?? alumnoId ?? studentName}`,
                matriculaId,
                alumnoId,
                name: studentName,
                section: label,
                sectionId: sec.id,
                level,
                average,
                attendancePercentage: null,
                absencePercentage: null,
                attendanceDetail: null,
                status,
                subjects: subjectEntries,
              };
            }

            const informesAlumno = informes
              .filter((inf: any) => inf.matriculaId === matriculaId)
              .map((inf: any) => ({
                trimestreId: inf.trimestreId,
                trimestreLabel:
                  trimestreMap.get(inf.trimestreId) ??
                  `Trimestre ${inf.trimestreId ?? ""}`,
                descripcion: inf.descripcion ?? "",
              }))
              .sort((a, b) => a.trimestreId - b.trimestreId);

            return {
              id: `${sec.id}-${matriculaId ?? alumnoId ?? studentName}`,
              matriculaId,
              alumnoId,
              name: studentName,
              section: label,
              sectionId: sec.id,
              level,
              subjects: [],
              informes: informesAlumno,
              average: null,
              attendanceDetail: null,
              attendancePercentage: null,
              absencePercentage: null,
              status: informesAlumno.length ? "Con informes" : "Sin informes",
            };
          });

        const orderedStudents = students.sort((a, b) =>
          a.name.localeCompare(b.name, "es"),
        );

          return {
            id: sec.id,
            label,
            level,
            students: orderedStudents,
          };
        });

        if (!alive) return;
        const orderedSections = sections.sort((a, b) =>
          a.label.localeCompare(b.label, "es"),
        );
        setBoletinSections(orderedSections);
      } catch (error: any) {
        if (!alive) return;
        console.error("Error cargando boletines", error);
        setBoletinSections([]);
        setBoletinError(
          error?.response?.data?.message ??
            error?.message ??
            "No se pudieron cargar los boletines.",
        );
      } finally {
        if (alive) setLoadingBoletines(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [periodoEscolarId, calendarVersion]);

  // Boletines state -----------------------------------------------------------
  useEffect(() => {
    if (loadingBoletines) return;
    if (boletinSections.length === 0) {
      setSelectedSectionId("");
      return;
    }
    setSelectedSectionId((prev) => {
      if (prev && boletinSections.some((section) => String(section.id) === prev)) {
        return prev;
      }
      return String(boletinSections[0].id);
    });
  }, [loadingBoletines, boletinSections]);

  const approvalData = useMemo(() => {
    if (!boletinSections.length) return APPROVAL_DATA;

    const primarioSections = boletinSections.filter(
      (section) => section.level === "Primario",
    );

    if (!primarioSections.length) return APPROVAL_DATA;

    let totalApproved = 0;
    let totalFailed = 0;
    let studentsWithPending = 0;
    const subjectFails = new Map<string, number>();

    const sections = primarioSections.map((section) => {
      const studentFailCounts = new Map<string, number>();
      const sectionRecords: ApprovalRecord[] = [];

      section.students.forEach((student) => {
        let studentFails = 0;

        student.subjects.forEach((subject) => {
          const numericGrades = subject.grades
            .map((grade) => grade.notaNumerica)
            .filter((grade): grade is number => typeof grade === "number");

          if (!numericGrades.length) return;

          const lastGrade = numericGrades[numericGrades.length - 1];
          const status = lastGrade >= 6 ? "APROBADO" : "DESAPROBADO";

          if (status === "APROBADO") {
            totalApproved += 1;
          } else {
            totalFailed += 1;
            studentFails += 1;
            subjectFails.set(
              subject.name,
              (subjectFails.get(subject.name) ?? 0) + 1,
            );
          }

          sectionRecords.push({
            studentId: student.id,
            studentName: student.name,
            subject: subject.name,
            grade: lastGrade,
            status,
            average: typeof student.average === "number" ? student.average : 0,
            failedCount: 0,
          });
        });

        studentFailCounts.set(student.id, studentFails);
        if (studentFails > 0) studentsWithPending += 1;
      });

      const enrichedRecords = sectionRecords.map((record) => ({
        ...record,
        failedCount: studentFailCounts.get(record.studentId) ?? 0,
      }));

      const sectionApproved = enrichedRecords.filter(
        (record) => record.status === "APROBADO",
      ).length;
      const sectionFailed = enrichedRecords.length - sectionApproved;

      return {
        id: String(section.id),
        label: section.label,
        stats: {
          approved: sectionApproved,
          failed: sectionFailed,
          averageApprovedPerStudent:
            section.students.length > 0
              ? sectionApproved / section.students.length
              : 0,
        },
        records: enrichedRecords,
      } satisfies ApprovalSection;
    });

    const subjectWithMoreFails = [...subjectFails.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ??
      (sections.length ? "Sin datos" : "");

    const summary: ApprovalSummary = {
      totalSubjects: totalApproved + totalFailed,
      approved: totalApproved,
      failed: totalFailed,
      subjectWithMoreFails,
      studentsWithPending,
    };

    return { summary, sections };
  }, [boletinSections]);

  useEffect(() => {
    if (approvalData.sections.length === 0) {
      setSelectedApprovalSection(null);
      return;
    }
    setSelectedApprovalSection((prev) => {
      if (prev && approvalData.sections.some((section) => section.id === prev)) {
        return prev;
      }
      return approvalData.sections[0].id;
    });
  }, [approvalData.sections]);

  const approvalSummary = approvalData.summary;
  const totalApprovalSubjects = approvalSummary.totalSubjects;
  const overallPieData = [
    { name: "Aprobadas", value: approvalSummary.approved },
    { name: "Desaprobadas", value: approvalSummary.failed },
  ];

  const availableSections = useMemo(
    () =>
      boletinSections.map((section) => ({
        id: String(section.id),
        label: section.label,
        level: section.level,
      })),
    [boletinSections],
  );

  const boletinStudents = useMemo(() => {
    const section = boletinSections.find(
      (s) => String(s.id) === selectedSectionId,
    );
    return section?.students ?? [];
  }, [boletinSections, selectedSectionId]);

  const boletinTableData = useMemo(() => {
    if (!activeBoletin || activeBoletin.level !== "Primario") {
      return {
        trimesters: [] as { id: number; label: string }[],
        subjects: [] as BoletinSubject[],
      };
    }

    const trimesterMap = new Map<number, string>();

    activeBoletin.subjects.forEach((subject) => {
      subject.grades.forEach((grade) => {
        if (!trimesterMap.has(grade.trimestreId)) {
          trimesterMap.set(grade.trimestreId, grade.trimestreLabel);
        }
      });
    });

    const trimesters = Array.from(trimesterMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([id, label]) => ({ id, label }));

    return {
      trimesters,
      subjects: activeBoletin.subjects,
    };
  }, [activeBoletin]);

  const boletinTrimesters = boletinTableData.trimesters;
  const boletinSubjectsForTable = boletinTableData.subjects;

  const handlePrintBoletin = useCallback(async () => {
    if (!activeBoletin) return;

    const legajo = activeBoletin.matriculaId ?? activeBoletin.alumnoId;
    const legajoLabel = legajo != null ? String(legajo) : "—";
    const attendanceLabel =
      typeof activeBoletin.attendancePercentage === "number"
        ? formatPercent(activeBoletin.attendancePercentage, 1)
        : "Sin datos";
    const averageLabel =
      typeof activeBoletin.average === "number"
        ? activeBoletin.average.toFixed(1)
        : "Sin datos";
    const title = `Resumen de boletín – ${activeBoletin.name}`;
    const generatedAt = new Intl.DateTimeFormat("es-AR", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date());

    const details = [
      { label: "Alumno", value: activeBoletin.name },
      { label: "Legajo", value: legajoLabel },
      { label: "Sección", value: activeBoletin.section },
      { label: "Nivel", value: activeBoletin.level },
      { label: "Promedio general", value: averageLabel },
      { label: "Asistencia promedio", value: attendanceLabel },
      {
        label: "Materias registradas",
        value: String(activeBoletin.subjects.length),
      },
    ];

    const attendanceDetailPairs = activeBoletin.attendanceDetail
      ? [
          {
            label: "Días hábiles",
            value: String(activeBoletin.attendanceDetail.workingDays),
          },
          {
            label: "Asistidos",
            value: String(activeBoletin.attendanceDetail.attended),
          },
          {
            label: "Justificadas",
            value: String(activeBoletin.attendanceDetail.justified),
          },
          {
            label: "Injustificadas",
            value: String(activeBoletin.attendanceDetail.unjustified),
          },
        ]
      : null;

    const sections: ReportSection[] = [
      { type: "keyValue", title: "Datos generales", pairs: details },
    ];

    if (attendanceDetailPairs) {
      sections.push({
        type: "keyValue",
        title: "Detalle de asistencia",
        pairs: attendanceDetailPairs,
      });
    }

    if (boletinSubjectsForTable.length && boletinTrimesters.length) {
      const tableColumns: TableColumn[] = [
        { label: "Materia", width: "wide" },
        ...boletinTrimesters.map((trimester) => ({ label: trimester.label })),
      ];

      const tableRows = boletinSubjectsForTable.map((subject) => {
        const displayTeacher = sanitizeTeacherName(subject.teacher);
        const teacherLabel = displayTeacher ? `\nDocente: ${displayTeacher}` : "";
        const subjectCell = `${subject.name}${teacherLabel}`;

        const trimesterCells = boletinTrimesters.map((trimester) => {
          const grade = subject.grades.find((g) => g.trimestreId === trimester.id);
          const gradeValue = getBoletinGradeDisplay(grade);

          return gradeValue;
        });

        return [subjectCell, ...trimesterCells];
      });

      sections.push({
        type: "table",
        title: "Calificaciones por trimestre",
        columns: tableColumns,
        rows: tableRows,
      });
    }

    try {
      setExportingBoletin(true);
      await downloadPdfDocument({
        create: (doc) =>
          renderInstitutionalReport(doc, {
            title: "Resumen de boletín",
            subtitle: activeBoletin.name,
            sections,
            footer: `Generado el ${generatedAt}`,
            metadataTitle: title,
          }),
        fileName: suggestPdfFileName(title),
        options: {
          orientation: "landscape",
        },
      });
      toast.success("Resumen del boletín listo para imprimir.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo generar el resumen del boletín.";
      toast.error(message);
    } finally {
      setExportingBoletin(false);
    }
  }, [activeBoletin, boletinSubjectsForTable, boletinTrimesters]);

  const isActiveBoletinPrimario = activeBoletin?.level === "Primario";

  useEffect(() => {
    boletinSections.forEach((section) => {
      section.students.forEach((student) => {
        if (student.alumnoId != null) {
          const prev = alumnoCacheRef.current.get(student.alumnoId);
          alumnoCacheRef.current.set(student.alumnoId, {
            name: student.name,
            section: student.section,
            level: student.level,
            dni: prev?.dni ?? null,
            familyName: prev?.familyName ?? null,
            familyDni: prev?.familyDni ?? null,
          });
        }
      });
    });
  }, [boletinSections]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await identidad.empleados.list();
        if (!alive) return;
        const empleados = pageContent<EmpleadoDTO>(res.data);
        const personaIds = Array.from(
          new Set<number>(empleados.map((emp: any) => emp.personaId).filter(Boolean)),
        );

        const entries = await Promise.all(
          personaIds.map(async (pid) => {
            try {
              const { data } = await identidad.personasCore.getById(pid);
              return [pid, data] as const;
            } catch {
              return [pid, null] as const;
            }
          }),
        );
        if (!alive) return;
        const personaMap = new Map<number, any>(entries as any);

        const map: Record<
          number,
          { name: string; cargo?: string; situacion?: string; dni?: string | null }
        > = {};
        let activos = 0;
        let enLicencia = 0;

        empleados.forEach((emp) => {
          if (typeof emp.id !== "number") return;
          const persona = personaMap.get(emp.personaId ?? 0);
          const nombre = `${persona?.apellido ?? ""} ${persona?.nombre ?? ""}`
            .trim()
            .replace(/\s+/g, " ");
          const situacion = emp.situacionActual ?? undefined;
          const normalized = (situacion ?? "").toLowerCase();
          if (normalized.includes("licencia")) {
            enLicencia += 1;
          } else if (normalized.includes("activo")) {
            activos += 1;
          }

          map[emp.id] = {
            name: nombre || `Empleado #${emp.id}`,
            cargo: emp.cargo ?? undefined,
            situacion,
            dni: persona?.dni ?? null,
          };
        });

        setEmpleadoMap(map);
        setPersonalSummary({
          total: empleados.length,
          activos,
          enLicencia,
        });
      } catch (error) {
        console.error("Error cargando empleados", error);
        setEmpleadoMap({});
        setPersonalSummary({ total: 0, activos: 0, enLicencia: 0 });
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    setActiveBoletin(null);
  }, [selectedSectionId]);

  // Aprobación ----------------------------------------------------------------
  const [selectedApprovalSection, setSelectedApprovalSection] = useState<string | null>(null);
  const [approvalSort, setApprovalSort] = useState<"nombre" | "promedio" | "desaprobadas">(
    "nombre",
  );

  const approvalOverview = useMemo(() => {
    const section = approvalData.sections.find(
      (s) => s.id === selectedApprovalSection,
    );
    if (!section) return undefined;

    const aggregated = section.records.reduce<Record<string, ApprovalRecord[]>>(
      (acc, record) => {
        acc[record.studentId] = acc[record.studentId] || [];
        acc[record.studentId].push(record);
        return acc;
      },
    {});

    const flattened = Object.values(aggregated).flat();

    const sorted = [...flattened].sort((a, b) => {
      if (approvalSort === "nombre")
        return a.studentName.localeCompare(b.studentName);
      if (approvalSort === "promedio") return b.average - a.average;
      return b.failedCount - a.failedCount;
    });

    const chartData = [
      { name: "Aprobadas", value: section.stats.approved },
      { name: "Desaprobadas", value: section.stats.failed },
    ];

    return { section, sorted, chartData };
  }, [approvalSort, selectedApprovalSection]);

  // Asistencias ---------------------------------------------------------------
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const defaultFromIso = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const [attendanceFrom, setAttendanceFrom] = useState<string>(defaultFromIso);
  const [attendanceTo, setAttendanceTo] = useState<string>(todayIso);
  const [selectedAttendanceSections, setSelectedAttendanceSections] = useState<string[]>([]);
  const [attendancePopoverOpen, setAttendancePopoverOpen] = useState(false);
  const [attendanceSummaries, setAttendanceSummaries] = useState<AttendanceSummarySection[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  const attendanceSectionOptions = useMemo(
    () =>
      boletinSections.map((section) => ({
        id: String(section.id),
        label: section.label,
        level: section.level,
      })),
    [boletinSections],
  );

  useEffect(() => {
    if (attendanceSectionOptions.length === 0) {
      setSelectedAttendanceSections([]);
      return;
    }
    setSelectedAttendanceSections((prev) => {
      const filtered = prev.filter((id) =>
        attendanceSectionOptions.some((option) => option.id === id),
      );
      if (filtered.length) return filtered;
      return [attendanceSectionOptions[0].id];
    });
  }, [attendanceSectionOptions]);

  useEffect(() => {
    if (!selectedAttendanceSections.length) {
      setAttendanceSummaries([]);
      return;
    }
    if (!attendanceFrom || !attendanceTo) return;

    let alive = true;
    (async () => {
      try {
        setLoadingAttendance(true);
        setAttendanceError(null);

        const summaries: AttendanceSummarySection[] = [];
        for (const sectionId of selectedAttendanceSections) {
          const sectionMeta = attendanceSectionOptions.find((option) => option.id === sectionId);
          if (!sectionMeta) continue;

          const { data } = await asistencias.secciones.resumenPorAlumno(
            Number(sectionId),
            attendanceFrom,
            attendanceTo,
          );
          if (!alive) return;

          const students = (data ?? []).map((dto) => {
            const total = (dto as any).total ?? dto.totalClases ?? 0;
            const presentes = dto.presentes ?? 0;
            const ausentes = dto.ausentes ?? 0;
            const tarde = dto.tarde ?? 0;
            const retiroAnticipado = dto.retiroAnticipado ?? 0;
            const attendanceRatio =
              total > 0
                ? dto.porcentaje != null
                  ? dto.porcentaje / 100
                  : presentes / total
                : 0;
            return {
              id: `${sectionId}-${dto.alumnoId ?? dto.matriculaId ?? Math.random()}`,
              name:
                dto.nombreCompleto ??
                `Alumno #${dto.alumnoId ?? dto.matriculaId ?? ""}`.trim(),
              total,
              presentes,
              ausentes,
              tarde,
              retiroAnticipado,
              attendance: attendanceRatio,
            } satisfies AttendanceSummaryStudent;
          });

          const totalDays = students.reduce((acc, cur) => acc + cur.total, 0);
          const attended = students.reduce((acc, cur) => acc + cur.presentes, 0);

          summaries.push({
            sectionId,
            label: sectionMeta.label,
            level: sectionMeta.level,
            students,
            totalDays,
            attended,
          });
        }

        if (!alive) return;
        setAttendanceSummaries(summaries);
      } catch (error: any) {
        if (!alive) return;
        console.error("Error cargando asistencia", error);
        setAttendanceError(
          error?.response?.data?.message ??
            error?.message ??
            "No se pudo cargar la asistencia.",
        );
        setAttendanceSummaries([]);
      } finally {
        if (alive) setLoadingAttendance(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [
    attendanceFrom,
    attendanceSectionOptions,
    attendanceTo,
    selectedAttendanceSections,
  ]);

  const attendanceLevelSummary = useMemo(() => {
    const levels: Record<string, { totalDays: number; attended: number }> = {};
    attendanceSummaries.forEach((summary) => {
      const key = summary.level;
      levels[key] = levels[key] || { totalDays: 0, attended: 0 };
      levels[key].totalDays += summary.totalDays;
      levels[key].attended += summary.attended;
    });
    return levels;
  }, [attendanceSummaries]);

  const attendanceSelectedSummaries = useMemo(
    () =>
      selectedAttendanceSections
        .map((sectionId) =>
          attendanceSummaries.find((summary) => summary.sectionId === sectionId),
        )
        .filter((summary): summary is AttendanceSummarySection => Boolean(summary)),
    [attendanceSummaries, selectedAttendanceSections],
  );
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLicenseLoading(true);
        setLicenseError(null);
        const res = await identidad.licencias.list();
        if (!alive) return;
        setLicenses((res.data ?? []) as LicenciaDTO[]);
      } catch (error: any) {
        if (!alive) return;
        console.error("Error cargando licencias", error);
        setLicenseError(
          error?.response?.data?.message ??
            error?.message ??
            "No se pudieron cargar las licencias.",
        );
        setLicenses([]);
      } finally {
        if (alive) setLicenseLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const licenseRows = useMemo(() => {
    if (!licenses.length) return [] as LicenseReportRow[];
    const todayMs = startOfDay(new Date()).getTime();
    return licenses
      .map((licencia) => {
        const teacherId =
          typeof licencia.empleadoId === "number" ? licencia.empleadoId : null;
        const teacherInfo = teacherId != null ? empleadoMap[teacherId] : undefined;
        const teacherName =
          teacherInfo?.name ??
          (teacherId != null ? `Empleado #${teacherId}` : "Sin docente asignado");
        const start = licencia.fechaInicio ?? "";
        const end = licencia.fechaFin ?? null;
        const startDate = toDateOrNull(start);
        const endDate = toDateOrNull(end ?? undefined);
        const startMs = startDate ? startOfDay(startDate).getTime() : null;
        const endMs = endDate ? startOfDay(endDate).getTime() : null;
        const isActive =
          startMs != null &&
          startMs <= todayMs &&
          (endMs == null || endMs >= todayMs);
        const expiresSoon =
          isActive && endMs != null && endMs >= todayMs && endMs - todayMs <= 7 * DAY_IN_MS;
        const durationDays =
          startMs != null && endMs != null
            ? Math.max(1, Math.round((endMs - startMs) / DAY_IN_MS) + 1)
            : null;
        const startLabel = formatDate(start) || "Sin inicio";
        const endLabel = end ? formatDate(end) : null;
        const rangeLabel = endLabel ? `${startLabel} al ${endLabel}` : startLabel;

        return {
          id: String(licencia.id ?? `${start}-${teacherId ?? "s/d"}`),
          teacherId,
          teacherName,
          cargo: teacherInfo?.cargo,
          situacion: teacherInfo?.situacion,
          tipo: licencia.tipoLicencia ?? "",
          tipoLabel: formatTipoLicencia(licencia.tipoLicencia),
          start,
          end,
          startLabel,
          endLabel,
          rangeLabel,
          durationDays,
          horas: typeof licencia.horasAusencia === "number" ? licencia.horasAusencia : null,
          justificada: licencia.justificada === true,
          motivo: licencia.motivo ?? "",
          isActive,
          expiresSoon,
        } satisfies LicenseReportRow;
      })
      .sort((a, b) => (b.start || "").localeCompare(a.start || ""));
  }, [licenses, empleadoMap]);

  const licenseTeacherOptions = useMemo(() => {
    const entries = new Map<string, string>();
    licenseRows.forEach((row) => {
      if (row.teacherId != null) {
        entries.set(String(row.teacherId), row.teacherName);
      }
    });
    return Array.from(entries.entries()).sort((a, b) =>
      a[1].localeCompare(b[1], "es", { sensitivity: "base" }),
    );
  }, [licenseRows]);

  const licenseTypeData = useMemo(() => {
    const counts = new Map<string, number>();
    licenseRows.forEach((row) => {
      const key = row.tipoLabel || "Sin tipo";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  }, [licenseRows]);

  const topLicenseTypes = useMemo(
    () => [...licenseTypeData].sort((a, b) => b.value - a.value).slice(0, 4),
    [licenseTypeData],
  );

  const activeLicenses = useMemo(
    () => licenseRows.filter((row) => row.isActive).length,
    [licenseRows],
  );

  const expiringLicenses = useMemo(
    () => licenseRows.filter((row) => row.expiresSoon).length,
    [licenseRows],
  );

  const filteredLicenses = useMemo(() => {
    const normalizedQuery = licenseQuery.trim().toLowerCase();
    return licenseRows.filter((row) => {
      if (licenseTypeFilter !== "all" && row.tipo !== licenseTypeFilter) return false;
      if (licenseTeacherFilter !== "all") {
        if (row.teacherId == null || String(row.teacherId) !== licenseTeacherFilter) {
          return false;
        }
      }
      if (licenseJustificationFilter === "justified" && !row.justificada) return false;
      if (licenseJustificationFilter === "unjustified" && row.justificada) return false;
      if (licenseFrom || licenseTo) {
        const startValue = row.start;
        if (!startValue) return false;
        if (!withinRange(startValue, licenseFrom || undefined, licenseTo || undefined)) {
          return false;
        }
      }
      if (normalizedQuery.length > 0) {
        const haystack = `${row.teacherName} ${row.motivo}`.toLowerCase();
        if (!haystack.includes(normalizedQuery)) return false;
      }
      return true;
    });
  }, [
    licenseRows,
    licenseTypeFilter,
    licenseTeacherFilter,
    licenseJustificationFilter,
    licenseFrom,
    licenseTo,
    licenseQuery,
  ]);

  const licenseFiltersActive = useMemo(
    () =>
      Boolean(
        licenseQuery.trim().length > 0 ||
          licenseTypeFilter !== "all" ||
          licenseJustificationFilter !== "all" ||
          licenseTeacherFilter !== "all" ||
          licenseFrom ||
          licenseTo,
      ),
    [
      licenseQuery,
      licenseTypeFilter,
      licenseJustificationFilter,
      licenseTeacherFilter,
      licenseFrom,
      licenseTo,
    ],
  );

  useEffect(() => {
    let alive = true;

    const loadActas = async () => {
      try {
        setLoadingActasRegistro(true);
        setActaErrorMsg(null);

        const currentPeriodo = periodoEscolarId ?? null;
        if (lastActaPeriodoRef.current !== currentPeriodo) {
          lastActaPeriodoRef.current = currentPeriodo;
          actasCacheRef.current = null;
        }

        if (!actasCacheRef.current) {
          const { data } = await vidaEscolar.actasAccidente.list();
          if (!alive) return;
          actasCacheRef.current = data ?? [];
        }

        const actas = actasCacheRef.current ?? [];
        if (!actas.length) {
          if (alive) setActaRegistros([]);
          return;
        }

        const missingAlumnoIds = actas
          .map((acta) => acta.alumnoId ?? null)
          .filter(
            (alumnoId): alumnoId is number =>
              Boolean(alumnoId) && !alumnoCacheRef.current.has(alumnoId),
          );

        if (missingAlumnoIds.length) {
          const uniqueIds = Array.from(new Set(missingAlumnoIds));
          const infoMap = await fetchAlumnoExtendedInfo(uniqueIds);
          uniqueIds.forEach((alumnoId) => {
            const info = infoMap.get(alumnoId) ?? null;
            const prev = alumnoCacheRef.current.get(alumnoId) ?? null;
            const name = info?.name ?? prev?.name ?? `Alumno #${alumnoId}`;
            const section =
              (info?.section ?? prev?.section ?? "").trim() ||
              "Sin sección asignada";
            const level = info?.level ?? prev?.level ?? "Primario";
            alumnoCacheRef.current.set(alumnoId, {
              name,
              section,
              level,
              dni: info?.dni ?? prev?.dni ?? null,
              familyName: info?.familiarName ?? prev?.familyName ?? null,
              familyDni: info?.familiarDni ?? prev?.familyDni ?? null,
            });
          });
        }

        const registros: ActaRegistro[] = actas.map((acta) => {
          const alumnoInfo = acta.alumnoId
            ? alumnoCacheRef.current.get(acta.alumnoId)
            : undefined;
          const signer = acta.firmanteId ? empleadoMap[acta.firmanteId] : undefined;

          return {
            id: String(acta.id),
            student: alumnoInfo?.name ?? `Alumno #${acta.alumnoId ?? "S/D"}`,
            studentDni: alumnoInfo?.dni ?? null,
            section: alumnoInfo?.section ?? "Sin sección asignada",
            level: alumnoInfo?.level ?? "Primario",
            teacher: signer?.name ?? "Pendiente de asignación",
            date: acta.fechaSuceso ?? "—",
            time: acta.horaSuceso ?? "—",
            location: acta.lugar ?? "—",
            description: acta.descripcion ?? "Sin descripción registrada.",
            actions: acta.acciones ?? "Sin acciones registradas.",
            signer: signer?.name,
            signerDni: signer?.dni ?? null,
            signed: acta.estado === EstadoActaAccidente.FIRMADA,
            familyName: alumnoInfo?.familyName ?? null,
            familyDni: alumnoInfo?.familyDni ?? null,
          } satisfies ActaRegistro;
        });

        if (!alive) return;
        setActaRegistros(registros);
      } catch (error: any) {
        if (!alive) return;
        console.error("Error cargando actas", error);
        setActaErrorMsg(
          error?.response?.data?.message ??
            error?.message ??
            "No se pudieron cargar las actas.",
        );
        setActaRegistros([]);
        actasCacheRef.current = null;
      } finally {
        if (alive) setLoadingActasRegistro(false);
      }
    };

    loadActas();

    return () => {
      alive = false;
    };
  }, [boletinSections, empleadoMap, periodoEscolarId]);


  // Actas ---------------------------------------------------------------------
  const [actaFrom, setActaFrom] = useState<string>("");
  const [actaTo, setActaTo] = useState<string>("");
  const [actaLevel, setActaLevel] = useState<"Todos" | "Inicial" | "Primario">(
    "Todos",
  );
  const [actaSection, setActaSection] = useState<"all" | string>("all");
  const [actaStudentQuery, setActaStudentQuery] = useState<string>("");
  const [activeActa, setActiveActa] = useState<ActaRegistro | null>(null);
  const [exportingActaId, setExportingActaId] = useState<number | null>(null);

  const filteredActas = useMemo(() => {
    const filtered = actaRegistros.filter((acta) => {
      if (!withinRange(acta.date, actaFrom, actaTo)) return false;
      if (actaLevel !== "Todos" && acta.level !== actaLevel) return false;
      if (actaSection !== "all" && acta.section !== actaSection) return false;
      if (
        actaStudentQuery &&
        !acta.student.toLowerCase().includes(actaStudentQuery.toLowerCase())
      )
        return false;
      return true;
    });

    return filtered
      .slice()
      .sort((a, b) => {
        const dateDiff = (b.date ?? "").localeCompare(a.date ?? "");
        if (dateDiff !== 0) return dateDiff;
        return (b.time ?? "").localeCompare(a.time ?? "");
      });
  }, [actaFrom, actaLevel, actaRegistros, actaSection, actaStudentQuery, actaTo]);

  useEffect(() => {
    setActaSection((prev) => {
      if (prev === "all") return prev;
      return actaRegistros.some((acta) => acta.section === prev) ? prev : "all";
    });
  }, [actaRegistros]);

  // Export --------------------------------------------------------------------
  const reportRefs = {
    boletines: useRef<HTMLDivElement>(null),
    aprobacion: useRef<HTMLDivElement>(null),
    asistencias: useRef<HTMLDivElement>(null),
    licencias: useRef<HTMLDivElement>(null),
    actas: useRef<HTMLDivElement>(null),
  } as const;

  
const buildCurrentReportRenderer = (title: string): PdfCreateCallback | null => {
  const generatedAt = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());

  if (tab === "boletines") {
    const totalSections = boletinSections.length;
    const totalStudents = boletinSections.reduce(
      (acc, section) => acc + section.students.length,
      0,
    );
    const attendanceValues = boletinSections
      .flatMap((section) =>
        section.students
          .map((student) =>
            typeof student.attendancePercentage === "number"
              ? student.attendancePercentage
              : null,
          )
          .filter((value): value is number => value != null),
      );
    const attendanceAverage = attendanceValues.length
      ? attendanceValues.reduce((acc, value) => acc + value, 0) /
        attendanceValues.length
      : null;

    const summaryPairs: KeyValuePair[] = [
      { label: "Secciones incluidas", value: String(totalSections) },
      { label: "Estudiantes relevados", value: String(totalStudents) },
      {
        label: "Promedio general de asistencia",
        value:
          attendanceAverage != null
            ? formatPercent(attendanceAverage, 1)
            : "Sin datos",
      },
    ];

    const sectionRows = boletinSections.map((section) => {
      const gradeValues = section.students
        .map((student) =>
          typeof student.average === "number" ? student.average : null,
        )
        .filter((value): value is number => value != null);
      const sectionAverageGrade = gradeValues.length
        ? (gradeValues.reduce((acc, value) => acc + value, 0) /
            gradeValues.length)
            .toFixed(1)
        : "Sin datos";

      const sectionAttendanceValues = section.students
        .map((student) =>
          typeof student.attendancePercentage === "number"
            ? student.attendancePercentage
            : null,
        )
        .filter((value): value is number => value != null);

      const sectionAttendanceAverage = sectionAttendanceValues.length
        ? formatPercent(
            sectionAttendanceValues.reduce((acc, value) => acc + value, 0) /
              sectionAttendanceValues.length,
            1,
          )
        : "Sin datos";

      return [
        section.label,
        section.level,
        String(section.students.length),
        sectionAverageGrade,
        sectionAttendanceAverage,
      ];
    });

    const sections: ReportSection[] = [
      { type: "keyValue", title: "Resumen general", pairs: summaryPairs },
    ];

    if (sectionRows.length > 0) {
      sections.push({
        type: "table",
        title: "Detalle por sección",
        columns: [
          { label: "Sección", width: "wide" },
          { label: "Nivel" },
          { label: "Estudiantes" },
          { label: "Promedio general" },
          { label: "Asistencia promedio" },
        ],
        rows: sectionRows,
      });
    }

    return (doc) =>
      renderInstitutionalReport(doc, {
        title,
        detail: `Generado el ${generatedAt}`,
        sections,
        footer: "Informe consolidado automáticamente por el sistema institucional.",
      });
  }

  if (tab === "aprobacion") {
    const summaryPairs: KeyValuePair[] = [
      {
        label: "Materias evaluadas",
        value: String(approvalSummary.totalSubjects),
      },
      { label: "Aprobadas", value: String(approvalSummary.approved) },
      { label: "Desaprobadas", value: String(approvalSummary.failed) },
      {
        label: "Materia con más desaprobaciones",
        value: approvalSummary.subjectWithMoreFails,
      },
      {
        label: "Alumnos con pendientes",
        value: String(approvalSummary.studentsWithPending),
      },
    ];

    const sectionRows = approvalData.sections.map((section) => [
      section.label,
      String(section.stats.approved),
      String(section.stats.failed),
      section.stats.averageApprovedPerStudent.toFixed(1),
    ]);

    const sections: ReportSection[] = [
      { type: "keyValue", title: "Resumen general", pairs: summaryPairs },
    ];

    if (sectionRows.length > 0) {
      sections.push({
        type: "table",
        title: "Estado por sección",
        columns: [
          { label: "Sección", width: "wide" },
          { label: "Aprobadas" },
          { label: "Desaprobadas" },
          { label: "Prom. aprobadas / alumno" },
        ],
        rows: sectionRows,
      });
    }

    return (doc) =>
      renderInstitutionalReport(doc, {
        title,
        detail: `Generado el ${generatedAt}`,
        sections,
        footer: "Datos basados en las calificaciones registradas en el período activo.",
      });
  }

  if (tab === "asistencias") {
    const rangeLabel = attendanceFrom || attendanceTo
      ? `${attendanceFrom ? formatDate(attendanceFrom) : "Inicio"} – ${
          attendanceTo ? formatDate(attendanceTo) : "Fin"
        }`
      : "Periodo completo";

    const totalSections = attendanceSummaries.length;
    const totalDays = attendanceSummaries.reduce(
      (acc, summary) => acc + summary.totalDays,
      0,
    );
    const totalAttended = attendanceSummaries.reduce(
      (acc, summary) => acc + summary.attended,
      0,
    );
    const attendanceAverage = totalDays
      ? formatPercent(totalAttended / totalDays, 1)
      : "Sin datos";

    const summaryPairs: KeyValuePair[] = [
      { label: "Secciones analizadas", value: String(totalSections) },
      { label: "Período", value: rangeLabel },
      { label: "Total de días relevados", value: String(totalDays) },
      { label: "Asistencias registradas", value: String(totalAttended) },
      { label: "Promedio de asistencia", value: attendanceAverage },
    ];

    const attendanceRows = attendanceSummaries.map((summary) => {
      const attendanceRatio = summary.totalDays
        ? summary.attended / summary.totalDays
        : 0;
      return [
        summary.label,
        summary.level,
        String(summary.totalDays),
        String(summary.attended),
        formatPercent(attendanceRatio, 1),
      ];
    });

    const sections: ReportSection[] = [
      { type: "keyValue", title: "Resumen general", pairs: summaryPairs },
    ];

    if (attendanceRows.length > 0) {
      sections.push({
        type: "table",
        title: "Detalle por sección",
        columns: [
          { label: "Sección", width: "wide" },
          { label: "Nivel" },
          { label: "Días" },
          { label: "Asistidos" },
          { label: "Asistencia" },
        ],
        rows: attendanceRows,
      });
    }

    return (doc) =>
      renderInstitutionalReport(doc, {
        title,
        detail: `Generado el ${generatedAt}`,
        sections,
        footer: "Considera registros de asistencia dentro del intervalo seleccionado.",
      });
  }

  if (tab === "licencias") {
    const summaryPairs: KeyValuePair[] = [
      { label: "Total de licencias", value: String(licenseRows.length) },
      { label: "Licencias activas", value: String(activeLicenses) },
      {
        label: "Próximas a vencer (15 días)",
        value: String(expiringLicenses),
      },
    ];

    const topTypeRows = topLicenseTypes.map((entry) => [
      entry.name,
      String(entry.value),
    ]);

    const licenseTableRows = licenseRows.slice(0, 12).map((row) => [
      row.teacherName,
      row.tipoLabel,
      row.rangeLabel,
      row.justificada ? "Justificada" : "Sin justificar",
    ]);

    const sections: ReportSection[] = [
      { type: "keyValue", title: "Resumen general", pairs: summaryPairs },
    ];

    if (topTypeRows.length > 0) {
      sections.push({
        type: "table",
        title: "Tipos de licencia más frecuentes",
        columns: [
          { label: "Tipo", width: "wide" },
          { label: "Cantidad" },
        ],
        rows: topTypeRows,
      });
    }

    if (licenseTableRows.length > 0) {
      sections.push({
        type: "table",
        title: "Primeras licencias registradas",
        columns: [
          { label: "Docente", width: "wide" },
          { label: "Tipo" },
          { label: "Período" },
          { label: "Estado" },
        ],
        rows: licenseTableRows,
      });
    }

    return (doc) =>
      renderInstitutionalReport(doc, {
        title,
        detail: `Generado el ${generatedAt}`,
        sections,
        footer: "Se listan hasta 12 licencias según los filtros aplicados.",
      });
  }

  if (tab === "actas") {
    const rangeLabel = actaFrom || actaTo
      ? `${actaFrom ? formatDate(actaFrom) : "Inicio"} – ${
          actaTo ? formatDate(actaTo) : "Fin"
        }`
      : "Periodo completo";
    const signedCount = filteredActas.filter((acta) => acta.signed).length;

    const summaryPairs: KeyValuePair[] = [
      { label: "Actas incluidas", value: String(filteredActas.length) },
      { label: "Firmadas", value: String(signedCount) },
      { label: "Nivel", value: actaLevel === "Todos" ? "Todos" : actaLevel },
      {
        label: "Sección",
        value: actaSection === "all" ? "Todas" : String(actaSection),
      },
      { label: "Rango seleccionado", value: rangeLabel },
    ];

    const actaRows = filteredActas.slice(0, 12).map((acta) => [
      acta.student,
      acta.section,
      acta.date,
      acta.signed ? "Firmada" : "No firmada",
      acta.signer ?? "Pendiente de asignación",
    ]);

    const sections: ReportSection[] = [
      { type: "keyValue", title: "Resumen general", pairs: summaryPairs },
    ];

    if (actaRows.length > 0) {
        sections.push({
          type: "table",
          title: "Primeras actas",
          columns: [
            { label: "Alumno", width: "wide" },
            { label: "Sección" },
            { label: "Fecha" },
            { label: "Estado" },
            { label: "Dirección firmante" },
          ],
          rows: actaRows,
        });
    }

    return (doc) =>
      renderInstitutionalReport(doc, {
        title,
        detail: `Generado el ${generatedAt}`,
        sections,
        footer: "Se muestran hasta 12 actas según los filtros aplicados.",
      });
  }

  return null;
};
const handleExportCurrent = async () => {
    const titleMap: Record<string, string> = {
      boletines: "Reporte de Boletines",
      aprobacion: "Reporte de Aprobación",
      asistencias: "Reporte de Asistencias",
      licencias: "Reporte de Licencias",
      actas: "Reporte de Actas",
    };
    const key = tab as keyof typeof reportRefs;
    try {
      setExportingPdf(true);
      const renderer = buildCurrentReportRenderer(titleMap[key]);
      if (!renderer) {
        throw new Error("No encontramos datos para exportar.");
      }
      await downloadPdfDocument({
        create: renderer,
        fileName: suggestPdfFileName(titleMap[key]),
      });
      toast.success("PDF generado correctamente.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo generar el documento PDF.";
      toast.error(message);
    } finally {
      setExportingPdf(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Reportes</h2>
            <p className="text-muted-foreground">
              Centro de análisis académico y administrativo • Exportable a PDF
            </p>
          </div>
          <Button onClick={() => void handleExportCurrent()} disabled={exportingPdf}>
            <Download className="mr-2 h-4 w-4" />
            {exportingPdf ? "Generando…" : "Exportar PDF"}
          </Button>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="space-y-5">
          <TabsList className="w-full h-auto flex-wrap gap-2">
            <TabsTrigger value="boletines" className="flex flex-1 min-w-[8rem]">
              Boletines
            </TabsTrigger>
            <TabsTrigger value="aprobacion" className="flex flex-1 min-w-[8rem]">
              Aprobación
            </TabsTrigger>
            <TabsTrigger value="asistencias" className="flex flex-1 min-w-[8rem]">
              Asistencias
            </TabsTrigger>
            <TabsTrigger value="licencias" className="flex flex-1 min-w-[8rem]">
              Licencias
            </TabsTrigger>
            <TabsTrigger value="actas" className="flex flex-1 min-w-[8rem]">
              Actas
            </TabsTrigger>
          </TabsList>

          {/* -------------------------- Reporte de Boletines ------------------ */}
          <TabsContent value="boletines" ref={reportRefs.boletines} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="h-5 w-5" /> Reporte de Boletines
                </CardTitle>
                <CardDescription>
                  Seleccione una sección para visualizar el resumen académico de cada alumno.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-w-sm">
                  <Label className="mb-1 block">Sección</Label>
                  <Select
                    value={selectedSectionId}
                    onValueChange={setSelectedSectionId}
                    disabled={loadingBoletines || availableSections.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          loadingBoletines
                            ? "Cargando secciones…"
                            : availableSections.length === 0
                              ? "No hay secciones disponibles"
                              : "Seleccione una sección"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSections.map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.label}
                          {section.level ? ` — ${section.level}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {boletinError && (
                  <div className="rounded-lg border border-dashed bg-red-50 p-6 text-sm text-red-600">
                    {boletinError}
                  </div>
                )}

                {loadingBoletines && !boletinError ? (
                  <div className="rounded-lg border border-dashed bg-muted/50 p-6">
                    <LoadingState label="Cargando información académica…" />
                  </div>
                ) : !selectedSectionId ? (
                  <div className="rounded-lg border border-dashed bg-muted/50 p-6 text-sm text-muted-foreground">
                    Elegí una sección del listado para ver sus alumnos.
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {boletinStudents.map((student) => (
                      <Card
                        key={student.id}
                        className="cursor-pointer transition-colors hover:border-primary"
                        onClick={() => setActiveBoletin(student)}
                      >
                        <CardHeader className="space-y-1">
                          <CardTitle className="text-base">{student.name}</CardTitle>
                          <CardDescription>{student.section}</CardDescription>
                          <Badge variant="outline" className="mt-1 w-fit">
                            {student.level}
                          </Badge>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Promedio general</span>
                            <span className="font-semibold">
                              {typeof student.average === "number"
                                ? student.average.toFixed(1)
                                : "—"}
                            </span>
                          </div>
                          {student.attendanceDetail ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Asistencia</span>
                                    <span className="font-semibold">
                                      {typeof student.attendancePercentage === "number"
                                        ? formatPercent(student.attendancePercentage, 0)
                                        : "—"}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent className="space-y-1 text-xs">
                                  <p>Días hábiles: {student.attendanceDetail.workingDays}</p>
                                  <p>Asistidos: {student.attendanceDetail.attended}</p>
                                  <p>Justificadas: {student.attendanceDetail.justified}</p>
                                  <p>Injustificadas: {student.attendanceDetail.unjustified}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <div className="flex justify-between text-muted-foreground">
                              <span>Asistencia</span>
                              <span>—</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                student.status
                                  ? student.status === "Promociona"
                                    ? "default"
                                    : student.status === "No Promociona"
                                      ? "destructive"
                                      : "outline"
                                  : "outline"
                              }
                            >
                              {student.status ?? "Sin estado"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Click para ver {student.level === "Primario" ? "boletín" : "informes"} completo
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {boletinStudents.length === 0 && (
                      <div className="col-span-full rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                        No encontramos alumnos para la sección seleccionada.
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* -------------------- Reporte de Aprobados/Desaprobados ----------- */}
          <TabsContent value="aprobacion" ref={reportRefs.aprobacion} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5" /> Reporte de Aprobación
                </CardTitle>
                <CardDescription>
                  Indicadores generales del nivel primario. Nivel inicial se encuentra deshabilitado por no contar con evaluación por materia.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label>Nivel</Label>
                    <Select defaultValue="Primario">
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Seleccionar nivel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inicial" disabled>
                          Inicial (no disponible)
                        </SelectItem>
                        <SelectItem value="Primario">Primario</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Materias aprobadas vs desaprobadas</CardTitle>
                    </CardHeader>
                    <CardContent className="flex h-48 items-center justify-center">
                      {totalApprovalSubjects === 0 ? (
                        <div className="text-sm text-muted-foreground">
                          No hay calificaciones registradas aún en el nivel primario.
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={overallPieData}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={45}
                              outerRadius={70}
                            >
                              {overallPieData.map((entry, index) => (
                                <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip
                              formatter={(value: number, name: string) => {
                                const percent = totalApprovalSubjects
                                  ? ((value as number) / totalApprovalSubjects) * 100
                                  : 0;
                                return [
                                  `${value} materia(s)` as string,
                                  `${name} (${percent.toFixed(1)}%)`,
                                ];
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Materia con más desaprobaciones</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-lg font-semibold">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                          {totalApprovalSubjects === 0
                            ? "Sin datos disponibles"
                            : approvalSummary.subjectWithMoreFails}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Identificar estos espacios ayuda a realizar intervenciones pedagógicas focalizadas.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Alumnos con materias pendientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 text-lg font-semibold">
                        <Users className="h-5 w-5 text-amber-500" />
                        {totalApprovalSubjects === 0
                          ? "—"
                          : approvalSummary.studentsWithPending}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Deben rendir instancias complementarias para promocionar el año.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  {approvalData.sections.map((section) => {
                    const isActive = selectedApprovalSection === section.id;
                    return (
                      <Card
                        key={section.id}
                        className={`cursor-pointer border transition ${
                          isActive ? "border-primary shadow" : "hover:border-primary/40"
                        }`}
                        onClick={() => setSelectedApprovalSection(section.id)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">
                            {section.label}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Aprobadas</span>
                            <span className="font-semibold">{section.stats.approved}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Desaprobadas</span>
                            <span className="font-semibold text-destructive">
                              {section.stats.failed}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Promedio aprobado / alumno: {section.stats.averageApprovedPerStudent.toFixed(1)}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {approvalData.sections.length === 0 && (
                  <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                    No encontramos secciones con calificaciones cargadas en el nivel primario.
                  </div>
                )}

                {approvalOverview ? (
                  <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
                    <Card className="border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          {approvalOverview.section.label}: estado general
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex h-56 flex-col items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={approvalOverview.chartData}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={50}
                              outerRadius={80}
                              label
                            >
                              {approvalOverview.chartData.map((entry, index) => (
                                <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card className="border">
                      <CardHeader className="flex flex-wrap items-center justify-between gap-3 pb-2">
                        <div>
                          <CardTitle className="text-sm font-medium">
                            Detalle por alumno
                          </CardTitle>
                          <CardDescription>
                            Ordená la vista según tu necesidad de análisis
                          </CardDescription>
                          <p className="text-xs text-muted-foreground">
                            Promedio de materias aprobadas por alumno: {approvalOverview.section.stats.averageApprovedPerStudent.toFixed(1)}
                          </p>
                        </div>
                        <div className="w-[200px]">
                          <Select
                            value={approvalSort}
                            onValueChange={(value: "nombre" | "promedio" | "desaprobadas") =>
                              setApprovalSort(value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Ordenar por" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="nombre">Nombre</SelectItem>
                              <SelectItem value="promedio">Promedio general</SelectItem>
                              <SelectItem value="desaprobadas">Materias desaprobadas</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardHeader>
                      <CardContent className="overflow-x-auto">
                        <table className="w-full min-w-[560px] text-sm">
                          <thead className="bg-muted text-xs uppercase">
                            <tr>
                              <th className="px-3 py-2 text-left">Alumno</th>
                              <th className="px-3 py-2 text-left">Materia</th>
                              <th className="px-3 py-2 text-left">Nota</th>
                              <th className="px-3 py-2 text-left">Estado</th>
                              <th className="px-3 py-2 text-left">Promedio</th>
                              <th className="px-3 py-2 text-left">Materias desaprobadas</th>
                            </tr>
                          </thead>
                          <tbody>
                            {approvalOverview.sorted.map((record) => (
                              <tr key={`${record.studentId}-${record.subject}`} className="border-b last:border-0">
                                <td className="px-3 py-2">{record.studentName}</td>
                                <td className="px-3 py-2">{record.subject}</td>
                                <td className="px-3 py-2">{record.grade.toFixed(1)}</td>
                                <td className="px-3 py-2">
                                  <Badge
                                    variant={
                                      record.status === "APROBADO" ? "default" : "destructive"
                                    }
                                  >
                                    {record.status === "APROBADO" ? "Aprobado" : "Desaprobado"}
                                  </Badge>
                                </td>
                                <td className="px-3 py-2">{record.average.toFixed(1)}</td>
                                <td className="px-3 py-2">{record.failedCount}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                    Seleccioná una sección para ver el detalle específico.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ------------------------ Reporte de Asistencias ------------------ */}
          <TabsContent value="asistencias" ref={reportRefs.asistencias} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" /> Reporte de Asistencias de Alumnos
                </CardTitle>
                <CardDescription>
                  Analizá el comportamiento de asistencia por nivel, sección y alumno.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <Label className="mb-1 block">Desde</Label>
                    <Input
                      type="date"
                      value={attendanceFrom}
                      onChange={(e) => {
                        const value = e.target.value;
                        setAttendanceFrom(value);
                        if (value && attendanceTo && value > attendanceTo) {
                          setAttendanceTo(value);
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label className="mb-1 block">Hasta</Label>
                    <Input
                      type="date"
                      value={attendanceTo}
                      onChange={(e) => {
                        const value = e.target.value;
                        setAttendanceTo(value);
                        if (value && attendanceFrom && value < attendanceFrom) {
                          setAttendanceFrom(value);
                        }
                      }}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="mb-1 block">Secciones</Label>
                    <Popover open={attendancePopoverOpen} onOpenChange={setAttendancePopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          {selectedAttendanceSections.length
                            ? `${selectedAttendanceSections.length} sección(es) seleccionadas`
                            : "Seleccionar secciones"}
                          <Search className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[260px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Buscar sección..." />
                          <CommandList>
                            <CommandEmpty>Sin resultados</CommandEmpty>
                            <CommandGroup>
                              {attendanceSectionOptions.map((section) => {
                                const checked = selectedAttendanceSections.includes(section.id);
                                return (
                                  <CommandItem
                                    key={section.id}
                                    onSelect={() => {
                                      setSelectedAttendanceSections((prev) => {
                                        if (checked) {
                                          const updated = prev.filter((id) => id !== section.id);
                                          return updated.length ? updated : [section.id];
                                        }
                                        return [...prev, section.id];
                                      });
                                    }}
                                  >
                                    <div className="flex w-full items-center justify-between gap-2">
                                      <div>
                                        <p className="text-sm font-medium">{section.label}</p>
                                        <p className="text-xs text-muted-foreground">{section.level}</p>
                                      </div>
                                      <Checkbox
                                        checked={checked}
                                        onCheckedChange={(value) => {
                                          setSelectedAttendanceSections((prev) => {
                                            if (value) return [...prev, section.id];
                                            const updated = prev.filter((id) => id !== section.id);
                                            return updated.length ? updated : [];
                                          });
                                        }}
                                      />
                                    </div>
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {attendanceError && (
                  <div className="rounded-lg border border-dashed bg-red-50 p-4 text-sm text-red-600">
                    {attendanceError}
                  </div>
                )}

                {loadingAttendance && !attendanceError && (
                  <div className="rounded-lg border border-dashed bg-muted/60 p-6">
                    <LoadingState label="Cargando asistencia…" />
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-3">
                  {Object.entries(attendanceLevelSummary).map(([level, summary], index) => {
                    const attendance = summary.totalDays
                      ? summary.attended / summary.totalDays
                      : 0;
                    return (
                      <Card key={level} className="border shadow-sm">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Promedio de asistencia – {level}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex h-48 items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: "Asistencia", value: attendance },
                                  { name: "Inasistencia", value: 1 - attendance },
                                ]}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={45}
                                outerRadius={70}
                              >
                                {[attendance, 1 - attendance].map((_, colorIndex) => (
                                  <Cell
                                    key={colorIndex}
                                    fill={PIE_COLORS[(index + colorIndex) % PIE_COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <RechartsTooltip
                                formatter={(value: number, name) =>
                                  `${name}: ${(value * 100).toFixed(1)}%`
                                }
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {attendanceSelectedSummaries.map((summary) => {
                  const averageAttendance = summary.totalDays
                    ? summary.attended / summary.totalDays
                    : 0;
                  return (
                    <Card key={summary.sectionId} className="border">
                      <CardHeader className="flex flex-wrap items-center justify-between gap-3 pb-2">
                        <div>
                          <CardTitle className="text-sm font-medium">
                          {summary.label} • {summary.level}
                          </CardTitle>
                          <CardDescription>
                          {summary.students.length} alumno(s) • {summary.totalDays} registros en el período seleccionado.
                          </CardDescription>
                        </div>
                      <Badge variant="outline">Promedio de asistencia {formatPercent(averageAttendance, 1)}</Badge>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[600px] text-sm">
                          <thead className="bg-muted text-xs uppercase">
                            <tr>
                              <th className="px-3 py-2 text-left">Alumno</th>
                              <th className="px-3 py-2 text-left">Días registrables</th>
                              <th className="px-3 py-2 text-left">Asistidos</th>
                              <th className="px-3 py-2 text-left">Ausentes</th>
                              <th className="px-3 py-2 text-left">Llegadas tarde</th>
                              <th className="px-3 py-2 text-left">Retiros ant.</th>
                              <th className="px-3 py-2 text-left">% Asistencia</th>
                            </tr>
                          </thead>
                          <tbody>
                            {summary.students.map((student) => (
                              <tr key={student.id} className="border-b last:border-0">
                                <td className="px-3 py-2">{student.name}</td>
                                <td className="px-3 py-2">{student.total}</td>
                                <td className="px-3 py-2">{student.presentes}</td>
                                <td className="px-3 py-2">{student.ausentes}</td>
                                <td className="px-3 py-2">{student.tarde}</td>
                                <td className="px-3 py-2">{student.retiroAnticipado}</td>
                                <td className="px-3 py-2 font-semibold">
                                  {formatPercent(student.attendance, 1)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={summary.students.map((student) => ({
                              name: student.name,
                              attendance: (student.attendance * 100).toFixed(1),
                            }))}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" hide={summary.students.length > 6} />
                            <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                            <RechartsTooltip formatter={(value: string) => `${value}%`} />
                            <Bar dataKey="attendance" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}

                {!loadingAttendance &&
                  !attendanceError &&
                  attendanceSelectedSummaries.length === 0 && (
                    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                      No encontramos registros de asistencia para las secciones seleccionadas.
                    </div>
                  )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* -------------------- Reporte de Licencias ----------------------- */}
          <TabsContent value="licencias" ref={reportRefs.licencias} className="space-y-4">
            <LicenseSummaryCards
              totalPersonal={personalSummary.total}
              activos={personalSummary.activos}
              enLicencia={personalSummary.enLicencia}
              totalLicencias={licenseRows.length}
              loadingLicencias={licenseLoading}
            />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" /> Resumen de licencias
                </CardTitle>
                <CardDescription>
                  Visualizá la distribución y el estado actual de las licencias del personal.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {licenseLoading ? (
                  <div className="rounded-lg border border-dashed bg-muted/60 p-6">
                    <LoadingState label="Cargando licencias…" />
                  </div>
                ) : licenseError ? (
                  <div className="rounded-lg border border-dashed bg-red-50 p-4 text-sm text-red-600">
                    {licenseError}
                  </div>
                ) : licenseRows.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                    No encontramos licencias registradas en el sistema.
                  </div>
                ) : (
                  <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                    <div className="h-64 rounded-lg border bg-muted/30 p-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={licenseTypeData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                          >
                            {licenseTypeData.map((entry, index) => (
                              <Cell
                                key={`${entry.name}-${index}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg border bg-muted/30 p-4">
                          <p className="text-sm text-muted-foreground">Licencias activas</p>
                          <p className="text-2xl font-semibold">{activeLicenses}</p>
                        </div>
                        <div className="rounded-lg border bg-muted/30 p-4">
                          <p className="text-sm text-muted-foreground">Próximas a vencer (7 días)</p>
                          <p className="text-2xl font-semibold">{expiringLicenses}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>Tipos más frecuentes</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {topLicenseTypes.length ? (
                            topLicenseTypes.map((item) => (
                              <div
                                key={item.name}
                                className="flex items-center justify-between rounded-lg border bg-background px-3 py-2"
                              >
                                <span>{item.name}</span>
                                <span className="font-semibold">{item.value}</span>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-lg border bg-background px-3 py-2">
                              <p>No hay datos suficientes.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" /> Detalle de licencias por docente
                </CardTitle>
                <CardDescription>
                  Filtrá por docente, tipo o justificación para analizar los movimientos del personal.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-5">
                  <div className="md:col-span-2 space-y-1">
                    <Label>Búsqueda</Label>
                    <Input
                      placeholder="Buscar por docente o motivo"
                      value={licenseQuery}
                      onChange={(event) => setLicenseQuery(event.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Docente</Label>
                    <Select
                      value={licenseTeacherFilter}
                      onValueChange={setLicenseTeacherFilter}
                      disabled={licenseTeacherOptions.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los docentes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {licenseTeacherOptions.map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Tipo</Label>
                    <Select value={licenseTypeFilter} onValueChange={setLicenseTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {tipoLicenciaOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Justificación</Label>
                    <Select
                      value={licenseJustificationFilter}
                      onValueChange={(value) =>
                        setLicenseJustificationFilter(value as typeof licenseJustificationFilter)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="justified">Justificadas</SelectItem>
                        <SelectItem value="unjustified">Sin justificar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Desde</Label>
                    <Input
                      type="date"
                      value={licenseFrom}
                      onChange={(event) => {
                        const value = event.target.value;
                        setLicenseFrom(value);
                        if (licenseTo && value && value > licenseTo) {
                          setLicenseTo(value);
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Hasta</Label>
                    <Input
                      type="date"
                      value={licenseTo}
                      onChange={(event) => {
                        const value = event.target.value;
                        setLicenseTo(value);
                        if (licenseFrom && value && value < licenseFrom) {
                          setLicenseFrom(value);
                        }
                      }}
                    />
                  </div>
                </div>

                {licenseError && !licenseLoading ? (
                  <div className="rounded-lg border border-dashed bg-red-50 p-4 text-sm text-red-600">
                    {licenseError}
                  </div>
                ) : null}

                {licenseLoading ? (
                  <div className="rounded-lg border border-dashed bg-muted/60 p-6">
                    <LoadingState label="Cargando licencias…" />
                  </div>
                ) : filteredLicenses.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-sm">
                      <thead className="bg-muted text-xs uppercase">
                        <tr>
                          <th className="px-3 py-2 text-left">Docente</th>
                          <th className="px-3 py-2 text-left">Tipo</th>
                          <th className="px-3 py-2 text-left">Período</th>
                          <th className="px-3 py-2 text-left">Estado</th>
                          <th className="px-3 py-2 text-left">Motivo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLicenses.map((licencia) => (
                          <tr key={licencia.id} className="border-b last:border-0">
                            <td className="px-3 py-3 align-top">
                              <div className="font-medium text-foreground">{licencia.teacherName}</div>
                              <div className="text-xs text-muted-foreground">
                                {licencia.cargo ? licencia.cargo : "Sin cargo asignado"}
                                {licencia.situacion ? ` • ${licencia.situacion}` : ""}
                              </div>
                            </td>
                            <td className="px-3 py-3 align-top">
                              <Badge variant="outline">{licencia.tipoLabel}</Badge>
                              {typeof licencia.horas === "number" ? (
                                <div className="mt-1 text-xs text-muted-foreground">
                                  {licencia.horas} hs de ausencia
                                </div>
                              ) : null}
                            </td>
                            <td className="px-3 py-3 align-top">
                              <div>{licencia.rangeLabel}</div>
                              {licencia.durationDays ? (
                                <div className="text-xs text-muted-foreground">
                                  {licencia.durationDays} días
                                </div>
                              ) : null}
                            </td>
                            <td className="px-3 py-3 align-top">
                              <div className="flex flex-wrap gap-2">
                                <Badge
                                  variant={
                                    licencia.expiresSoon
                                      ? "destructive"
                                      : licencia.isActive
                                        ? "default"
                                        : "outline"
                                  }
                                >
                                  {licencia.expiresSoon
                                    ? "Próxima a vencer"
                                    : licencia.isActive
                                      ? "Activa"
                                      : "Finalizada"}
                                </Badge>
                                <Badge variant={licencia.justificada ? "secondary" : "destructive"}>
                                  {licencia.justificada ? "Justificada" : "Sin justificar"}
                                </Badge>
                              </div>
                            </td>
                            <td className="px-3 py-3 align-top">
                              {licencia.motivo ? (
                                <div className="whitespace-pre-wrap">{licencia.motivo}</div>
                              ) : (
                                <span className="text-muted-foreground">Sin detalle</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}

                {!licenseLoading && filteredLicenses.length === 0 && !licenseError ? (
                  <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                    {licenseFiltersActive
                      ? "No se encontraron licencias con los criterios seleccionados."
                      : "Aún no se registraron licencias en el sistema."}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
          {/* -------------------------- Reporte de Actas ---------------------- */}
          <TabsContent value="actas" ref={reportRefs.actas} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" /> Reporte de Actas de Accidentes
                </CardTitle>
                <CardDescription>
                  Filtrá y consultá rápidamente los registros de actas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                  <Card className="border bg-muted/40">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Filtros</CardTitle>
                      <CardDescription>Acotá la búsqueda según necesidad.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      <div className="space-y-2">
                        <Label>Desde</Label>
                        <Input
                          type="date"
                          value={actaFrom}
                          onChange={(e) => {
                            const value = e.target.value;
                            setActaFrom(value);
                            if (value && actaTo && value > actaTo) {
                              setActaTo(value);
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Hasta</Label>
                        <Input
                          type="date"
                          value={actaTo}
                          onChange={(e) => {
                            const value = e.target.value;
                            setActaTo(value);
                            if (value && actaFrom && value < actaFrom) {
                              setActaFrom(value);
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nivel</Label>
                        <Select value={actaLevel} onValueChange={(value) => setActaLevel(value as typeof actaLevel)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todos los niveles" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Todos">Todos los niveles</SelectItem>
                            <SelectItem value="Inicial">Inicial</SelectItem>
                            <SelectItem value="Primario">Primario</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Sección</Label>
                        <Select
                          value={actaSection}
                          onValueChange={(value) => setActaSection(value)}
                          disabled={actaRegistros.length === 0}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Todas las secciones" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todas</SelectItem>
                            {Array.from(new Set(actaRegistros.map((a) => a.section)))
                              .filter(Boolean)
                              .map((section) => (
                                <SelectItem key={section} value={section}>
                                  {section}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Alumno</Label>
                        <Input
                          placeholder="Nombre o apellido"
                          value={actaStudentQuery}
                          onChange={(e) => setActaStudentQuery(e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    {actaErrorMsg && (
                      <div className="rounded-lg border border-dashed bg-red-50 p-4 text-sm text-red-600">
                        {actaErrorMsg}
                      </div>
                    )}

                    {loadingActasRegistro && !actaErrorMsg && (
                      <div className="rounded-lg border border-dashed bg-muted/60 p-4">
                        <LoadingState label="Cargando actas…" />
                      </div>
                    )}

                    <div className="rounded-lg border bg-muted/30 p-4">
                      <p className="text-sm text-muted-foreground">Actas encontradas</p>
                      <p className="text-2xl font-semibold">
                        {loadingActasRegistro ? "—" : filteredActas.length}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {filteredActas.map((acta) => (
                        <Card
                          key={acta.id}
                          className="cursor-pointer border transition hover:border-primary/40"
                          onClick={() => setActiveActa(acta)}
                        >
                          <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
                            <div>
                              <div className="font-medium">{acta.student}</div>
                              <div className="text-muted-foreground">
                                {acta.section} • {acta.teacher}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {acta.date}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {acta.time}
                              </span>
                              <Badge variant={acta.signed ? "default" : "destructive"}>
                                {acta.signed ? "Firmada" : "No firmada"}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      {filteredActas.length === 0 && !loadingActasRegistro && !actaErrorMsg && (
                        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                          No encontramos actas con los criterios seleccionados.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Lateral Boletín */}
      <Sheet open={!!activeBoletin} onOpenChange={(open) => !open && setActiveBoletin(null)}>
      <SheetContent className="flex h-full w-full max-w-full flex-col overflow-y-auto sm:max-w-3xl lg:w-[80vw] lg:max-w-5xl">
          {activeBoletin && (
            <>
              <SheetHeader className="space-y-4 text-left">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <SheetTitle className="text-xl lg:text-2xl">{activeBoletin.name}</SheetTitle>
                    <SheetDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-medium text-foreground">{activeBoletin.section}</span>
                      <span className="text-muted-foreground">
                        Legajo: {activeBoletin.matriculaId ?? activeBoletin.alumnoId ?? "—"}
                      </span>
                      {typeof activeBoletin.attendancePercentage === "number" && (
                        <span className="text-muted-foreground">
                          Asistencia: {formatPercent(activeBoletin.attendancePercentage, 0)}
                        </span>
                      )}
                    </SheetDescription>
                  </div>
                  <Button
                    variant="outline"
                    className="justify-center lg:justify-start"
                    onClick={handlePrintBoletin}
                    disabled={exportingBoletin}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    {exportingBoletin ? "Generando…" : "Imprimir resumen"}
                  </Button>
                </div>
              </SheetHeader>
              <div
                className={`mt-6 flex-1 space-y-4 pb-8 text-sm ${
                  isActiveBoletinPrimario
                    ? "lg:grid lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start lg:gap-6 lg:space-y-0"
                    : ""
                }`}
              >
                {activeBoletin.attendanceDetail && (
                  <div className="rounded-lg border p-4 lg:sticky lg:top-6">
                    <h3 className="text-sm font-semibold">Detalle de asistencia</h3>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>Días hábiles: {activeBoletin.attendanceDetail.workingDays}</li>
                      <li>Asistidos: {activeBoletin.attendanceDetail.attended}</li>
                      <li>Inasistencias justificadas: {activeBoletin.attendanceDetail.justified}</li>
                      <li>Inasistencias injustificadas: {activeBoletin.attendanceDetail.unjustified}</li>
                    </ul>
                  </div>
                )}

                {activeBoletin.level === "Primario" ? (
                  <div className="rounded-lg border">
                    <div className="border-b px-4 py-3 text-sm font-semibold">
                      Boletín por materia
                    </div>
                    {boletinSubjectsForTable.length === 0 ||
                    boletinTrimesters.length === 0 ? (
                      <div className="p-4 text-xs text-muted-foreground">
                        No hay calificaciones registradas para este alumno.
                      </div>
                    ) : (
                      <>
                        <div className="hidden w-full max-w-full overflow-x-auto md:block">
                          <table className="min-w-full table-auto border-collapse text-xs sm:text-sm">
                            <thead>
                              <tr>
                                <th className="w-[200px] border border-border bg-muted/40 px-3 py-2 text-left font-medium">
                                  Materia
                                </th>
                                {boletinTrimesters.map((trimester) => (
                                  <th
                                    key={trimester.id}
                                    className="min-w-[140px] border border-border bg-muted/40 px-3 py-2 text-left font-medium"
                                  >
                                    {trimester.label}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {boletinSubjectsForTable.map((subject) => {
                                const displayTeacher = sanitizeTeacherName(subject.teacher);

                                return (
                                  <tr key={subject.id} className="even:bg-muted/10">
                                    <th
                                      scope="row"
                                      className="min-w-[180px] border border-border bg-muted/30 px-3 py-2 text-left"
                                    >
                                      <div className="flex flex-col gap-1">
                                        <span className="font-medium">{subject.name}</span>
                                        {displayTeacher && (
                                          <span className="text-[0.7rem] font-normal text-muted-foreground">
                                            Docente: {displayTeacher}
                                          </span>
                                        )}
                                      </div>
                                    </th>
                                    {boletinTrimesters.map((trimester) => {
                                      const grade = subject.grades.find(
                                        (g) => g.trimestreId === trimester.id,
                                      );
                                      const gradeValue = getBoletinGradeDisplay(grade);

                                      return (
                                        <td
                                          key={`${subject.id}-${trimester.id}`}
                                          className="border border-border px-3 py-2 align-top"
                                        >
                                          <span className="font-medium">{gradeValue}</span>
                                        </td>
                                      );
                                    })}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        <div className="grid gap-3 p-4 md:hidden">
                          {boletinSubjectsForTable.map((subject) => {
                            const displayTeacher = sanitizeTeacherName(subject.teacher);

                            return (
                              <div
                                key={subject.id}
                                className="space-y-3 rounded-md border border-border bg-background p-3 shadow-sm"
                              >
                                <div className="space-y-1">
                                  <p className="text-sm font-semibold">{subject.name}</p>
                                  {displayTeacher && (
                                    <p className="text-xs text-muted-foreground">Docente: {displayTeacher}</p>
                                  )}
                                </div>
                                <div className="grid gap-2">
                                  {boletinTrimesters.map((trimester) => {
                                    const grade = subject.grades.find(
                                      (g) => g.trimestreId === trimester.id,
                                    );
                                    const gradeValue = getBoletinGradeDisplay(grade);

                                    return (
                                      <div
                                        key={`${subject.id}-${trimester.id}`}
                                        className="rounded border border-dashed border-border/60 p-2"
                                      >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                            {trimester.label}
                                          </span>
                                          <span className="text-sm font-semibold text-foreground">
                                            {gradeValue}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border">
                    <div className="border-b px-4 py-3 text-sm font-semibold">
                      Informes por trimestre
                    </div>
                    <div className="divide-y">
                      {activeBoletin.informes && activeBoletin.informes.length > 0 ? (
                        activeBoletin.informes.map((informe) => (
                          <div key={`${activeBoletin.id}-${informe.trimestreId}`} className="grid gap-2 p-4">
                            <div className="font-medium">{informe.trimestreLabel}</div>
                            <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                              {informe.descripcion || "Sin descripción"}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-xs text-muted-foreground">
                          No hay informes cargados para este alumno.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Modal de Acta */}
      <Dialog open={!!activeActa} onOpenChange={(open) => !open && setActiveActa(null)}>
        <DialogContent className="max-w-2xl">
          {activeActa && (
            <>
              <DialogHeader>
                <DialogTitle>Acta #{activeActa.id}</DialogTitle>
                <DialogDescription>
                  {activeActa.student} • {activeActa.section} • {activeActa.teacher}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted-foreground">Alumno</span>
                    <p className="font-medium">{activeActa.student}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">DNI del alumno</span>
                    <p className="font-medium">{activeActa.studentDni ?? "—"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Familiar responsable</span>
                    <p className="font-medium">{activeActa.familyName ?? "—"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">DNI del familiar</span>
                    <p className="font-medium">{activeActa.familyDni ?? "—"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Fecha y horario</span>
                    <p className="font-medium">
                      {activeActa.date} • {activeActa.time}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Lugar</span>
                    <p className="font-medium">{activeActa.location}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estado</span>
                    <Badge variant={activeActa.signed ? "default" : "destructive"}>
                      {activeActa.signed ? "Firmada" : "No firmada"}
                    </Badge>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Dirección firmante</span>
                    <p className="font-medium">
                      {activeActa.signer ?? "Pendiente de asignación"}
                      {activeActa.signerDni
                        ? ` (DNI ${activeActa.signerDni})`
                        : ""}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Descripción</span>
                  <p className="whitespace-pre-wrap text-sm">{activeActa.description}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Acciones realizadas</span>
                  <p className="whitespace-pre-wrap text-sm">{activeActa.actions}</p>
                </div>
                <Button
                  variant="outline"
                  disabled={exportingActaId === activeActa.id}
                  onClick={() => {
                    if (!activeActa) return;
                    void (async () => {
                      const title = `Acta #${activeActa.id}`;
                      try {
                        setExportingActaId(activeActa.id ?? null);
                        await downloadPdfDocument({
                          create: (doc) =>
                            renderAccidentActPdf(
                              doc,
                              {
                                id: activeActa.id ?? title,
                                alumno: activeActa.student,
                                alumnoDni: activeActa.studentDni,
                                seccion: activeActa.section,
                                fecha: activeActa.date,
                                hora: activeActa.time,
                                lugar: activeActa.location,
                                descripcion: activeActa.description,
                                acciones: activeActa.actions,
                                firmante: activeActa.signer ?? undefined,
                                firmanteDni: activeActa.signerDni,
                                familiar: activeActa.familyName,
                                familiarDni: activeActa.familyDni,
                              },
                              {
                                statusLabel: activeActa.signed ? "Firmada" : "No firmada",
                              },
                            ),
                          fileName: suggestPdfFileName(title),
                        });
                        toast.success("Acta exportada en PDF.");
                      } catch (error) {
                        const message =
                          error instanceof Error
                            ? error.message
                            : "No se pudo generar el PDF del acta.";
                        toast.error(message);
                      } finally {
                        setExportingActaId(null);
                      }
                    })();
                  }}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  {exportingActaId === activeActa.id ? "Generando…" : "Imprimir Acta"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
