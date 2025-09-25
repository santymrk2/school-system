"use client";

import type { Dispatch, RefObject, SetStateAction } from "react";
import LoadingState from "@/components/common/LoadingState";
import { TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { Users, Search } from "lucide-react";
import type { AttendanceSummarySection } from "../types";
import { formatPercent } from "../utils";
import { PIE_COLORS } from "../constants";

export type AttendanceSectionOption = {
  id: string;
  label: string;
  level: string;
};

export type AttendanceReportProps = {
  reportRef: RefObject<HTMLDivElement>;
  attendanceFrom: string;
  attendanceTo: string;
  setAttendanceFrom: Dispatch<SetStateAction<string>>;
  setAttendanceTo: Dispatch<SetStateAction<string>>;
  attendanceSectionOptions: AttendanceSectionOption[];
  selectedAttendanceSections: string[];
  setSelectedAttendanceSections: Dispatch<SetStateAction<string[]>>;
  attendancePopoverOpen: boolean;
  setAttendancePopoverOpen: Dispatch<SetStateAction<boolean>>;
  attendanceError: string | null;
  loadingAttendance: boolean;
  attendanceLevelSummary: Record<
    string,
    { totalDays: number; attended: number }
  >;
  attendanceSelectedSummaries: AttendanceSummarySection[];
};

export function AttendanceReport({
  reportRef,
  attendanceFrom,
  attendanceTo,
  setAttendanceFrom,
  setAttendanceTo,
  attendanceSectionOptions,
  selectedAttendanceSections,
  setSelectedAttendanceSections,
  attendancePopoverOpen,
  setAttendancePopoverOpen,
  attendanceError,
  loadingAttendance,
  attendanceLevelSummary,
  attendanceSelectedSummaries,
}: AttendanceReportProps) {
  return (
    <TabsContent value="asistencias" ref={reportRef} className="space-y-4">
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
            <DateField
              label="Desde"
              value={attendanceFrom}
              onChange={(value) => {
                setAttendanceFrom(value);
                if (value && attendanceTo && value > attendanceTo) {
                  setAttendanceTo(value);
                }
              }}
            />
            <DateField
              label="Hasta"
              value={attendanceTo}
              onChange={(value) => {
                setAttendanceTo(value);
                if (value && attendanceFrom && value < attendanceFrom) {
                  setAttendanceFrom(value);
                }
              }}
            />
            <div className="md:col-span-2">
              <Label className="mb-1 block">Secciones</Label>
              <Popover
                open={attendancePopoverOpen}
                onOpenChange={setAttendancePopoverOpen}
              >
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
                          const checked = selectedAttendanceSections.includes(
                            section.id,
                          );
                          return (
                            <CommandItem
                              key={section.id}
                              onSelect={() => {
                                setSelectedAttendanceSections((prev) => {
                                  if (checked) {
                                    const updated = prev.filter(
                                      (id) => id !== section.id,
                                    );
                                    return updated.length
                                      ? updated
                                      : [section.id];
                                  }
                                  return [...prev, section.id];
                                });
                              }}
                            >
                              <div className="flex w-full items-center justify-between gap-2">
                                <div>
                                  <p className="text-sm font-medium">
                                    {section.label}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {section.level}
                                  </p>
                                </div>
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(value) => {
                                    setSelectedAttendanceSections((prev) => {
                                      if (value) return [...prev, section.id];
                                      const updated = prev.filter(
                                        (id) => id !== section.id,
                                      );
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
            {Object.entries(attendanceLevelSummary).map(
              ([level, summary], index) => {
                const attendance = summary.totalDays
                  ? summary.attended / summary.totalDays
                  : 0;
                return (
                  <Card key={level} className="border shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Promedio de asistencia – {level}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex h-48 items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Asistió", value: attendance },
                              { name: "Ausentismo", value: 1 - attendance },
                            ]}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={45}
                            outerRadius={70}
                          >
                            {[attendance, 1 - attendance].map(
                              (_, colorIndex) => (
                                <Cell
                                  key={colorIndex}
                                  fill={
                                    PIE_COLORS[
                                      (index + colorIndex) % PIE_COLORS.length
                                    ]
                                  }
                                />
                              ),
                            )}
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
              },
            )}
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
                      {summary.students.length} alumno(s) • {summary.totalDays}{" "}
                      registros en el período seleccionado.
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    Promedio de asistencia {formatPercent(averageAttendance, 1)}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-sm">
                      <thead className="bg-muted text-xs uppercase">
                        <tr>
                          <th className="px-3 py-2 text-left">Alumno</th>
                          <th className="px-3 py-2 text-left">
                            Días registrables
                          </th>
                          <th className="px-3 py-2 text-left">Asistidos</th>
                          <th className="px-3 py-2 text-left">Ausentes</th>
                          <th className="px-3 py-2 text-left">
                            Llegadas tarde
                          </th>
                          <th className="px-3 py-2 text-left">Retiros ant.</th>
                          <th className="px-3 py-2 text-left">% Asistencia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.students.map((student) => (
                          <tr
                            key={student.id}
                            className="border-b last:border-0"
                          >
                            <td className="px-3 py-2">{student.name}</td>
                            <td className="px-3 py-2">{student.total}</td>
                            <td className="px-3 py-2">{student.presentes}</td>
                            <td className="px-3 py-2">{student.ausentes}</td>
                            <td className="px-3 py-2">{student.tarde}</td>
                            <td className="px-3 py-2">
                              {student.retiroAnticipado}
                            </td>
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
                        <XAxis
                          dataKey="name"
                          hide={summary.students.length > 6}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <RechartsTooltip
                          formatter={(value: string) => `${value}%`}
                        />
                        <Bar
                          dataKey="attendance"
                          fill="#0ea5e9"
                          radius={[6, 6, 0, 0]}
                        />
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
                No encontramos registros de asistencia para las secciones
                seleccionadas.
              </div>
            )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label className="mb-1 block">{label}</Label>
      <DatePicker
        value={value || undefined}
        onChange={(next) => onChange(next ?? "")}
      />
    </div>
  );
}
