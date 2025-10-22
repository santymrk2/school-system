"use client";

import type { RefObject } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { TrendingUp, Users, AlertCircle } from "lucide-react";
import type { ApprovalRecord, ApprovalSection, ApprovalSummary } from "../types";
import { PIE_COLORS } from "../constants";

export type ApprovalOverview = {
  section: ApprovalSection;
  sorted: ApprovalRecord[];
  chartData: { name: string; value: number }[];
};

export type ApprovalReportProps = {
  reportRef: RefObject<HTMLDivElement>;
  totalApprovalSubjects: number;
  overallPieData: { name: string; value: number }[];
  approvalSummary: ApprovalSummary;
  approvalSections: ApprovalSection[];
  selectedApprovalSection: string | null;
  onSelectApprovalSection: (id: string) => void;
  approvalSort: "nombre" | "promedio" | "desaprobadas";
  onChangeApprovalSort: (value: "nombre" | "promedio" | "desaprobadas") => void;
  approvalOverview?: ApprovalOverview;
};

export function ApprovalReport({
  reportRef,
  totalApprovalSubjects,
  overallPieData,
  approvalSummary,
  approvalSections,
  selectedApprovalSection,
  onSelectApprovalSection,
  approvalSort,
  onChangeApprovalSort,
  approvalOverview,
}: ApprovalReportProps) {
  return (
    <TabsContent value="aprobacion" ref={reportRef} className="space-y-6">
      <Card>
        <CardHeader className="space-y-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" /> Reporte de Aprobación
          </CardTitle>
          <CardDescription>
            Indicadores generales del nivel primario. Nivel inicial se encuentra deshabilitado por no contar con evaluación por materia.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                          return [`${value} materia(s)` as string, `${name} (${percent.toFixed(1)}%)`];
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
                    {totalApprovalSubjects === 0 ? "Sin datos disponibles" : approvalSummary.subjectWithMoreFails}
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
                  {totalApprovalSubjects === 0 ? "—" : approvalSummary.studentsWithPending}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Deben rendir instancias complementarias para promocionar el año.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {approvalSections.map((section) => {
              const isActive = selectedApprovalSection === section.id;
              return (
                <Card
                  key={section.id}
                  className={`cursor-pointer border transition ${isActive ? "border-primary shadow" : "hover:border-primary/40"}`}
                  onClick={() => onSelectApprovalSection(section.id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{section.label}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Aprobadas</span>
                      <span className="font-semibold">{section.stats.approved}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Desaprobadas</span>
                      <span className="font-semibold text-destructive">{section.stats.failed}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Promedio aprobado / alumno: {section.stats.averageApprovedPerStudent.toFixed(1)}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {approvalSections.length === 0 && (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              No encontramos secciones con calificaciones cargadas en el nivel primario.
            </div>
          )}

          {approvalOverview ? (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
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
                <CardHeader className="flex flex-wrap items-center justify-between gap-4 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-medium">Detalle por alumno</CardTitle>
                    <CardDescription>Ordená la vista según tu necesidad de análisis</CardDescription>
                    <p className="text-xs text-muted-foreground">
                      Promedio de materias aprobadas por alumno: {approvalOverview.section.stats.averageApprovedPerStudent.toFixed(1)}
                    </p>
                  </div>
                  <div className="w-full min-w-[200px] max-w-[260px] sm:w-[200px]">
                    <Select value={approvalSort} onValueChange={onChangeApprovalSort}>
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
                            <Badge variant={record.status === "APROBADO" ? "default" : "destructive"}>
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
  );
}
