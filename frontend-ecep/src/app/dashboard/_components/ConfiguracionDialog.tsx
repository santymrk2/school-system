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
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { TrimestreEstadoBadge } from "@/components/trimestres/TrimestreEstadoBadge";
import { calendario, notificaciones } from "@/services/api/modules";
import type { MailSettingsUpdatePayload } from "@/services/api/modules/notificaciones/mail";
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
  type ConfigTabValue = "general" | "trimestres" | "periodo" | "notificaciones";
  interface ConfigTab {
    value: ConfigTabValue;
    label: string;
  }

  const availableTabs = useMemo<ConfigTab[]>(() => {
    const tabs: ConfigTab[] = [{ value: "general", label: "General" }];
    if (tieneDireccion) {
      tabs.push(
        { value: "trimestres", label: "Trimestres" },
        { value: "periodo", label: "Período escolar" },
        { value: "notificaciones", label: "Notificaciones" },
      );
    }
    return tabs;
  }, [tieneDireccion]);

  const [activeTab, setActiveTab] = useState<ConfigTabValue>("general");

  useEffect(() => {
    if (!availableTabs.some((tab) => tab.value === activeTab)) {
      setActiveTab(availableTabs[0]?.value ?? "general");
    }
  }, [availableTabs, activeTab]);

  const renderDireccionRoleMessage = (feature: string) => (
    <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
      Seleccioná el rol <strong>Dirección</strong> para acceder a la gestión de{" "}
      {feature}.
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] w-full max-w-4xl overflow-hidden p-0">
        <div className="flex h-full w-full flex-col md:flex-row">
          <div className="flex flex-shrink-0 flex-col gap-4 border-b bg-muted/40 p-4 md:h-full md:w-64 md:border-b-0 md:border-r md:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Secciones
              </p>
              <p className="text-sm text-muted-foreground">
                Elegí qué aspecto de la plataforma querés configurar.
              </p>
            </div>
            <nav className="flex flex-wrap gap-2 md:flex-1 md:flex-col md:gap-1">
              {availableTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors md:w-full",
                    activeTab === tab.value
                      ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  aria-current={activeTab === tab.value ? "page" : undefined}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex flex-1 flex-col">
            <DialogHeader className="border-b px-6 py-4">
              <DialogTitle>Configuración</DialogTitle>
              <DialogDescription>
                Administrá las preferencias disponibles para tu rol actual.
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="flex-1 px-6 pb-6">
              <div className="space-y-6 pr-2">
                {activeTab === "general" && (
                  <>
                    <AparienciaConfig />
                    {!tieneDireccion && (
                      <p className="text-sm text-muted-foreground">
                        No hay configuraciones adicionales disponibles para tu rol
                        actual.
                      </p>
                    )}
                  </>
                )}

                {activeTab === "trimestres" && tieneDireccion && (
                  <div className="space-y-6">
                    {currentRole === UserRole.DIRECTOR ? (
                      <DireccionConfig
                        open={open && activeTab === "trimestres"}
                        section="trimestres"
                        hideNavigation
                      />
                    ) : (
                      renderDireccionRoleMessage("trimestres")
                    )}
                  </div>
                )}

                {activeTab === "periodo" && tieneDireccion && (
                  <div className="space-y-6">
                    {currentRole === UserRole.DIRECTOR ? (
                      <DireccionConfig
                        open={open && activeTab === "periodo"}
                        section="periodo"
                        hideNavigation
                      />
                    ) : (
                      renderDireccionRoleMessage("períodos escolares")
                    )}
                  </div>
                )}

                {activeTab === "notificaciones" && tieneDireccion && (
                  <div className="space-y-6">
                    {currentRole === UserRole.DIRECTOR ? (
                      <CorreoNotificacionesConfig open={open && activeTab === "notificaciones"} />
                    ) : (
                      renderDireccionRoleMessage("notificaciones por correo")
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
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
  );
}

function CorreoNotificacionesConfig({ open }: { open: boolean }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const [passwordSet, setPasswordSet] = useState(false);
  const [form, setForm] = useState({
    host: "",
    port: "",
    auth: true,
    starttls: false,
    username: "",
    password: "",
    from: "",
    enabled: true,
  });

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await notificaciones.mail.getConfig();
      const data = response.data;
      setForm({
        host: data?.host ?? "",
        port: data?.port ? String(data.port) : "",
        auth: data?.auth ?? true,
        starttls: data?.starttls ?? false,
        username: data?.username ?? "",
        password: "",
        from: data?.from ?? "",
        enabled: data?.enabled ?? true,
      });
      setPasswordSet(Boolean(data?.passwordSet));
      setPasswordChanged(false);
    } catch (error) {
      toast.error(resolveErrorMessage(error, "No se pudo cargar la configuración de correo"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open, loadSettings]);

  const handleInputChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleToggleChange = (field: "auth" | "starttls" | "enabled", value: boolean) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordChange = (value: string) => {
    setPasswordChanged(true);
    setForm((prev) => ({
      ...prev,
      password: value,
    }));
  };

  const handleSubmit = async () => {
    const trimmedHost = form.host.trim();
    const hasPortInput = form.port.length > 0;
    const portNumber = hasPortInput ? Number(form.port) : null;

    if (hasPortInput && Number.isNaN(portNumber)) {
      toast.error("Ingresá un puerto válido");
      return;
    }

    if (portNumber !== null && (portNumber <= 0 || portNumber > 65535)) {
      toast.error("El puerto debe estar entre 1 y 65535");
      return;
    }

    if (form.enabled) {
      if (!trimmedHost) {
        toast.error("Ingresá el servidor SMTP");
        return;
      }
      if (portNumber === null) {
        toast.error("Ingresá un puerto válido");
        return;
      }
    }

    if (form.enabled && form.auth && !form.username.trim()) {
      toast.error("Ingresá el usuario SMTP cuando la autenticación está habilitada");
      return;
    }

    const payload: MailSettingsUpdatePayload = {
      host: trimmedHost || null,
      port: portNumber,
      auth: form.auth,
      starttls: form.starttls,
      username: form.auth ? form.username.trim() || null : null,
      enabled: form.enabled,
      from: form.from.trim() || null,
    };

    if (passwordChanged) {
      payload.password = form.password.length ? form.password : "";
    }

    try {
      setSaving(true);
      await notificaciones.mail.updateConfig(payload);
      toast.success("Configuración de correo actualizada correctamente");
      if (passwordChanged) {
        const hasPassword = form.password.length > 0;
        setPasswordSet(hasPassword);
        setForm((prev) => ({
          ...prev,
          password: "",
        }));
      }
      setPasswordChanged(false);
    } catch (error) {
      toast.error(resolveErrorMessage(error, "No se pudo guardar la configuración"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Correo saliente</CardTitle>
        <CardDescription>
          Definí las credenciales SMTP que se utilizarán para enviar notificaciones
          institucionales.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <LoadingState message="Cargando configuración de correo..." />
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtp-host">Servidor SMTP</Label>
                <Input
                  id="smtp-host"
                  value={form.host}
                  onChange={(event) => handleInputChange("host", event.target.value)}
                  placeholder="smtp.ejemplo.com"
                  disabled={loading || saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-port">Puerto</Label>
                <Input
                  id="smtp-port"
                  inputMode="numeric"
                  value={form.port}
                  onChange={(event) =>
                    handleInputChange("port", event.target.value.replace(/[^0-9]/g, ""))
                  }
                  placeholder="587"
                  disabled={loading || saving}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtp-username">Usuario</Label>
                <Input
                  id="smtp-username"
                  value={form.username}
                  onChange={(event) => handleInputChange("username", event.target.value)}
                  placeholder="notificaciones@institucion.edu"
                  disabled={loading || saving || !form.auth}
                />
                <p className="text-xs text-muted-foreground">
                  Se utilizará únicamente si la autenticación SMTP está habilitada.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtp-password">Contraseña</Label>
                <Input
                  id="smtp-password"
                  type="password"
                  value={form.password}
                  onChange={(event) => handlePasswordChange(event.target.value)}
                  placeholder={passwordSet && !passwordChanged ? "••••••••" : ""}
                  disabled={loading || saving || !form.auth}
                />
                <p className="text-xs text-muted-foreground">
                  {passwordSet && !passwordChanged
                    ? "Dejá el campo vacío para conservar la contraseña actual."
                    : "Guardá los cambios para actualizar la contraseña."}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-md border p-4">
                <div>
                  <p className="text-sm font-medium">Autenticación SMTP</p>
                  <p className="text-xs text-muted-foreground">
                    Activala si el servidor requiere usuario y contraseña.
                  </p>
                </div>
                <Switch
                  checked={form.auth}
                  onCheckedChange={(checked) => handleToggleChange("auth", checked)}
                  disabled={loading || saving}
                />
              </div>
              <div className="flex items-center justify-between rounded-md border p-4">
                <div>
                  <p className="text-sm font-medium">STARTTLS</p>
                  <p className="text-xs text-muted-foreground">
                    Recomendado para conexiones seguras en el puerto 587.
                  </p>
                </div>
                <Switch
                  checked={form.starttls}
                  onCheckedChange={(checked) => handleToggleChange("starttls", checked)}
                  disabled={loading || saving}
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border p-4">
              <div>
                <p className="text-sm font-medium">Habilitar envíos</p>
                <p className="text-xs text-muted-foreground">
                  Podés desactivar los correos temporariamente sin perder la configuración.
                </p>
              </div>
              <Switch
                checked={form.enabled}
                onCheckedChange={(checked) => handleToggleChange("enabled", checked)}
                disabled={loading || saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp-from">Remitente</Label>
              <Input
                id="smtp-from"
                value={form.from}
                onChange={(event) => handleInputChange("from", event.target.value)}
                placeholder="notificaciones@institucion.edu"
                disabled={loading || saving}
              />
              <p className="text-xs text-muted-foreground">
                Dirección que verán las familias al recibir un correo. Si se deja vacío se
                utilizará el valor por defecto de la plataforma.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => loadSettings()}
                disabled={loading || saving}
              >
                Recargar
              </Button>
              <Button onClick={handleSubmit} disabled={loading || saving}>
                {saving ? (
                  <>
                    Guardando
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface DireccionConfigProps {
  open: boolean;
  section?: DireccionSectionId;
  hideNavigation?: boolean;
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

function DireccionConfig({
  open,
  section,
  hideNavigation = false,
}: DireccionConfigProps) {
  const [loading, setLoading] = useState(false);
  const [periodos, setPeriodos] = useState<PeriodoEscolarDTO[]>([]);
  const [trimestres, setTrimestres] = useState<TrimestreDTO[]>([]);
  const [drafts, setDrafts] = useState<Record<number, TrimestreDraft>>({});
  const [savingTrimestreId, setSavingTrimestreId] = useState<number | null>(
    null,
  );
  const [togglingTrimestreId, setTogglingTrimestreId] = useState<number | null>(
    null,
  );
  const [togglingEstado, setTogglingEstado] = useState<Extract<
    TrimestreEstado,
    "activo" | "cerrado"
  > | null>(null);
  const [activeSection, setActiveSection] = useState<DireccionSectionId>(
    section ?? "trimestres",
  );
  const [mobileView, setMobileView] = useState<"menu" | "content">(
    hideNavigation ? "content" : "menu",
  );
  const [updatingPeriodoId, setUpdatingPeriodoId] = useState<number | null>(
    null,
  );
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

      const maxYear = per.reduce((max, p) => Math.max(max, p.anio ?? 0), 0);
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
        resolveErrorMessage(error, "No se pudo cargar el calendario escolar"),
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
    if (section) {
      setActiveSection(section);
    }
  }, [section]);

  useEffect(() => {
    if (open) {
      setMobileView(hideNavigation ? "content" : "menu");
    }
  }, [open, hideNavigation]);

  const showNavigation = !hideNavigation;

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
      [...trimestresPeriodo].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)),
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
    if (estado === "activo") {
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
        toast.success(`Período ${periodo.anio ?? ""} activado como vigente`);
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

  const handleSectionSelect = (sectionId: DireccionSectionId) => {
    if (hideNavigation) return;
    setActiveSection(sectionId);
    setMobileView("content");
  };

  const trimestresContent = (
    <div className="space-y-2">
      {loading ? (
        <LoadingState label="Cargando datos…" />
      ) : trimestresOrdenados.length ? (
        trimestresOrdenados.map((tri) => {
          const idx = trimestresOrdenados.findIndex((t) => t.id === tri.id);
          const previo = idx > 0 ? trimestresOrdenados[idx - 1] : undefined;
          const estado = getTrimestreEstado(tri);
          const estadoPrevio = previo ? getTrimestreEstado(previo) : null;
          const draft = drafts[tri.id] ?? { inicio: "", fin: "" };
          const activarDisabledReason =
            estado === "activo"
              ? "Este trimestre ya está activo."
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
            loading || togglingTrimestreId === tri.id || estado !== "activo";
          const activarBusy =
            togglingTrimestreId === tri.id && togglingEstado === "activo";
          const cerrarBusy =
            togglingTrimestreId === tri.id && togglingEstado === "cerrado";
          const activarLabel = estado === "cerrado" ? "Reabrir" : "Activar";
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
                      Período{" "}
                      {resolveTrimestrePeriodoId(tri, periodoActual?.id) ?? "—"}
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
                  <DatePicker
                    value={draft.inicio || undefined}
                    max={draft.fin || undefined}
                    onChange={(value) =>
                      handleDraftChange(tri.id, "inicio", value ?? "")
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>Hasta</Label>
                  <DatePicker
                    value={draft.fin || undefined}
                    min={draft.inicio || undefined}
                    onChange={(value) =>
                      handleDraftChange(tri.id, "fin", value ?? "")
                    }
                    required
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
                  disabled={savingTrimestreId === tri.id || !hasChanges(tri)}
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
    </div>
  );

  const periodoContent = (
    <div>
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
                      onClick={() =>
                        handleActualizarEstadoPeriodo(periodo, accion)
                      }
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
    </div>
  );

  if (!showNavigation) {
    return (
      <div className="flex min-h-[24rem] flex-1 flex-col">
        <ScrollArea className="flex-1">
          <div className="space-y-6 px-4 py-4 md:px-6 md:py-6">
            {activeSection === "trimestres" ? trimestresContent : null}
            {activeSection === "periodo" ? periodoContent : null}
          </div>
        </ScrollArea>
      </div>
    );
  }

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
                aria-current={activeSection === section.id ? "page" : undefined}
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
