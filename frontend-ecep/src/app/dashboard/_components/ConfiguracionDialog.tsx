"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { api } from "@/services/api";
import type { PeriodoEscolarDTO, TrimestreDTO } from "@/types/api-generated";
import { UserRole } from "@/types/api-generated";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ConfiguracionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRole: UserRole | null;
  roles: UserRole[];
}

const toDateInput = (value?: string | null) => {
  if (!value) return "";
  return value.slice(0, 10);
};

const resolvePeriodoId = (t: TrimestreDTO, fallback?: number | null) =>
  t.periodoEscolarId ??
  (t as any).periodoId ??
  (t as any).periodoEscolar?.id ??
  fallback ??
  undefined;

const getTriInicio = (t: TrimestreDTO) =>
  toDateInput(
    t.inicio ??
      (t as any).fechaInicio ??
      (t as any).inicio ??
      (t as any).fecha_inicio ??
      null,
  );

const getTriFin = (t: TrimestreDTO) =>
  toDateInput(
    t.fin ??
      (t as any).fechaFin ??
      (t as any).fin ??
      (t as any).fecha_fin ??
      null,
  );

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Configuración</DialogTitle>
          <DialogDescription>
            Administrá las preferencias disponibles para tu rol actual.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {tieneDireccion ? (
            currentRole === UserRole.DIRECTOR ? (
              <DireccionConfig open={open} />
            ) : (
              <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
                Seleccioná el rol <strong>Dirección</strong> para acceder a la
                configuración institucional.
              </div>
            )
          ) : (
            <p className="text-sm text-muted-foreground">
              No hay configuraciones disponibles para tu rol actual.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface DireccionConfigProps {
  open: boolean;
}

type TrimestreDraft = {
  inicio: string;
  fin: string;
};

function DireccionConfig({ open }: DireccionConfigProps) {
  const [loading, setLoading] = useState(false);
  const [periodos, setPeriodos] = useState<PeriodoEscolarDTO[]>([]);
  const [trimestres, setTrimestres] = useState<TrimestreDTO[]>([]);
  const [drafts, setDrafts] = useState<Record<number, TrimestreDraft>>({});
  const [savingTrimestreId, setSavingTrimestreId] = useState<number | null>(null);
  const [togglingTrimestreId, setTogglingTrimestreId] =
    useState<number | null>(null);
  const [closingPeriodo, setClosingPeriodo] = useState(false);
  const [openingPeriodo, setOpeningPeriodo] = useState(false);
  const [creatingPeriodo, setCreatingPeriodo] = useState(false);
  const [nuevoPeriodo, setNuevoPeriodo] = useState<{ anio: string }>({
    anio: "",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [perRes, triRes] = await Promise.all([
        api.periodos.list(),
        api.trimestres.list(),
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

  const periodoActual = useMemo(() => {
    if (!periodos.length) return null;
    const activo = periodos.find((p) => p.activo !== false);
    if (activo) return activo;
    return [...periodos]
      .sort((a, b) => (b.anio ?? 0) - (a.anio ?? 0))
      .at(0) ?? null;
  }, [periodos]);

  const trimestresPeriodo = useMemo(() => {
    if (!periodoActual?.id) return [];
    return trimestres.filter((t) => {
      const periodoId = resolvePeriodoId(t);
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
        inicio: getTriInicio(t),
        fin: getTriFin(t),
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
        inicio: getTriInicio(tri),
        fin: getTriFin(tri),
      },
    }));
  };

  const hasChanges = (tri: TrimestreDTO) => {
    const draft = drafts[tri.id];
    if (!draft) return false;
    return (
      draft.inicio !== getTriInicio(tri) || draft.fin !== getTriFin(tri)
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
      const finPrevio = getTriFin(previo);
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
      const inicioSiguiente = getTriInicio(siguiente);
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
      await api.trimestres.update(tri.id, {
        periodoEscolarId: resolvePeriodoId(tri, periodoActual?.id),
        orden: tri.orden,
        inicio: draft.inicio,
        fin: draft.fin,
      });
      toast.success("Fechas del trimestre actualizadas");
      await loadData();
    } catch (error) {
      toast.error(
        resolveErrorMessage(error, "No se pudieron guardar los cambios"),
      );
    } finally {
      setSavingTrimestreId(null);
    }
  };

  const handleToggleTrimestre = async (tri: TrimestreDTO) => {
    const idx = trimestresOrdenados.findIndex((t) => t.id === tri.id);
    if (idx === -1) {
      toast.error("No se pudo identificar el trimestre seleccionado");
      return;
    }
    const previo = idx > 0 ? trimestresOrdenados[idx - 1] : undefined;
    const hayOtroAbierto = trimestresOrdenados.some(
      (t) => t.id !== tri.id && t.cerrado === false,
    );
    if (tri.cerrado) {
      if (hayOtroAbierto) {
        toast.error("Cerrá el trimestre activo antes de abrir otro");
        return;
      }
      if (previo && !previo.cerrado) {
        toast.error(
          `Primero debés cerrar el trimestre ${previo.orden ?? "anterior"}`,
        );
        return;
      }
    }

    try {
      setTogglingTrimestreId(tri.id);
      if (tri.cerrado) {
        await api.trimestres.reabrir(tri.id);
        toast.success("Trimestre reabierto");
      } else {
        await api.trimestres.cerrar(tri.id);
        toast.success("Trimestre cerrado");
      }
      await loadData();
    } catch (error) {
      toast.error(
        resolveErrorMessage(
          error,
          "No se pudo actualizar el estado del trimestre",
        ),
      );
    } finally {
      setTogglingTrimestreId(null);
    }
  };

  const handleCerrarPeriodo = async () => {
    if (!periodoActual?.id) return;
    try {
      setClosingPeriodo(true);
      await api.periodos.cerrar(periodoActual.id);
      toast.success("Período cerrado");
      await loadData();
    } catch (error) {
      toast.error(
        resolveErrorMessage(error, "No se pudo cerrar el período actual"),
      );
    } finally {
      setClosingPeriodo(false);
    }
  };

  const handleAbrirPeriodo = async () => {
    if (!periodoActual?.id) return;
    try {
      setOpeningPeriodo(true);
      await api.periodos.abrir(periodoActual.id);
      toast.success("Período reabierto");
      await loadData();
    } catch (error) {
      toast.error(
        resolveErrorMessage(error, "No se pudo reabrir el período"),
      );
    } finally {
      setOpeningPeriodo(false);
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
      await api.periodos.create({ anio: year });
      toast.success("Nuevo período creado");
      setNuevoPeriodo((prev) => ({
        ...prev,
        anio: String(year + 1),
      }));
      await loadData();
    } catch (error) {
      toast.error(
        resolveErrorMessage(error, "No se pudo crear el nuevo período"),
      );
    } finally {
      setCreatingPeriodo(false);
    }
  };

  const periodoAbierto = periodoActual?.activo !== false;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de trimestres</CardTitle>
          <CardDescription>
            Ajustá las fechas y el estado de los trimestres del período en curso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando datos...
            </div>
          ) : trimestresOrdenados.length ? (
            trimestresOrdenados.map((tri) => {
              const idx = trimestresOrdenados.findIndex((t) => t.id === tri.id);
              const previo = idx > 0 ? trimestresOrdenados[idx - 1] : undefined;
              const hayOtroAbierto = trimestresOrdenados.some(
                (t) => t.id !== tri.id && t.cerrado === false,
              );
              const puedeAbrir =
                !tri.cerrado || (!hayOtroAbierto && (!previo || previo.cerrado));
              const draft = drafts[tri.id] ?? { inicio: "", fin: "" };
              return (
                <div
                  key={tri.id}
                  className="space-y-4 rounded-lg border bg-muted/30 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        Trimestre {tri.orden ?? ""}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          Período {resolvePeriodoId(tri, periodoActual?.id) ?? "—"}
                        </span>
                        <Badge variant={tri.cerrado ? "destructive" : "outline"}>
                          {tri.cerrado ? "Cerrado" : "Abierto"}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleTrimestre(tri)}
                      disabled={
                        togglingTrimestreId === tri.id ||
                        loading ||
                        (tri.cerrado && !puedeAbrir)
                      }
                      title={
                        tri.cerrado && !puedeAbrir
                          ? hayOtroAbierto
                            ? "Cerrá el trimestre activo para habilitar este"
                            : previo && !previo.cerrado
                              ? `Cerrá antes el trimestre ${previo.orden ?? "anterior"}`
                              : undefined
                          : undefined
                      }
                    >
                      {tri.cerrado ? "Reabrir" : "Cerrar"}
                    </Button>
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

      <Card>
        <CardHeader>
          <CardTitle>Período escolar</CardTitle>
          <CardDescription>
            Cerrá el período en curso o abrí uno nuevo para el siguiente ciclo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {periodoActual ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium">
                  Período actual: {periodoActual.anio ?? "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Estado: {periodoAbierto ? "Abierto" : "Cerrado"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={handleCerrarPeriodo}
                  disabled={closingPeriodo || !periodoAbierto}
                >
                  {closingPeriodo ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Cerrando
                    </span>
                  ) : (
                    "Cerrar período"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAbrirPeriodo}
                  disabled={openingPeriodo || periodoAbierto}
                >
                  {openingPeriodo ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Reabriendo
                    </span>
                  ) : (
                    "Reabrir período"
                  )}
                </Button>
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
    </div>
  );
}

export { DireccionConfig };
