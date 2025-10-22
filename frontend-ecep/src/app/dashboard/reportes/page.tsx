"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCalendarRefresh } from "@/hooks/useCalendarRefresh";
import { pageContent } from "@/lib/page-response";
import { BoletinesReport } from "./_components/BoletinesReport";
import { ApprovalReport } from "./_components/ApprovalReport";
import { AttendanceReport } from "./_components/AttendanceReport";
import { LicensesReport } from "./_components/LicensesReport";
import { ActasReport } from "./_components/ActasReport";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
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
  renderBoletinReport,
  renderInstitutionalReport,
  type KeyValuePair,
  type ReportSection,
  type TableColumn,
} from "@/lib/pdf/report-helpers";
import {
  type ActaRegistro,
  type ApprovalRecord,
  type ApprovalSection,
  type ApprovalSummary,
  type AttendanceSummarySection,
  type AttendanceSummaryStudent,
  type BoletinSection,
  type BoletinStudent,
  type CachedAlumnoInfo,
  type LicenseReportRow,
} from "./types";
import { APPROVAL_DATA, DAY_IN_MS, PIE_COLORS } from "./constants";
import {
  formatDate,
  formatPercent,
  formatTipoLicencia,
  getBoletinGradeDisplay,
  sanitizeTeacherName,
  startOfDay,
  toDateOrNull,
  withinRange,
} from "./utils";
import { logger } from "@/lib/logger";

const reportesLogger = logger.child({ module: "dashboard-reportes" });

const logReportesError = (error: unknown, message?: string) => {
  if (message) {
    reportesLogger.error({ err: error }, message);
  } else {
    reportesLogger.error({ err: error });
  }
};

export default function ReportesPage() {
  const { hasRole, loading, user } = useAuth();
  const { periodoEscolarId, periodoEscolar } = useActivePeriod();
  const router = useRouter();
  const calendarVersion = useCalendarRefresh("trimestres");

  const periodoFechaInicio = periodoEscolar?.fechaInicio ?? null;
  const periodoFechaFin = periodoEscolar?.fechaFin ?? null;
  const periodoAnio = periodoEscolar?.anio ?? null;

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
          asignacionesMateriaRes,
          calificacionesRes,
          informesRes,
          trimestresRes,
        ] = await Promise.all([
          gestionAcademica.secciones.list(),
          gestionAcademica.materias.list(),
          gestionAcademica.seccionMaterias.list(),
          gestionAcademica.asignacionDocenteMateria.list(),
          gestionAcademica.calificaciones.list(),
          gestionAcademica.informes.list(),
          calendario.trimestres.list(),
        ]);
        if (!alive) return;

        const seccionesRaw = seccionesRes.data ?? [];
        const materias = materiasRes.data ?? [];
        const seccionMaterias = seccionMateriasRes.data ?? [];
        const asignacionesMateria = asignacionesMateriaRes.data ?? [];
        const calificaciones = calificacionesRes.data ?? [];
        const informes = informesRes.data ?? [];
        const trimestres = (trimestresRes.data ?? []).sort(
          (a: any, b: any) => (a.orden ?? 0) - (b.orden ?? 0),
        );

        const todayISO = new Date().toISOString().slice(0, 10);
        const teacherIdsBySeccionMateria = new Map<number, number[]>();
        asignacionesMateria.forEach((asignacion: any) => {
          const seccionMateriaIdRaw =
            asignacion.seccionMateriaId ?? asignacion.seccionMateria?.id;
          if (seccionMateriaIdRaw == null) return;
          const seccionMateriaId = Number(seccionMateriaIdRaw);
          if (Number.isNaN(seccionMateriaId)) return;
          const empleadoId =
            asignacion.empleadoId ??
            asignacion.personalId ??
            asignacion.docenteId ??
            asignacion.empleado?.id ??
            null;
          if (empleadoId == null) return;

          const vigenciaDesde =
            asignacion.vigenciaDesde ?? asignacion.desde ?? null;
          if (typeof vigenciaDesde === "string" && vigenciaDesde > todayISO)
            return;

          const vigenciaHasta =
            asignacion.vigenciaHasta ?? asignacion.hasta ?? null;
          if (typeof vigenciaHasta === "string" && vigenciaHasta < todayISO)
            return;

          if (!teacherIdsBySeccionMateria.has(seccionMateriaId)) {
            teacherIdsBySeccionMateria.set(seccionMateriaId, []);
          }
          const current = teacherIdsBySeccionMateria.get(seccionMateriaId)!;
          if (!current.includes(empleadoId)) {
            current.push(empleadoId);
          }
        });

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

        type AttendanceSnapshot = {
          ratio: number | null;
          total: number;
          presentes: number;
          ausentes: number;
        };

        const attendanceBySection = new Map<number, Map<string, AttendanceSnapshot>>();
        const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const fallbackYear = periodoAnio ?? new Date().getFullYear();
        const fallbackFrom = `${String(fallbackYear).padStart(4, "0")}-01-01`;
        const fallbackTo = todayISO;
        const attendanceFrom =
          periodoFechaInicio && isoDateRegex.test(periodoFechaInicio)
            ? periodoFechaInicio
            : fallbackFrom;
        let attendanceTo =
          periodoFechaFin && isoDateRegex.test(periodoFechaFin)
            ? periodoFechaFin
            : fallbackTo;
        if (attendanceTo < attendanceFrom) {
          attendanceTo = attendanceFrom;
        }

        await Promise.all(
          seccionesFiltradas.map(async (sec: any) => {
            try {
              const { data } = await asistencias.secciones.resumenPorAlumno(
                Number(sec.id),
                attendanceFrom,
                attendanceTo,
              );
              if (!alive) return;

              const sectionAttendance = new Map<string, AttendanceSnapshot>();
              (data ?? []).forEach((dto: any) => {
                const total = Number(dto.total ?? dto.totalClases ?? 0);
                const presentes = Number(dto.presentes ?? 0);
                const ausentes = Number(dto.ausentes ?? 0);
                const porcentaje =
                  typeof dto.porcentaje === "number" ? dto.porcentaje : null;
                const ratioValue =
                  porcentaje != null
                    ? porcentaje / 100
                    : total > 0
                      ? presentes / total
                      : null;
                const ratio =
                  ratioValue != null && Number.isFinite(ratioValue)
                    ? Math.max(0, Math.min(1, ratioValue))
                    : null;

                const snapshot: AttendanceSnapshot = {
                  ratio,
                  total,
                  presentes,
                  ausentes,
                };

                const matriculaId =
                  dto.matriculaId ??
                  dto.matricula_id ??
                  dto.matricula?.id ??
                  null;
                const alumnoId =
                  dto.alumnoId ?? dto.alumno_id ?? dto.alumno?.id ?? null;

                if (matriculaId != null) {
                  sectionAttendance.set(`m:${matriculaId}`, snapshot);
                }
                if (alumnoId != null) {
                  sectionAttendance.set(`a:${alumnoId}`, snapshot);
                }
              });

              attendanceBySection.set(sec.id, sectionAttendance);
            } catch (error) {
              logReportesError(
                error,
                `No se pudo cargar la asistencia de la sección ${sec.id}`,
              );
            }
          }),
        );

        const alumnosBySeccion = new Map<number, any[]>();
        await Promise.all(
          seccionesFiltradas.map(async (sec: any) => {
            try {
              const { data } = await gestionAcademica.secciones.alumnos(sec.id);
              if (!alive) return;
              alumnosBySeccion.set(sec.id, data ?? []);
            } catch (error) {
              logReportesError(
                error,
                `No se pudo cargar alumnos de la sección ${sec.id}`,
              );
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

          const attendanceMap = attendanceBySection.get(sec.id);

          const students: BoletinStudent[] = studentsLite.map((student: any) => {
            const matriculaId = student.matriculaId ?? student.id ?? null;
            const alumnoId = student.alumnoId ?? null;
            const studentName =
              student.nombreCompleto ??
              student.nombre ??
              `Alumno #${alumnoId ?? matriculaId ?? ""}`.trim();

            const attendanceSnapshot =
              attendanceMap?.get(`m:${matriculaId}`) ??
              (alumnoId != null
                ? attendanceMap?.get(`a:${alumnoId}`)
                : undefined);
            const attendancePercentage =
              attendanceSnapshot?.ratio != null ? attendanceSnapshot.ratio : null;
            const absencePercentage =
              attendancePercentage != null ? 1 - attendancePercentage : null;

            if (level === "Primario") {
              const subjectEntries = sectionMateriasList
                .map((sm: any) => {
                  const smIdRaw = sm.id ?? sm.seccionMateriaId;
                  if (smIdRaw == null) return null;
                  const smId = Number(smIdRaw);
                  if (Number.isNaN(smId)) return null;
                  const subjectCalifs = calificaciones.filter(
                    (c: any) =>
                      c.matriculaId === matriculaId &&
                      c.seccionMateriaId === smId,
                  );
                  if (!subjectCalifs.length) return null;
                  const materia = materiaMap.get(
                    sm.materiaId ?? sm.materia?.id ?? sm.materiaId,
                  );
                  const teacherIds = teacherIdsBySeccionMateria.get(smId) ?? [];
                  const subjectTeacherIds = teacherIds.length
                    ? [...teacherIds]
                    : [];
                  const teacherLabel = subjectTeacherIds.length
                    ? subjectTeacherIds
                        .map((id) => `Empleado #${id}`)
                        .join(", ")
                    : null;
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
                    teacherIds: subjectTeacherIds.length
                      ? subjectTeacherIds
                      : undefined,
                    teacher: teacherLabel,
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
                attendancePercentage,
                absencePercentage,
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
              attendancePercentage,
              absencePercentage,
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
        logReportesError(error, "Error cargando boletines");
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
  }, [
    periodoEscolarId,
    periodoFechaInicio,
    periodoFechaFin,
    periodoAnio,
    calendarVersion,
  ]);

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

  useEffect(() => {
    setActiveBoletin((prev) => {
      if (!prev) return prev;
      const section = boletinSections.find((s) => s.id === prev.sectionId);
      const nextStudent = section?.students.find((student) => student.id === prev.id);
      if (!nextStudent || nextStudent === prev) {
        return prev;
      }
      return nextStudent;
    });
  }, [boletinSections]);

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
  const boletinSubjectsByTrimester = useMemo(
    () =>
      boletinTrimesters.map((trimester) => ({
        id: trimester.id,
        label: trimester.label,
        subjects: boletinSubjectsForTable.map((subject) => {
          const grade = subject.grades.find((g) => g.trimestreId === trimester.id);
          const observationsRaw = grade?.observaciones ?? null;
          const observations = observationsRaw
            ? String(observationsRaw).trim() || null
            : null;

          return {
            id: subject.id,
            name: subject.name,
            teacher: sanitizeTeacherName(subject.teacher),
            grade: getBoletinGradeDisplay(grade),
            observations,
          };
        }),
      })),
    [boletinSubjectsForTable, boletinTrimesters],
  );

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

    const summaryCards = [
      { label: "Promedio general", value: averageLabel },
      { label: "Asistencia promedio", value: attendanceLabel },
    ];

    const details: KeyValuePair[] = [
      { label: "Alumno", value: activeBoletin.name },
      { label: "Sección", value: activeBoletin.section },
      { label: "Nivel", value: activeBoletin.level },
      { label: "Legajo", value: legajoLabel },
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

    try {
      setExportingBoletin(true);
      await downloadPdfDocument({
        create: (doc) =>
          renderBoletinReport(doc, {
            title: "Resumen de boletín",
            metadataTitle: title,
            student: {
              name: activeBoletin.name,
              section: activeBoletin.section,
              level: activeBoletin.level,
              legajo: legajoLabel,
            },
            summaryCards,
            details,
            attendanceDetail: attendanceDetailPairs,
            trimesters: boletinSubjectsByTrimester.map((trimester) => ({
              label: trimester.label,
              subjects: trimester.subjects.map((subject) => ({
                name: subject.name,
                teacher: subject.teacher,
                grade: subject.grade ?? "—",
                observations: subject.observations ?? null,
              })),
            })),
            footer: `Generado el ${generatedAt}`,
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
    }, [activeBoletin, boletinSubjectsByTrimester]);

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
        logReportesError(error, "Error cargando empleados");
        setEmpleadoMap({});
        setPersonalSummary({ total: 0, activos: 0, enLicencia: 0 });
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!Object.keys(empleadoMap).length) return;

    setBoletinSections((prev) => {
      let sectionsChanged = false;

      const nextSections = prev.map((section) => {
        let studentsChanged = false;

        const nextStudents = section.students.map((student) => {
          let subjectsChanged = false;

          const nextSubjects = student.subjects.map((subject) => {
            if (!subject.teacherIds?.length) {
              return subject;
            }

            const teacherNames = subject.teacherIds
              .map((teacherId) => {
                const name = empleadoMap[teacherId]?.name?.trim();
                return name && name.length
                  ? name
                  : `Empleado #${teacherId}`;
              })
              .filter((value, index, array) => array.indexOf(value) === index);

            const teacher = teacherNames.length ? teacherNames.join(", ") : null;

            if (teacher === subject.teacher) {
              return subject;
            }

            subjectsChanged = true;
            return { ...subject, teacher };
          });

          if (!subjectsChanged) {
            return student;
          }

          studentsChanged = true;
          return { ...student, subjects: nextSubjects };
        });

        if (!studentsChanged) {
          return section;
        }

        sectionsChanged = true;
        return { ...section, students: nextStudents };
      });

      return sectionsChanged ? nextSections : prev;
    });
  }, [empleadoMap]);

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
  }, [approvalData.sections, approvalSort, selectedApprovalSection]);

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
        logReportesError(error, "Error cargando asistencia");
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
        logReportesError(error, "Error cargando licencias");
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
        const empleadoFromDto = licencia.empleado ?? null;
        const teacherId =
          typeof licencia.empleadoId === "number"
            ? licencia.empleadoId
            : typeof empleadoFromDto?.id === "number"
              ? empleadoFromDto.id
              : null;
        const teacherInfo = teacherId != null ? empleadoMap[teacherId] : undefined;
        const nombreDesdeDto = (() => {
          if (!empleadoFromDto) return "";
          if (empleadoFromDto.nombreCompleto?.trim()) {
            return empleadoFromDto.nombreCompleto.trim();
          }
          const partes = [empleadoFromDto.nombre, empleadoFromDto.apellido]
            .map((part) => (typeof part === "string" ? part.trim() : ""))
            .filter((part) => part.length > 0);
          return partes.join(" ");
        })();
        const fallbackTeacherName =
          teacherId != null && teacherId > 0
            ? `Empleado #${teacherId}`
            : "Sin docente asignado";
        const teacherName =
          nombreDesdeDto ||
          teacherInfo?.name ||
          fallbackTeacherName;
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
          cargo: empleadoFromDto?.cargo ?? teacherInfo?.cargo,
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
        logReportesError(error, "Error cargando actas");
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
  const [exportingActaId, setExportingActaId] = useState<string | null>(null);

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

  const handleExportActa = useCallback(
    async (acta: ActaRegistro) => {
      const title = `Acta #${acta.id}`;
      try {
        setExportingActaId(acta.id ?? null);
        await downloadPdfDocument({
          create: (doc) =>
            renderAccidentActPdf(
              doc,
              {
                id: acta.id ?? title,
                alumno: acta.student,
                alumnoDni: acta.studentDni,
                seccion: acta.section,
                fecha: acta.date,
                hora: acta.time,
                lugar: acta.location,
                descripcion: acta.description,
                acciones: acta.actions,
                firmante: acta.signer ?? undefined,
                firmanteDni: acta.signerDni,
                familiar: acta.familyName,
                familiarDni: acta.familyDni,
              },
              { statusLabel: acta.signed ? "Firmada" : "No firmada" },
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
    },
    [setExportingActaId],
  );

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
          <TabsList className="w-full h-auto flex gap-2 overflow-x-auto md:flex-wrap md:overflow-visible">
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

          <BoletinesReport
            reportRef={reportRefs.boletines}
            loading={loadingBoletines}
            error={boletinError}
            sections={availableSections}
            selectedSectionId={selectedSectionId}
            onSelectSection={setSelectedSectionId}
            students={boletinStudents}
            onSelectStudent={setActiveBoletin}
            activeStudent={activeBoletin}
            onCloseStudent={() => setActiveBoletin(null)}
            onPrintStudent={handlePrintBoletin}
            exportingStudent={exportingBoletin}
            isActiveStudentPrimario={isActiveBoletinPrimario}
            boletinSubjectsByTrimester={boletinSubjectsByTrimester}
          />

          <ApprovalReport
            reportRef={reportRefs.aprobacion}
            totalApprovalSubjects={totalApprovalSubjects}
            overallPieData={overallPieData}
            approvalSummary={approvalSummary}
            approvalSections={approvalData.sections}
            selectedApprovalSection={selectedApprovalSection}
            onSelectApprovalSection={setSelectedApprovalSection}
            approvalSort={approvalSort}
            onChangeApprovalSort={setApprovalSort}
            approvalOverview={approvalOverview}
          />

          <AttendanceReport
            reportRef={reportRefs.asistencias}
            attendanceFrom={attendanceFrom}
            attendanceTo={attendanceTo}
            setAttendanceFrom={setAttendanceFrom}
            setAttendanceTo={setAttendanceTo}
            attendanceSectionOptions={attendanceSectionOptions}
            selectedAttendanceSections={selectedAttendanceSections}
            setSelectedAttendanceSections={setSelectedAttendanceSections}
            attendancePopoverOpen={attendancePopoverOpen}
            setAttendancePopoverOpen={setAttendancePopoverOpen}
            attendanceError={attendanceError}
            loadingAttendance={loadingAttendance}
            attendanceLevelSummary={attendanceLevelSummary}
            attendanceSelectedSummaries={attendanceSelectedSummaries}
          />

          <LicensesReport
            reportRef={reportRefs.licencias}
            personalSummary={personalSummary}
            licenseRows={licenseRows}
            licenseLoading={licenseLoading}
            licenseError={licenseError}
            licenseQuery={licenseQuery}
            setLicenseQuery={setLicenseQuery}
            licenseTeacherFilter={licenseTeacherFilter}
            setLicenseTeacherFilter={setLicenseTeacherFilter}
            licenseTypeFilter={licenseTypeFilter}
            setLicenseTypeFilter={setLicenseTypeFilter}
            licenseJustificationFilter={licenseJustificationFilter}
            setLicenseJustificationFilter={setLicenseJustificationFilter}
            licenseFrom={licenseFrom}
            setLicenseFrom={setLicenseFrom}
            licenseTo={licenseTo}
            setLicenseTo={setLicenseTo}
            licenseTeacherOptions={licenseTeacherOptions}
            licenseTypeData={licenseTypeData}
            topLicenseTypes={topLicenseTypes}
            activeLicenses={activeLicenses}
            expiringLicenses={expiringLicenses}
            filteredLicenses={filteredLicenses}
            licenseFiltersActive={licenseFiltersActive}
          />

          <ActasReport
            reportRef={reportRefs.actas}
            actaFrom={actaFrom}
            setActaFrom={setActaFrom}
            actaTo={actaTo}
            setActaTo={setActaTo}
            actaLevel={actaLevel}
            setActaLevel={setActaLevel}
            actaSection={actaSection}
            setActaSection={setActaSection}
            actaStudentQuery={actaStudentQuery}
            setActaStudentQuery={setActaStudentQuery}
            actaRegistros={actaRegistros}
            filteredActas={filteredActas}
            loadingActasRegistro={loadingActasRegistro}
            actaErrorMsg={actaErrorMsg}
            activeActa={activeActa}
            setActiveActa={setActiveActa}
            exportingActaId={exportingActaId}
            onExportActa={handleExportActa}
          />
        </Tabs>
      </div>


    
  );
}
