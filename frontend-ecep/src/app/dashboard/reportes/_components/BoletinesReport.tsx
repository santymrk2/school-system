"use client";

import { useMemo, type RefObject } from "react";
import LoadingState from "@/components/common/LoadingState";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TabsContent } from "@/components/ui/tabs";
import { GraduationCap, Printer } from "lucide-react";
import { type BoletinStudent } from "../types";
import { formatPercent, sanitizeTeacherName } from "../utils";

export type BoletinesReportProps = {
  reportRef: RefObject<HTMLDivElement>;
  loading: boolean;
  error: string | null;
  sections: { id: string; label: string; level: string }[];
  selectedSectionId: string;
  onSelectSection: (sectionId: string) => void;
  students: BoletinStudent[];
  onSelectStudent: (student: BoletinStudent) => void;
  activeStudent: BoletinStudent | null;
  onCloseStudent: () => void;
  onPrintStudent: () => void;
  exportingStudent: boolean;
  isActiveStudentPrimario: boolean;
  boletinSubjectsByTrimester: {
    id: number;
    label: string;
    subjects: {
      id: string;
      name: string;
      teacher: string | null;
      grade: string;
    }[];
  }[];
};

export function BoletinesReport({
  reportRef,
  loading,
  error,
  sections,
  selectedSectionId,
  onSelectSection,
  students,
  onSelectStudent,
  activeStudent,
  onCloseStudent,
  onPrintStudent,
  exportingStudent,
  isActiveStudentPrimario,
  boletinSubjectsByTrimester,
}: BoletinesReportProps) {
  const sectionPlaceholder = useMemo(() => {
    if (loading) return "Cargando secciones…";
    if (sections.length === 0) return "No hay secciones disponibles";
    return "Seleccione una sección";
  }, [loading, sections.length]);

  return (
    <>
      <TabsContent value="boletines" ref={reportRef} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="h-5 w-5" /> Reporte de Boletines
            </CardTitle>
            <CardDescription>
              Seleccione una sección para visualizar el resumen académico de
              cada alumno.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-sm">
              <LabelledSectionSelect
                loading={loading}
                placeholder={sectionPlaceholder}
                sections={sections}
                selectedSectionId={selectedSectionId}
                onSelectSection={onSelectSection}
              />
            </div>

            {error && (
              <div className="rounded-lg border border-dashed bg-red-50 p-6 text-sm text-red-600">
                {error}
              </div>
            )}

            {loading && !error ? (
              <div className="rounded-lg border border-dashed bg-muted/50 p-6">
                <LoadingState label="Cargando información académica…" />
              </div>
            ) : !selectedSectionId ? (
              <div className="rounded-lg border border-dashed bg-muted/50 p-6 text-sm text-muted-foreground">
                Elegí una sección del listado para ver sus alumnos.
              </div>
            ) : (
              <StudentsGrid
                students={students}
                onSelectStudent={onSelectStudent}
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <Sheet
        open={!!activeStudent}
        onOpenChange={(open) => !open && onCloseStudent()}
      >
        <SheetContent
          size="xl"
          className="flex h-full w-full flex-col overflow-y-auto md:overflow-y-visible lg:w-[85vw] xl:w-[90vw] 2xl:w-[92vw]"
        >
          {activeStudent && (
            <>
              <SheetHeader className="space-y-4 text-left">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <SheetTitle className="text-xl lg:text-2xl">
                      {activeStudent.name}
                    </SheetTitle>
                    <SheetDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-medium text-foreground">
                        {activeStudent.section}
                      </span>
                      <span className="text-muted-foreground">
                        Legajo:{" "}
                        {activeStudent.matriculaId ??
                          activeStudent.alumnoId ??
                          "—"}
                      </span>
                    </SheetDescription>
                  </div>
                  <Button
                    variant="outline"
                    className="justify-center lg:justify-start"
                    onClick={onPrintStudent}
                    disabled={exportingStudent}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    {exportingStudent ? "Generando…" : "Imprimir resumen"}
                  </Button>
                </div>
              </SheetHeader>

              <div className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                <SummaryCard label="Promedio general">
                  {typeof activeStudent.average === "number"
                    ? activeStudent.average.toFixed(1)
                    : "—"}
                </SummaryCard>
                <SummaryCard label="Asistencia">
                  {typeof activeStudent.attendancePercentage === "number"
                    ? formatPercent(activeStudent.attendancePercentage, 1)
                    : "—"}
                </SummaryCard>
              </div>

              <div
                className={`mt-6 flex-1 space-y-4 pb-8 text-sm ${
                  isActiveStudentPrimario
                    ? "lg:grid lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start lg:gap-6 lg:space-y-0"
                    : ""
                }`}
              >
                {activeStudent.attendanceDetail && (
                  <div className="rounded-lg border p-4 lg:sticky lg:top-6">
                    <h3 className="text-sm font-semibold">
                      Detalle de asistencia
                    </h3>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>
                        Días hábiles:{" "}
                        {activeStudent.attendanceDetail.workingDays}
                      </li>
                      <li>
                        Asistidos: {activeStudent.attendanceDetail.attended}
                      </li>
                      <li>
                        Inasistencias justificadas:{" "}
                        {activeStudent.attendanceDetail.justified}
                      </li>
                      <li>
                        Inasistencias injustificadas:{" "}
                        {activeStudent.attendanceDetail.unjustified}
                      </li>
                    </ul>
                  </div>
                )}

                {activeStudent.level === "Primario" ? (
                  <BoletinSubjectsDetail
                    boletinSubjectsByTrimester={boletinSubjectsByTrimester}
                  />
                ) : (
                  <InformeDetail
                    informes={activeStudent.informes}
                    activeStudentId={activeStudent.id}
                  />
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function LabelledSectionSelect({
  loading,
  placeholder,
  sections,
  selectedSectionId,
  onSelectSection,
}: {
  loading: boolean;
  placeholder: string;
  sections: { id: string; label: string; level: string }[];
  selectedSectionId: string;
  onSelectSection: (sectionId: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-foreground">
        Sección
      </label>
      <Select
        value={selectedSectionId}
        onValueChange={onSelectSection}
        disabled={loading || sections.length === 0}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {sections.map((section) => (
            <SelectItem key={section.id} value={section.id}>
              {section.label}
              {section.level ? ` — ${section.level}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function StudentsGrid({
  students,
  onSelectStudent,
}: {
  students: BoletinStudent[];
  onSelectStudent: (student: BoletinStudent) => void;
}) {
  if (students.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/50 p-6 text-sm text-muted-foreground">
        No hay alumnos registrados en esta sección.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {students.map((student) => (
        <Card
          key={student.id}
          className="cursor-pointer transition-colors hover:border-primary"
          onClick={() => onSelectStudent(student)}
        >
          <CardHeader className="space-y-1">
            <CardTitle className="text-base">{student.name}</CardTitle>
            <CardDescription>{student.section}</CardDescription>
            <Badge variant="outline" className="mt-1 w-fit">
              {student.level}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
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
                Click para ver{" "}
                {student.level === "Primario" ? "boletín" : "informes"} completo
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SummaryCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-foreground">{children}</p>
    </div>
  );
}

function BoletinSubjectsDetail({
  boletinSubjectsByTrimester,
}: {
  boletinSubjectsByTrimester: {
    id: number;
    label: string;
    subjects: {
      id: string;
      name: string;
      teacher: string | null;
      grade: string;
    }[];
  }[];
}) {
  if (boletinSubjectsByTrimester.length === 0) {
    return (
      <div className="rounded-lg border">
        <div className="border-b px-4 py-3 text-sm font-semibold">
          Materias y calificaciones
        </div>
        <div className="px-4 py-6 text-sm text-muted-foreground">
          No hay calificaciones registradas para este alumno.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <div className="border-b px-4 py-3 text-sm font-semibold">
        Materias y calificaciones
      </div>
      <div className="space-y-4 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          {boletinSubjectsByTrimester.map((trimester) => (
            <div
              key={trimester.id}
              className="flex flex-col rounded-lg border bg-background"
            >
              <div className="border-b px-4 py-3 text-sm font-semibold">
                {trimester.label}
              </div>
              {trimester.subjects.length ? (
                <div className="divide-y">
                  {trimester.subjects.map((subject) => {
                    const displayTeacher = sanitizeTeacherName(subject.teacher);

                    return (
                      <div
                        key={subject.id}
                        className="flex items-start justify-between gap-3 px-4 py-3"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">
                            {subject.name}
                          </p>
                          {displayTeacher && (
                            <p className="text-xs text-muted-foreground">
                              Docente: {displayTeacher}
                            </p>
                          )}
                        </div>
                        <span className="rounded-md bg-muted px-2 py-1 text-sm font-semibold text-foreground whitespace-nowrap">
                          {subject.grade ?? "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="px-4 py-6 text-sm text-muted-foreground">
                  No hay calificaciones registradas para este trimestre.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InformeDetail({
  informes,
  activeStudentId,
}: {
  informes?: BoletinStudent["informes"];
  activeStudentId: string;
}) {
  return (
    <div className="rounded-lg border">
      <div className="border-b px-4 py-3 text-sm font-semibold">
        Informes por trimestre
      </div>
      <div className="divide-y">
        {informes && informes.length > 0 ? (
          informes.map((informe) => (
            <div
              key={`${activeStudentId}-${informe.trimestreId}`}
              className="grid gap-2 p-4"
            >
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
  );
}
