"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import LoadingState from "@/components/common/LoadingState";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrimestreEstadoBadge } from "@/components/trimestres/TrimestreEstadoBadge";
import { calendario } from "@/services/api/modules";
import { triggerCalendarRefresh } from "@/hooks/useCalendarRefresh";

import type { PeriodoEscolarDTO, TrimestreDTO } from "@/types/api-generated";
import { UserRole } from "@/types/api-generated";
import {
  getTrimestreEstado,
  getTrimestreFin,
  getTrimestreInicio,
  resolveTrimestrePeriodoId,
  type TrimestreEstado,
} from "@/lib/trimestres";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ChevronLeft, Loader2 } from "lucide-react";

interface ConfiguracionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRole: UserRole | null;
  roles: UserRole[];
}

const resolveErrorMessage = (error: unknown, fallback: string) => {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error instanceof Error && error.message) return error.message;
  if (
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof (error as any).response === "object"
  ) {
    const data = (error as any).response?.data;
    if (typeof data === "string") return data;
    if (data && typeof data.message === "string") return data.message;
  }
  return fallback;
};

export function ConfiguracionDialog({
  open,
  onOpenChange,
  currentRole,
  roles,
}: ConfiguracionDialogProps) {
  const tieneDireccion = roles.includes(UserRole.DIRECTOR);
  const availableTabs = useMemo(
    () =>
      [
        { value: "general", label: "General" as const },
        ...(tieneDireccion
          ? ([{ value: "institucional", label: "Institucional" as const }] as const)
          : []),
      ],
    [tieneDireccion],
  );
  type ConfigTabValue = (typeof availableTabs)[number]["value"];
  const [activeTab, setActiveTab] = useState<ConfigTabValue>("general");

  useEffect(() => {
    if (!availableTabs.some((tab) => tab.value === activeTab)) {
      setActiveTab(availableTabs[0]?.value ?? "general");
    }
  }, [availableTabs, activeTab]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl overflow-hidden p-0 sm:max-h-[85vh]">
        <div className="flex h-full max-h-[85vh] flex-col">
          <DialogHeader className="border-b px-6 py-4">
            <DialogTitle>Configuración</DialogTitle>
            <DialogDescription>
              Administrá las preferencias disponibles para tu rol actual.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 pb-6">
            <div className="space-y-6 pr-2">
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as ConfigTabValue)}
                className="space-y-6"
              >
                <TabsList className="w-full justify-start overflow-x-auto">
                  {availableTabs.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value} className="px-6">
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="general" className="space-y-6">
                  <AparienciaConfig />
                  {!tieneDireccion && (
                    <p className="text-sm text-muted-foreground">
                      No hay configuraciones adicionales disponibles para tu rol actual.
                    </p>
                  )}
                </TabsContent>

                {tieneDireccion && (
                  <TabsContent value="institucional" className="space-y-6">
                    {currentRole === UserRole.DIRECTOR ? (
                      <DireccionConfig open={open} />
                    ) : (
                      <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                        Seleccioná el rol <strong>Dirección</strong> para acceder a la
                        configuración institucional.
                      </div>
                    )}
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AparienciaConfig() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted ? resolvedTheme === "dark" : false;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apariencia</CardTitle>
        <CardDescription>
          Elegí el tema de la aplicación que prefieras para esta computadora.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">Modo oscuro</p>
            <p className="text-sm text-muted-foreground">
              Activá el modo oscuro para reducir el brillo y descansar la vista.
            </p>
          </div>
          <Switch
            checked={isDarkMode}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            aria-label="Alternar modo oscuro"
            disabled={!mounted}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface DireccionConfigProps {
  open: boolean;
}

type TrimestreDraft = {
  inicio: string;
  fin: string;
};

const DIRECCION_SECTIONS = [
  { id: "trimestres", label: "Trimestres" },
  { id: "periodo", label: "Período escolar" },
] as const;

type DireccionSectionId = (typeof DIRECCION_SECTIONS)[number]["id"];

function DireccionConfig({ open }: DireccionConfigProps) {
  const [loading, setLoading] = useState(false);
  const [periodos, setPeriodos] = useState<PeriodoEscolarDTO[]>([]);
  const [trimestres, setTrimestres] = useState<TrimestreDTO[]>([]);
  const [drafts, setDrafts] = useState<Record<number, TrimestreDraft>>({});
  const [savingTrimestreId, setSavingTrimestreId] = useState<number | null>(null);
  const [togglingTrimestreId, setTogglingTrimestreId] =
    useState<number | null>(null);
  const [togglingEstado, setTogglingEstado] = useState<
    Extract<TrimestreEstado, "activo" | "cerrado">
    | null
  >(null);
  const [activeSection, setActiveSection] =
    useState<DireccionSectionId>("trimestres");
  const [mobileView, setMobileView] = useState<"menu" | "content">("menu");
  const [updatingPeriodoId, setUpdatingPeriodoId] = useState<number | null>(null);
  const [updatingPeriodoAccion, setUpdatingPeriodoAccion] = useState<
    "abrir" | "cerrar" | null
  >(null);
  const [creatingPeriodo, setCreatingPeriodo] = useState(false);
  const [nuevoPeriodo, setNuevoPeriodo] = useState<{ anio: string }>({
    anio: "",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [perRes, triRes] = await Promise.all([
        calendario.periodos.list(),
        calendario.trimestres.list(),
      ]);
      const per = (perRes.data ?? []) as PeriodoEscolarDTO[];
      const tri = (triRes.data ?? []) as TrimestreDTO[];
      setPeriodos(per);
      setTrimestres(tri);

      const maxYear = per.reduce(
        (max, p) => Math.max(max, p.anio ?? 0),
        0,
      );
      const currentYear = new Date().getFullYear();
      const suggestedYear = per.length
        ? Math.max(maxYear + 1, currentYear)
        : currentYear;
      setNuevoPeriodo((prev) => ({
        ...prev,
        anio: prev.anio || String(suggestedYear),
      }));
    } catch (error) {
      toast.error(
        resolveErrorMessage(
          error,
          "No se pudo cargar el calendario escolar",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, loadData]);

  useEffect(() => {
    if (open) {
      setMobileView("menu");
    }
  }, [open]);

  const periodosOrdenados = useMemo(
    () => [...periodos].sort((a, b) => (b.anio ?? 0) - (a.anio ?? 0)),
    [periodos],
  );

  const periodoActivo = useMemo(
    () => periodosOrdenados.find((p) => p.activo !== false) ?? null,
    [periodosOrdenados],
  );

  const periodoActual = useMemo(() => {
    if (!periodosOrdenados.length) return null;
    return periodoActivo ?? periodosOrdenados[0] ?? null;
  }, [periodosOrdenados, periodoActivo]);

  const trimestresPeriodo = useMemo(() => {
    if (!periodoActual?.id) return [];
    return trimestres.filter((t) => {
      const periodoId = resolveTrimestrePeriodoId(t);
      return periodoId === periodoActual.id;
    });
  }, [periodoActual, trimestres]);

  const trimestresOrdenados = useMemo(
    () =>
      [...trimestresPeriodo].sort(
        (a, b) => (a.orden ?? 0) - (b.orden ?? 0),
      ),
    [trimestresPeriodo],
  );

  useEffect(() => {
    const next: Record<number, TrimestreDraft> = {};
    for (const t of trimestresOrdenados) {
      next[t.id] = {
        inicio: getTrimestreInicio(t),
        fin: getTrimestreFin(t),
      };
    }
    setDrafts(next);
  }, [trimestresOrdenados]);

  const handleDraftChange = (
    id: number,
    field: keyof TrimestreDraft,
    value: string,
  ) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  };

  const handleResetTrimestre = (tri: TrimestreDTO) => {
    setDrafts((prev) => ({
      ...prev,
      [tri.id]: {
        inicio: getTrimestreInicio(tri),
        fin: getTrimestreFin(tri),
      },
    }));
  };

  const hasChanges = (tri: TrimestreDTO) => {
    const draft = drafts[tri.id];
    if (!draft) return false;
    return (
      draft.inicio !== getTrimestreInicio(tri) ||
      draft.fin !== getTrimestreFin(tri)
    );
  };

  const handleSaveTrimestre = async (tri: TrimestreDTO) => {
    const draft = drafts[tri.id];
    if (!draft) return;
    if (!draft.inicio || !draft.fin) {
      toast.error("Completá las fechas desde y hasta del trimestre");
      return;
    }
    if (draft.inicio > draft.fin) {
      toast.error("La fecha de inicio no puede ser posterior a la de fin");
      return;
    }

    const idx = trimestresOrdenados.findIndex((t) => t.id === tri.id);
    const previo = idx > 0 ? trimestresOrdenados[idx - 1] : undefined;
    const siguiente =
      idx >= 0 && idx < trimestresOrdenados.length - 1
        ? trimestresOrdenados[idx + 1]
        : undefined;

    if (previo) {
      const finPrevio = getTrimestreFin(previo);
      if (finPrevio && draft.inicio < finPrevio) {
        toast.error(
          `La fecha desde debe ser igual o posterior al fin del trimestre ${
            previo.orden ?? ""
          }`,
        );
        return;
      }
    }

    if (siguiente) {
      const inicioSiguiente = getTrimestreInicio(siguiente);
      if (inicioSiguiente && draft.fin > inicioSiguiente) {
        toast.error(
          `La fecha hasta debe ser igual o anterior al inicio del trimestre ${
            siguiente.orden ?? ""
          }`,
        );
        return;
      }
    }

    try {
      setSavingTrimestreId(tri.id);
      await calendario.trimestres.update(tri.id, {
        periodoEscolarId: resolveTrimestrePeriodoId(tri, periodoActual?.id),
        orden: tri.orden,
        inicio: draft.inicio,
        fin: draft.fin,
      });
      toast.success("Fechas del trimestre actualizadas");
      await loadData();
      triggerCalendarRefresh("trimestres");
    } catch (error) {
      toast.error(
        resolveErrorMessage(error, "No se pudieron guardar los cambios"),
      );
    } finally {
      setSavingTrimestreId(null);
    }
  };

  const handleSetEstadoTrimestre = async (
    tri: TrimestreDTO,
    estado: Extract<TrimestreEstado, "activo" | "cerrado">,
  ) => {
    const idx = trimestresOrdenados.findIndex((t) => t.id === tri.id);
    if (idx === -1) {
      toast.error("No se pudo identificar el trimestre seleccionado");
      return;
    }

    const estadoActual = getTrimestreEstado(tri);
    if (estadoActual === estado) return;

    const previo = idx > 0 ? trimestresOrdenados[idx - 1] : undefined;
    const estadoPrevio = previo ? getTrimestreEstado(previo) : null;
    const hayOtroActivo = trimestresOrdenados.some(
      (t) => t.id !== tri.id && getTrimestreEstado(t) === "activo",
    );

    if (estado === "activo") {
      if (hayOtroActivo) {
        toast.error("Cerrá el trimestre activo antes de abrir otro");
        return;
      }
      if (previo && estadoPrevio !== "cerrado") {
        toast.error(
          `Primero debés cerrar el trimestre ${previo.orden ?? "anterior"}`,
        );
        return;
      }
    }

    try {
      setTogglingTrimestreId(tri.id);
      setTogglingEstado(estado);
      if (estado === "activo") {
        await calendario.trimestres.reabrir(tri.id);
        toast.success("Trimestre activado");
      } else {
        await calendario.trimestres.cerrar(tri.id);
        toast.success("Trimestre cerrado");
      }
      await loadData();
      triggerCalendarRefresh("trimestres");
    } catch (error) {
      toast.error(
        resolveErrorMessage(
          error,
          "No se pudo actualizar el estado del trimestre",
        ),
      );
    } finally {
      setTogglingTrimestreId(null);
      setTogglingEstado(null);
    }
  };

  const handleActualizarEstadoPeriodo = async (
    periodo: PeriodoEscolarDTO,
    accion: "abrir" | "cerrar",
  ) => {
    if (!periodo?.id) return;
    try {
      setUpdatingPeriodoId(periodo.id);
      setUpdatingPeriodoAccion(accion);
      if (accion === "abrir") {
        await calendario.periodos.abrir(periodo.id);
        toast.success(
          `Período ${periodo.anio ?? ""} activado como vigente`,
        );
      } else {
        await calendario.periodos.cerrar(periodo.id);
        toast.success(`Período ${periodo.anio ?? ""} cerrado`);
      }
      await loadData();
      triggerCalendarRefresh("periodos");
      triggerCalendarRefresh("trimestres");
    } catch (error) {
      toast.error(
        resolveErrorMessage(
          error,
          accion === "abrir"
            ? "No se pudo activar el período seleccionado"
            : "No se pudo cerrar el período seleccionado",
        ),
      );
    } finally {
      setUpdatingPeriodoId(null);
      setUpdatingPeriodoAccion(null);
    }
  };

  const handleCrearPeriodo = async () => {
    const year = Number.parseInt(nuevoPeriodo.anio, 10);
    if (!Number.isFinite(year) || year < 2000) {
      toast.error("Ingresá un año válido para el período");
      return;
    }

    try {
      setCreatingPeriodo(true);
      await calendario.periodos.create({ anio: year });
      toast.success("Nuevo período creado");
      setNuevoPeriodo((prev) => ({
        ...prev,
        anio: String(year + 1),
      }));
      await loadData();
      triggerCalendarRefresh("periodos");
    } catch (error) {
      toast.error(
        resolveErrorMessage(error, "No se pudo crear el nuevo período"),
      );
    } finally {
      setCreatingPeriodo(false);
    }
  };

  const activeSectionConfig = DIRECCION_SECTIONS.find(
    (section) => section.id === activeSection,
  );

  const handleSectionSelect = (section: DireccionSectionId) => {
    setActiveSection(section);
    setMobileView("content");
  };

  const trimestresContent = (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de trimestres</CardTitle>
        <CardDescription>
          Ajustá las fechas y el estado de los trimestres del período en curso.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <LoadingState label="Cargando datos…" />
        ) : trimestresOrdenados.length ? (
          trimestresOrdenados.map((tri) => {
            const idx = trimestresOrdenados.findIndex((t) => t.id === tri.id);
            const previo = idx > 0 ? trimestresOrdenados[idx - 1] : undefined;
            const estado = getTrimestreEstado(tri);
            const estadoPrevio = previo ? getTrimestreEstado(previo) : null;
            const hayOtroActivo = trimestresOrdenados.some(
              (t) => t.id !== tri.id && getTrimestreEstado(t) === "activo",
            );
            const draft = drafts[tri.id] ?? { inicio: "", fin: "" };
            const activarDisabledReason =
              estado === "activo"
                ? "Este trimestre ya está activo."
                : hayOtroActivo
                  ? "Cerrá el trimestre activo antes de abrir otro."
                  : previo && estadoPrevio !== "cerrado"
                    ? `Primero debés cerrar el trimestre ${previo.orden ?? "anterior"}`
                    : null;
            const activarDisabled =
              loading ||
              togglingTrimestreId === tri.id ||
              !!activarDisabledReason;
            const cerrarDisabledReason =
              estado === "cerrado"
                ? "Este trimestre ya está cerrado."
                : estado === "inactivo"
                  ? "Activá el trimestre antes de cerrarlo."
                  : null;
            const cerrarDisabled =
              loading ||
              togglingTrimestreId === tri.id ||
              estado !== "activo";
            const activarBusy =
              togglingTrimestreId === tri.id && togglingEstado === "activo";
            const cerrarBusy =
              togglingTrimestreId === tri.id && togglingEstado === "cerrado";
            const activarLabel =
              estado === "cerrado" ? "Reabrir" : "Activar";
            const cerrarLabel =
              estado === "cerrado"
                ? "Cerrado"
                : estado === "inactivo"
                  ? "Inactivo"
                  : "Cerrar";
            return (
              <div
                key={tri.id}
                className="space-y-4 rounded-lg border bg-muted/30 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">Trimestre {tri.orden ?? ""}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        Período {resolveTrimestrePeriodoId(tri, periodoActual?.id) ?? "—"}
                      </span>
                      <TrimestreEstadoBadge
                        estado={estado}
                        className="text-xs text-muted-foreground"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetEstadoTrimestre(tri, "activo")}
                      disabled={activarDisabled}
                      title={activarDisabledReason ?? undefined}
                    >
                      {activarBusy ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Actualizando
                        </span>
                      ) : (
                        activarLabel
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetEstadoTrimestre(tri, "cerrado")}
                      disabled={cerrarDisabled}
                      title={cerrarDisabledReason ?? undefined}
                    >
                      {cerrarBusy ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Cerrando
                        </span>
                      ) : (
                        cerrarLabel
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Desde</Label>
                    <Input
                      type="date"
                      value={draft.inicio}
                      onChange={(e) =>
                        handleDraftChange(tri.id, "inicio", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Hasta</Label>
                    <Input
                      type="date"
                      value={draft.fin}
                      onChange={(e) =>
                        handleDraftChange(tri.id, "fin", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResetTrimestre(tri)}
                    disabled={!hasChanges(tri)}
                  >
                    Restaurar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSaveTrimestre(tri)}
                    disabled={
                      savingTrimestreId === tri.id || !hasChanges(tri)
                    }
                  >
                    {savingTrimestreId === tri.id ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Guardando
                      </span>
                    ) : (
                      "Guardar cambios"
                    )}
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay trimestres cargados para el período seleccionado.
          </p>
        )}
      </CardContent>
    </Card>
  );

  const periodoContent = (
    <Card>
      <CardHeader>
        <CardTitle>Período escolar</CardTitle>
        <CardDescription>
          Definí qué período está activo en el sistema. Solo puede haber uno
          abierto a la vez.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {periodosOrdenados.length ? (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">
                {periodoActivo
                  ? `Período activo: ${periodoActivo.anio ?? "—"}`
                  : "No hay un período activo en este momento."}
              </p>
              <p className="text-xs text-muted-foreground">
                {periodoActivo
                  ? "Al activar otro período, este se cerrará automáticamente."
                  : "Activá uno de los períodos listados para habilitarlo en el sistema."}
              </p>
            </div>
            <div className="space-y-3">
              {periodosOrdenados.map((periodo) => {
                const isActivo = periodo.activo !== false;
                const accion: "abrir" | "cerrar" = isActivo ? "cerrar" : "abrir";
                const busy =
                  updatingPeriodoId === periodo.id &&
                  updatingPeriodoAccion === accion;
                const disabled =
                  updatingPeriodoId !== null && updatingPeriodoId !== periodo.id;
                return (
                  <div
                    key={periodo.id}
                    className="space-y-2 rounded-lg border bg-muted/30 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">
                          Período {periodo.anio ?? "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Estado: {isActivo ? "Abierto" : "Cerrado"}
                        </p>
                      </div>
                      <Badge variant={isActivo ? "default" : "outline"}>
                        {isActivo ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        variant={isActivo ? "outline" : "default"}
                        onClick={() => handleActualizarEstadoPeriodo(periodo, accion)}
                        disabled={disabled || busy}
                      >
                        {busy ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {accion === "abrir" ? "Activando" : "Cerrando"}
                          </span>
                        ) : accion === "abrir" ? (
                          "Activar período"
                        ) : (
                          "Cerrar período"
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Aún no hay períodos creados.
          </p>
        )}

        <Separator />

        <div className="space-y-3">
          <p className="text-sm font-medium">Abrir nuevo período</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="sm:w-40">
              <Label htmlFor="nuevo-periodo-anio">Año</Label>
              <Input
                id="nuevo-periodo-anio"
                type="number"
                min={2000}
                value={nuevoPeriodo.anio}
                onChange={(e) =>
                  setNuevoPeriodo({ anio: e.target.value.slice(0, 4) })
                }
              />
            </div>
            <Button
              onClick={handleCrearPeriodo}
              disabled={creatingPeriodo || !nuevoPeriodo.anio}
            >
              {creatingPeriodo ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Creando
                </span>
              ) : (
                "Crear período"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex min-h-[24rem] flex-1 flex-col md:flex-row">
      <div
        className={cn(
          "w-full shrink-0 border-b bg-background md:w-56 md:border-b-0 md:border-r",
          mobileView === "content" ? "hidden md:block" : "block",
        )}
      >
        <div className="px-4 py-4 md:px-5 md:py-6">
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Dirección
          </p>
          <div className="mt-3 flex flex-col gap-1">
            {DIRECCION_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => handleSectionSelect(section.id)}
                className={cn(
                  "w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                  activeSection === section.id
                    ? "bg-muted text-primary"
                    : "text-muted-foreground hover:bg-muted",
                )}
                aria-current={
                  activeSection === section.id ? "page" : undefined
                }
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex-1",
          mobileView === "menu"
            ? "hidden md:flex md:flex-col"
            : "flex flex-col",
        )}
      >
        <div className="border-b px-4 py-3 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 flex items-center gap-1"
            onClick={() => setMobileView("menu")}
          >
            <ChevronLeft className="h-4 w-4" />
            Menú
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="space-y-6 px-4 py-4 md:px-6 md:py-6">
            {activeSectionConfig ? (
              <div className="md:hidden">
                <h2 className="text-base font-semibold">
                  {activeSectionConfig.label}
                </h2>
              </div>
            ) : null}

            {activeSection === "trimestres" ? trimestresContent : null}
            {activeSection === "periodo" ? periodoContent : null}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export { DireccionConfig };
