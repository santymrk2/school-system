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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, Calendar, Clock, Printer } from "lucide-react";
import type { ActaRegistro } from "../types";

export type ActasReportProps = {
  reportRef: RefObject<HTMLDivElement>;
  actaFrom: string;
  setActaFrom: Dispatch<SetStateAction<string>>;
  actaTo: string;
  setActaTo: Dispatch<SetStateAction<string>>;
  actaLevel: "Todos" | "Inicial" | "Primario";
  setActaLevel: Dispatch<SetStateAction<"Todos" | "Inicial" | "Primario">>;
  actaSection: "all" | string;
  setActaSection: Dispatch<SetStateAction<"all" | string>>;
  actaStudentQuery: string;
  setActaStudentQuery: Dispatch<SetStateAction<string>>;
  actaRegistros: ActaRegistro[];
  filteredActas: ActaRegistro[];
  loadingActasRegistro: boolean;
  actaErrorMsg: string | null;
  activeActa: ActaRegistro | null;
  setActiveActa: Dispatch<SetStateAction<ActaRegistro | null>>;
  exportingActaId: string | null;
  onExportActa: (acta: ActaRegistro) => Promise<void>;
};

export function ActasReport({
  reportRef,
  actaFrom,
  setActaFrom,
  actaTo,
  setActaTo,
  actaLevel,
  setActaLevel,
  actaSection,
  setActaSection,
  actaStudentQuery,
  setActaStudentQuery,
  actaRegistros,
  filteredActas,
  loadingActasRegistro,
  actaErrorMsg,
  activeActa,
  setActiveActa,
  exportingActaId,
  onExportActa,
}: ActasReportProps) {
  return (
    <>
      <TabsContent value="actas" ref={reportRef} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" /> Reporte de Actas de Accidentes
            </CardTitle>
            <CardDescription>Filtrá y consultá rápidamente los registros de actas.</CardDescription>
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
                    <DatePicker
                      value={actaFrom || undefined}
                      max={actaTo || undefined}
                      onChange={(value) => {
                        const next = value ?? "";
                        setActaFrom(next);
                        if (value && actaTo && value > actaTo) {
                          setActaTo(value);
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hasta</Label>
                    <DatePicker
                      value={actaTo || undefined}
                      min={actaFrom || undefined}
                      onChange={(value) => {
                        const next = value ?? "";
                        setActaTo(next);
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
                      onValueChange={setActaSection}
                      disabled={actaRegistros.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todas las secciones" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {Array.from(new Set(actaRegistros.map((acta) => acta.section)))
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
                      onChange={(event) => setActaStudentQuery(event.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {actaErrorMsg && (
                  <div className="alert-error border-dashed text-sm p-4">
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
                      {activeActa.signerDni ? ` (DNI ${activeActa.signerDni})` : ""}
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
                  onClick={() => onExportActa(activeActa)}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  {exportingActaId === activeActa.id ? "Generando…" : "Imprimir Acta"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
