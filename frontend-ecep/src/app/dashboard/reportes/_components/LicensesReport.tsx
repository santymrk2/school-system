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
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
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
import { FileText, Users } from "lucide-react";
import { LicenseSummaryCards } from "../_components/LicenseSummaryCards";
import type { LicenseReportRow } from "../types";
import { PIE_COLORS } from "../constants";
import { tipoLicenciaOptions } from "../utils";

export type LicenseSelectOption = [string, string];

export type LicensesReportProps = {
  reportRef: RefObject<HTMLDivElement>;
  personalSummary: { total: number; activos: number; enLicencia: number };
  licenseRows: LicenseReportRow[];
  licenseLoading: boolean;
  licenseError: string | null;
  licenseQuery: string;
  setLicenseQuery: Dispatch<SetStateAction<string>>;
  licenseTeacherFilter: string;
  setLicenseTeacherFilter: Dispatch<SetStateAction<string>>;
  licenseTypeFilter: string;
  setLicenseTypeFilter: Dispatch<SetStateAction<string>>;
  licenseJustificationFilter: "all" | "justified" | "unjustified";
  setLicenseJustificationFilter: Dispatch<SetStateAction<"all" | "justified" | "unjustified">>;
  licenseFrom: string;
  setLicenseFrom: Dispatch<SetStateAction<string>>;
  licenseTo: string;
  setLicenseTo: Dispatch<SetStateAction<string>>;
  licenseTeacherOptions: LicenseSelectOption[];
  licenseTypeData: { name: string; value: number }[];
  topLicenseTypes: { name: string; value: number }[];
  activeLicenses: number;
  expiringLicenses: number;
  filteredLicenses: LicenseReportRow[];
  licenseFiltersActive: boolean;
};

export function LicensesReport({
  reportRef,
  personalSummary,
  licenseRows,
  licenseLoading,
  licenseError,
  licenseQuery,
  setLicenseQuery,
  licenseTeacherFilter,
  setLicenseTeacherFilter,
  licenseTypeFilter,
  setLicenseTypeFilter,
  licenseJustificationFilter,
  setLicenseJustificationFilter,
  licenseFrom,
  setLicenseFrom,
  licenseTo,
  setLicenseTo,
  licenseTeacherOptions,
  licenseTypeData,
  topLicenseTypes,
  activeLicenses,
  expiringLicenses,
  filteredLicenses,
  licenseFiltersActive,
}: LicensesReportProps) {
  return (
    <TabsContent value="licencias" ref={reportRef} className="space-y-4">
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
            <div className="alert-error border-dashed text-sm p-4">
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
                        <Cell key={`${entry.name}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
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
              <DatePicker
                value={licenseFrom || undefined}
                max={licenseTo || undefined}
                onChange={(value) => {
                  const next = value ?? "";
                  setLicenseFrom(next);
                  if (licenseTo && value && value > licenseTo) {
                    setLicenseTo(value);
                  }
                }}
              />
            </div>
            <div className="space-y-1">
              <Label>Hasta</Label>
              <DatePicker
                value={licenseTo || undefined}
                min={licenseFrom || undefined}
                onChange={(value) => {
                  const next = value ?? "";
                  setLicenseTo(next);
                  if (licenseFrom && value && value < licenseFrom) {
                    setLicenseFrom(value);
                  }
                }}
              />
            </div>
          </div>

          {licenseError && !licenseLoading ? (
            <div className="alert-error border-dashed text-sm p-4">
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
                          <div className="mt-1 text-xs text-muted-foreground">{licencia.horas} hs de ausencia</div>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 align-top">
                        <div>{licencia.rangeLabel}</div>
                        {licencia.durationDays ? (
                          <div className="text-xs text-muted-foreground">{licencia.durationDays} días</div>
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
  );
}
