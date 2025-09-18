"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { DashboardLayout } from "@/app/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  DollarSign,
  Download,
  FileText,
  Loader2,
  Plus,
  TrendingUp,
  Upload,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useFamilyAlumnos } from "@/hooks/useFamilyAlumnos";
import { api } from "@/services/api";
import { normalizeRole } from "@/lib/auth-roles";
import type {
  AlumnoDTO,
  AlumnoLiteDTO,
  ConceptoCuota,
  CuotaBulkCreateDTO,
  CuotaDTO,
  EmpleadoDTO,
  EstadoCuota,
  EstadoPago,
  MatriculaDTO,
  MedioPago,
  PagoCuotaCreateDTO,
  PagoCuotaDTO,
  PersonaDTO,
  ReciboSueldoCreateDTO,
  ReciboSueldoDTO,
  SeccionDTO,
  UserRole,
} from "@/types/api-generated";

const MONTH_LABELS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const CONCEPTO_LABELS: Record<string, string> = {
  MATRICULA: "Matrícula",
  MENSUALIDAD: "Cuota mensual",
  MATERIALES: "Materiales",
  OTROS: "Otros",
};

const ESTADO_PAGO_LABEL: Record<EstadoPago, { label: string; variant: string }> = {
  EN_REVISION: { label: "En revisión", variant: "secondary" },
  ACREDITADO: { label: "Acreditado", variant: "default" },
  RECHAZADO: { label: "Rechazado", variant: "destructive" },
};

function formatCurrency(value?: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatMonthAndYear(mes?: number | null, anio?: number | null) {
  if (!mes && !anio) return "—";
  if (!mes) return `${anio ?? ""}`.trim();
  const label = MONTH_LABELS[mes - 1] ?? "";
  const capitalized = label.charAt(0).toUpperCase() + label.slice(1);
  return anio ? `${capitalized} ${anio}` : capitalized;
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function conceptoLabel(value?: string | null) {
  if (!value) return "Sin concepto";
  return CONCEPTO_LABELS[value] ?? value;
}

function cuotaEstadoInfo(cuota: CuotaDTO): {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline";
} {
  const estado = cuota.estado as EstadoCuota | undefined;
  const dueDate = cuota.fechaVencimiento
    ? new Date(`${cuota.fechaVencimiento}T00:00:00`)
    : null;
  const now = new Date();

  if (estado === "PAGADA") return { label: "Pagada", variant: "default" };
  if (estado === "PARCIAL") return { label: "Pago parcial", variant: "outline" };
  if (
    estado === "VENCIDA" ||
    (dueDate && dueDate.getTime() < now.getTime() && estado !== "PAGADA")
  ) {
    return { label: "Vencida", variant: "destructive" };
  }
  return { label: "Vigente", variant: "secondary" };
}

const medioPagoOptions = Object.values(MedioPago);

export default function PagosPage() {
  const { user, selectedRole, loading: authLoading } = useAuth();
  const normalizedRole = useMemo(() => {
    if (selectedRole) return normalizeRole(selectedRole);
    const first = user?.roles?.[0];
    return first ? normalizeRole(first) : null;
  }, [selectedRole, user]);

  const isFamily = normalizedRole === UserRole.FAMILY;
  const isTeacher =
    normalizedRole === UserRole.TEACHER || normalizedRole === UserRole.ALTERNATE;
  const isAdmin =
    normalizedRole === UserRole.ADMIN ||
    normalizedRole === UserRole.SECRETARY ||
    normalizedRole === UserRole.DIRECTOR ||
    normalizedRole === UserRole.COORDINATOR;

  const shouldLoadCuotas = isFamily || isAdmin;
  const shouldLoadPagos = isAdmin;
  const shouldLoadSecciones = isAdmin;
  const shouldLoadMatriculas = isAdmin;
  const shouldLoadAlumnos = isAdmin;
  const shouldLoadRecibos = isAdmin || isTeacher;
  const shouldLoadEmpleados = isAdmin || isTeacher;

  const { alumnos: hijos, loading: hijosLoading } = useFamilyAlumnos();

  const [selectedTab, setSelectedTab] = useState("cuotas");
  const [cuotas, setCuotas] = useState<CuotaDTO[]>([]);
  const [cuotasLoading, setCuotasLoading] = useState(false);
  const [cuotasError, setCuotasError] = useState<string | null>(null);

  const [pagos, setPagos] = useState<PagoCuotaDTO[]>([]);
  const [pagosLoading, setPagosLoading] = useState(false);
  const [pagosError, setPagosError] = useState<string | null>(null);

  const [recibos, setRecibos] = useState<ReciboSueldoDTO[]>([]);
  const [recibosLoading, setRecibosLoading] = useState(false);
  const [recibosError, setRecibosError] = useState<string | null>(null);

  const [secciones, setSecciones] = useState<SeccionDTO[]>([]);
  const [seccionesLoading, setSeccionesLoading] = useState(false);

  const [matriculas, setMatriculas] = useState<MatriculaDTO[]>([]);
  const [alumnos, setAlumnos] = useState<AlumnoDTO[]>([]);
  const [empleados, setEmpleados] = useState<EmpleadoDTO[]>([]);

  const personaCache = useRef(new Map<number, PersonaDTO | null>());
  const [, forcePersonaRefresh] = useState(0);

  const ensurePersona = useCallback(async (personaId?: number | null) => {
    if (!personaId) return null;
    if (personaCache.current.has(personaId)) {
      return personaCache.current.get(personaId) ?? null;
    }
    try {
      const res = await api.personasCore.getById(personaId);
      personaCache.current.set(personaId, res.data ?? null);
      forcePersonaRefresh((value) => value + 1);
      return res.data ?? null;
    } catch {
      personaCache.current.set(personaId, null);
      forcePersonaRefresh((value) => value + 1);
      return null;
    }
  }, []);

  const loadCuotas = useCallback(async () => {
    setCuotasLoading(true);
    try {
      const res = await api.cuotas.list();
      setCuotas(res.data ?? []);
      setCuotasError(null);
    } catch (error: any) {
      setCuotasError(error?.message ?? "No se pudo obtener la información");
    } finally {
      setCuotasLoading(false);
    }
  }, []);

  const loadPagos = useCallback(async () => {
    setPagosLoading(true);
    try {
      const res = await api.pagosCuota.list();
      setPagos(res.data ?? []);
      setPagosError(null);
    } catch (error: any) {
      setPagosError(
        error?.message ?? "No se pudo obtener los pagos registrados",
      );
    } finally {
      setPagosLoading(false);
    }
  }, []);

  const loadRecibos = useCallback(async () => {
    setRecibosLoading(true);
    try {
      const res = await api.recibos.list();
      setRecibos(res.data ?? []);
      setRecibosError(null);
    } catch (error: any) {
      setRecibosError(error?.message ?? "No se pudieron cargar los recibos");
    } finally {
      setRecibosLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!shouldLoadCuotas) return;
    loadCuotas();
  }, [shouldLoadCuotas, loadCuotas]);

  useEffect(() => {
    if (!shouldLoadPagos) return;
    loadPagos();
  }, [shouldLoadPagos, loadPagos]);

  useEffect(() => {
    if (!shouldLoadRecibos) return;
    loadRecibos();
  }, [shouldLoadRecibos, loadRecibos]);

  useEffect(() => {
    if (!shouldLoadSecciones) return;
    setSeccionesLoading(true);
    api.secciones
      .secciones.list()
      .then((res) => setSecciones(res.data ?? []))
      .catch(() => setSecciones([]))
      .finally(() => setSeccionesLoading(false));
  }, [shouldLoadSecciones]);

  useEffect(() => {
    if (!shouldLoadMatriculas) return;
    api.matriculas
      .matriculas.list()
      .then((res) => setMatriculas(res.data ?? []))
      .catch(() => setMatriculas([]));
  }, [shouldLoadMatriculas]);

  useEffect(() => {
    if (!shouldLoadAlumnos) return;
    api.alumnos
      .list()
      .then((res) => setAlumnos(res.data ?? []))
      .catch(() => setAlumnos([]));
  }, [shouldLoadAlumnos]);

  useEffect(() => {
    if (!shouldLoadEmpleados) return;
    api.empleados
      .empleados.list()
      .then((res) => setEmpleados(res.data ?? []))
      .catch(() => setEmpleados([]));
  }, [shouldLoadEmpleados]);

  useEffect(() => {
    if (!shouldLoadEmpleados || empleados.length === 0) return;
    empleados.forEach((empleado) => ensurePersona(empleado.personaId ?? null));
  }, [empleados, ensurePersona, shouldLoadEmpleados]);

  const matriculaInfo = useMemo(() => {
    const map = new Map<
      number,
      { alumnoId?: number; alumnoNombre: string; seccionNombre?: string | null }
    >();
    if (!matriculas.length) return map;
    const alumnoMap = new Map<number, AlumnoDTO>();
    for (const alumno of alumnos) {
      if (alumno.id != null) alumnoMap.set(alumno.id, alumno);
    }
    for (const matricula of matriculas) {
      if (matricula.id == null) continue;
      const alumno = matricula.alumnoId
        ? alumnoMap.get(matricula.alumnoId)
        : undefined;
      const nombre = alumno
        ? `${alumno.apellido ?? ""}, ${alumno.nombre ?? ""}`
            .trim()
            .replace(/^, /, "") || `Alumno #${alumno.id}`
        : `Matrícula #${matricula.id}`;
      map.set(matricula.id, {
        alumnoId: alumno?.id ?? undefined,
        alumnoNombre: nombre,
        seccionNombre: alumno?.seccionActualNombre ?? null,
      });
    }
    return map;
  }, [matriculas, alumnos]);

  const cuotasPorMatricula = useMemo(() => {
    const map = new Map<number, CuotaDTO[]>();
    for (const cuota of cuotas) {
      const matriculaId = cuota.matriculaId;
      if (!matriculaId) continue;
      if (!map.has(matriculaId)) map.set(matriculaId, []);
      map.get(matriculaId)!.push(cuota);
    }
    for (const [, lista] of map.entries()) {
      lista.sort((a, b) => {
        const anioA = a.anio ?? 0;
        const anioB = b.anio ?? 0;
        if (anioA !== anioB) return anioA - anioB;
        const mesA = a.mes ?? 0;
        const mesB = b.mes ?? 0;
        if (mesA !== mesB) return mesA - mesB;
        return (a.fechaVencimiento ?? "").localeCompare(b.fechaVencimiento ?? "");
      });
    }
    return map;
  }, [cuotas]);

  const cuotasOrdenadasAdmin = useMemo(() => {
    return [...cuotas].sort((a, b) => {
      const fechaA = a.fechaVencimiento ?? "";
      const fechaB = b.fechaVencimiento ?? "";
      return fechaA.localeCompare(fechaB);
    });
  }, [cuotas]);

  const pagosOrdenados = useMemo(() => {
    return [...pagos].sort((a, b) => {
      const fechaA = a.fechaPago ?? "";
      const fechaB = b.fechaPago ?? "";
      return fechaB.localeCompare(fechaA);
    });
  }, [pagos]);

  const recibosOrdenados = useMemo(() => {
    return [...recibos].sort((a, b) => {
      const anioDiff = (b.anio ?? 0) - (a.anio ?? 0);
      if (anioDiff !== 0) return anioDiff;
      return (b.mes ?? 0) - (a.mes ?? 0);
    });
  }, [recibos]);

  const myEmpleado = useMemo(() => {
    if (!shouldLoadEmpleados) return null;
    if (!user?.personaId) return null;
    return empleados.find((empleado) => empleado.personaId === user.personaId) ?? null;
  }, [empleados, shouldLoadEmpleados, user]);

  const misRecibos = useMemo(() => {
    if (!myEmpleado) return [];
    return recibosOrdenados.filter((recibo) => recibo.empleadoId === myEmpleado.id);
  }, [myEmpleado, recibosOrdenados]);

  const getAlumnoNombre = useCallback(
    (matriculaId?: number | null) => {
      if (!matriculaId) return "—";
      const info = matriculaInfo.get(matriculaId);
      if (!info) return `Matrícula #${matriculaId}`;
      return info.alumnoNombre;
    },
    [matriculaInfo],
  );

  const getAlumnoSeccion = useCallback(
    (matriculaId?: number | null) => {
      if (!matriculaId) return "—";
      const info = matriculaInfo.get(matriculaId);
      if (!info) return "—";
      return info.seccionNombre ?? "—";
    },
    [matriculaInfo],
  );

  const getEmpleadoNombre = useCallback(
    (empleadoId?: number | null) => {
      if (!empleadoId) return "—";
      const empleado = empleados.find((item) => item.id === empleadoId);
      if (!empleado) return `Empleado #${empleadoId}`;
      const persona = personaCache.current.get(empleado.personaId ?? 0);
      if (persona) {
        return (
          `${persona.apellido ?? ""}, ${persona.nombre ?? ""}`
            .trim()
            .replace(/^, /, "") || `Empleado #${empleadoId}`
        );
      }
      return `Empleado #${empleadoId}`;
    },
    [empleados],
  );

  const [detalleCuota, setDetalleCuota] = useState<CuotaDTO | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creatingCuota, setCreatingCuota] = useState(false);
  const [createForm, setCreateForm] = useState({
    seccionIds: [] as number[],
    concepto: "MENSUALIDAD" as ConceptoCuota,
    titulo: "",
    anio: new Date().getFullYear().toString(),
    mes: (new Date().getMonth() + 1).toString(),
    importe: "",
    fechaVencimiento: "",
    porcentajeRecargo: "10",
    matricula: false,
  });

  const [pagoDialogOpen, setPagoDialogOpen] = useState(false);
  const [registrandoPago, setRegistrandoPago] = useState(false);
  const [pagoForm, setPagoForm] = useState({
    tipo: "cuota" as "cuota" | "matricula" | "sueldo",
    cuotaId: "",
    empleadoId: "",
    fecha: "",
    medioPago: "EFECTIVO" as MedioPago,
    monto: "",
    referencia: "",
    comprobanteId: "",
    anio: new Date().getFullYear().toString(),
    mes: (new Date().getMonth() + 1).toString(),
    bruto: "",
    neto: "",
  });

  const cuotasParaPago = useMemo(() => {
    const cuotasMensuales = cuotas.filter(
      (cuota) => cuota.concepto !== "MATRICULA",
    );
    const cuotasMatricula = cuotas.filter(
      (cuota) => cuota.concepto === "MATRICULA",
    );
    return { cuotasMensuales, cuotasMatricula };
  }, [cuotas]);

  const resumenCuotas = useMemo(() => {
    const total = cuotas.length;
    const vencidas = cuotas.filter(
      (cuota) => cuotaEstadoInfo(cuota).label === "Vencida",
    ).length;
    const pagadas = cuotas.filter((cuota) => cuota.estado === "PAGADA").length;
    const importeTotal = cuotas.reduce(
      (acc, cuota) => acc + (cuota.importe ?? 0),
      0,
    );
    return { total, vencidas, pagadas, importeTotal };
  }, [cuotas]);

  const toggleSeccion = (id: number, checked: boolean) => {
    setCreateForm((prev) => {
      const nextIds = new Set(prev.seccionIds);
      if (checked) nextIds.add(id);
      else nextIds.delete(id);
      return { ...prev, seccionIds: Array.from(nextIds) };
    });
  };

  const resetCreateForm = () => {
    setCreateForm({
      seccionIds: [],
      concepto: "MENSUALIDAD",
      titulo: "",
      anio: new Date().getFullYear().toString(),
      mes: (new Date().getMonth() + 1).toString(),
      importe: "",
      fechaVencimiento: "",
      porcentajeRecargo: "10",
      matricula: false,
    });
  };

  const resetPagoForm = () => {
    setPagoForm({
      tipo: "cuota",
      cuotaId: "",
      empleadoId: "",
      fecha: "",
      medioPago: "EFECTIVO",
      monto: "",
      referencia: "",
      comprobanteId: "",
      anio: new Date().getFullYear().toString(),
      mes: (new Date().getMonth() + 1).toString(),
      bruto: "",
      neto: "",
    });
  };

  const seccionesOrdenadas = useMemo(() => {
    return [...secciones].sort((a, b) => {
      const nivel = (a.nivel ?? "").localeCompare(b.nivel ?? "");
      if (nivel !== 0) return nivel;
      const grado = (a.gradoSala ?? "").localeCompare(b.gradoSala ?? "");
      if (grado !== 0) return grado;
      return (a.division ?? "").localeCompare(b.division ?? "");
    });
  }, [secciones]);

  const availableTabs = useMemo(() => {
    const tabs: { value: string; label: string }[] = [];
    if (shouldLoadCuotas) {
      tabs.push({
        value: "cuotas",
        label: isFamily ? "Cuotas y matrícula" : "Cuotas",
      });
    }
    if (shouldLoadPagos) {
      tabs.push({ value: "pagos", label: "Pagos registrados" });
    }
    if (shouldLoadRecibos) {
      tabs.push({
        value: "recibos",
        label: isAdmin ? "Recibos de sueldo" : "Mis recibos",
      });
    }
    return tabs;
  }, [shouldLoadCuotas, shouldLoadPagos, shouldLoadRecibos, isFamily, isAdmin]);

  useEffect(() => {
    if (!availableTabs.length) return;
    if (!availableTabs.some((tab) => tab.value === selectedTab)) {
      setSelectedTab(availableTabs[0].value);
    }
  }, [availableTabs, selectedTab]);

  const cuotaMap = useMemo(() => {
    const map = new Map<number, CuotaDTO>();
    for (const cuota of cuotas) {
      if (cuota.id != null) {
        map.set(cuota.id, cuota);
      }
    }
    return map;
  }, [cuotas]);

  const copyToClipboard = useCallback(async (value: string, message: string) => {
    if (!value) return;
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(value);
        toast.success(message);
      } else {
        throw new Error("Clipboard no disponible");
      }
    } catch (error: any) {
      toast.error(error?.message ?? "No se pudo copiar el texto");
    }
  }, []);

  const handleSubmitNuevaCuota = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!createForm.seccionIds.length) {
      toast.error("Seleccioná al menos una sección");
      return;
    }
    const importe = Number.parseFloat(createForm.importe.replace(/,/g, "."));
    if (!Number.isFinite(importe) || importe <= 0) {
      toast.error("Ingresá un monto válido");
      return;
    }
    if (!createForm.fechaVencimiento) {
      toast.error("La fecha de vencimiento es obligatoria");
      return;
    }

    const porcentaje = createForm.porcentajeRecargo
      ? Number.parseFloat(createForm.porcentajeRecargo.replace(/,/g, "."))
      : undefined;
    const anioNumber = createForm.anio ? Number.parseInt(createForm.anio, 10) : undefined;
    const mesNumber =
      createForm.matricula || !createForm.mes
        ? undefined
        : Number.parseInt(createForm.mes, 10);

    const payload: CuotaBulkCreateDTO = {
      seccionIds: createForm.seccionIds,
      concepto: createForm.matricula ? ConceptoCuota.MATRICULA : createForm.concepto,
      subconcepto: createForm.titulo.trim() || undefined,
      anio: anioNumber,
      mes: mesNumber,
      importe,
      fechaVencimiento: createForm.fechaVencimiento,
      porcentajeRecargo: porcentaje,
      observaciones: undefined,
      matricula: createForm.matricula,
    };

    setCreatingCuota(true);
    try {
      const res = await api.cuotas.bulkCreate(payload);
      const creadas = res.data?.length ?? 0;
      if (creadas > 0) {
        toast.success(`Se generaron ${creadas} cuotas`);
      } else {
        toast.success("No se generaron nuevas cuotas (posibles duplicados)");
      }
      setCreateDialogOpen(false);
      resetCreateForm();
      await loadCuotas();
    } catch (error: any) {
      toast.error(error?.response?.data ?? error?.message ?? "No se pudo crear la cuota");
    } finally {
      setCreatingCuota(false);
    }
  };

  const handleSubmitPago = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRegistrandoPago(true);
    try {
      if (pagoForm.tipo === "sueldo") {
        if (!pagoForm.empleadoId) {
          toast.error("Seleccioná un empleado");
          return;
        }
        const anio = Number.parseInt(pagoForm.anio, 10);
        const mes = Number.parseInt(pagoForm.mes, 10);
        const bruto = Number.parseFloat(pagoForm.bruto.replace(/,/g, "."));
        const neto = Number.parseFloat(pagoForm.neto.replace(/,/g, "."));
        if (!Number.isFinite(anio) || !Number.isFinite(mes)) {
          toast.error("Indicá el período del recibo");
          return;
        }
        if (!Number.isFinite(bruto) || !Number.isFinite(neto)) {
          toast.error("Ingresá montos válidos para bruto y neto");
          return;
        }
        const payload: ReciboSueldoCreateDTO = {
          empleadoId: Number.parseInt(pagoForm.empleadoId, 10),
          anio,
          mes,
          bruto,
          neto,
          recibiConforme: false,
          comprobanteArchivoId: pagoForm.comprobanteId || undefined,
        };
        await api.recibos.create(payload);
        toast.success("Recibo de sueldo registrado");
        await loadRecibos();
      } else {
        if (!pagoForm.cuotaId) {
          toast.error("Seleccioná una cuota");
          return;
        }
        const monto = Number.parseFloat(pagoForm.monto.replace(/,/g, "."));
        if (!Number.isFinite(monto) || monto <= 0) {
          toast.error("Ingresá un monto válido");
          return;
        }
        const payload: PagoCuotaCreateDTO = {
          cuotaId: Number.parseInt(pagoForm.cuotaId, 10),
          medioPago: pagoForm.medioPago,
          montoPagado: monto,
          fechaPago: pagoForm.fecha ? `${pagoForm.fecha}T00:00:00Z` : undefined,
          referenciaExterna: pagoForm.referencia || undefined,
          comprobanteArchivoId: pagoForm.comprobanteId || undefined,
        };
        await api.pagosCuota.create(payload);
        toast.success("Pago registrado correctamente");
        await Promise.all([loadPagos(), loadCuotas()]);
      }
      setPagoDialogOpen(false);
      resetPagoForm();
    } catch (error: any) {
      toast.error(error?.response?.data ?? error?.message ?? "No se pudo registrar el pago");
    } finally {
      setRegistrandoPago(false);
    }
  };

  const actualizarEstadoPago = useCallback(
    async (pagoId: number, estado: EstadoPago) => {
      try {
        await api.pagosCuota.updateEstado(pagoId, {
          estadoPago: estado,
          fechaAcreditacion:
            estado === EstadoPago.ACREDITADO ? new Date().toISOString() : undefined,
        });
        toast.success("Estado de pago actualizado");
        await loadPagos();
      } catch (error: any) {
        toast.error(error?.response?.data ?? error?.message ?? "No se pudo actualizar el pago");
      }
    },
    [loadPagos],
  );

  const handleConfirmarRecibo = useCallback(
    async (recibo: ReciboSueldoDTO, value: boolean) => {
      if (!recibo.id) return;
      if (
        recibo.empleadoId == null ||
        recibo.anio == null ||
        recibo.mes == null ||
        recibo.bruto == null ||
        recibo.neto == null
      ) {
        toast.error("El recibo no tiene información suficiente para actualizarse");
        return;
      }
      try {
        await api.recibos.update(recibo.id, {
          ...recibo,
          recibiConforme: value,
          fechaConfirmacion: value ? new Date().toISOString() : (null as any),
        });
        toast.success(value ? "Recibo confirmado" : "Confirmación eliminada");
        await loadRecibos();
      } catch (error: any) {
        toast.error(error?.response?.data ?? error?.message ?? "No se pudo actualizar el recibo");
      }
    },
    [loadRecibos],
  );

  const renderEstadoPago = (estado?: EstadoPago | null) => {
    if (!estado) return null;
    const info = ESTADO_PAGO_LABEL[estado];
    if (!info) return null;
    return <Badge variant={info.variant as any}>{info.label}</Badge>;
  };

  const conceptoTexto = (cuota: CuotaDTO) => {
    if (cuota.subconcepto) return cuota.subconcepto;
    return conceptoLabel(cuota.concepto ?? "MENSUALIDAD");
  };

  const renderCuotasTab = () => {
    if (authLoading) {
      return (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando información...
        </div>
      );
    }

    if (isFamily) {
      if (hijosLoading || cuotasLoading) {
        return (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Preparando tus cuotas...
          </div>
        );
      }

      if (!hijos.length) {
        return (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            <Users className="mx-auto mb-3 h-10 w-10" />
            Aún no hay alumnos asociados a tu cuenta.
          </div>
        );
      }

      return (
        <div className="space-y-6">
          {cuotasError && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{cuotasError}</span>
            </div>
          )}
          <div className="grid gap-4 lg:grid-cols-2">
            {hijos.map((hijo) => {
              const cuotasMatricula = cuotasPorMatricula.get(hijo.matriculaId) ?? [];
              const cuotasMensuales = cuotasMatricula.filter(
                (cuota) => cuota.concepto !== "MATRICULA",
              );
              const matriculas = cuotasMatricula.filter(
                (cuota) => cuota.concepto === "MATRICULA",
              );
              return (
                <Card key={hijo.matriculaId} className="flex h-full flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2">
                      <span>{hijo.nombreCompleto}</span>
                      <Badge variant="outline">
                        {hijo.seccionNombre ?? "Sin sección"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Visualizá el detalle de cuotas y matrícula correspondientes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground">
                        <Calendar className="h-4 w-4" /> Cuotas mensuales
                      </div>
                      {!cuotasMensuales.length ? (
                        <p className="text-sm text-muted-foreground">
                          No hay cuotas registradas aún.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {cuotasMensuales.map((cuota) => {
                            const estado = cuotaEstadoInfo(cuota);
                            return (
                              <div key={cuota.id} className="rounded-lg border bg-card/40 p-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div>
                                    <p className="font-medium">
                                      {formatMonthAndYear(cuota.mes ?? undefined, cuota.anio ?? undefined)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Vence: {formatDate(cuota.fechaVencimiento)}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold">{formatCurrency(cuota.importe)}</p>
                                    <Badge variant={estado.variant}>{estado.label}</Badge>
                                  </div>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                                  <span>Código: {cuota.codigoPago ?? "—"}</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDetalleCuota(cuota)}
                                  >
                                    <FileText className="mr-2 h-4 w-4" /> Ver detalle
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold uppercase text-muted-foreground">
                        <Wallet className="h-4 w-4" /> Matrícula
                      </div>
                      {!matriculas.length ? (
                        <p className="text-sm text-muted-foreground">
                          No hay matrículas registradas todavía.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {matriculas.map((cuota) => {
                            const estado = cuotaEstadoInfo(cuota);
                            return (
                              <div
                                key={cuota.id}
                                className="rounded-lg border border-dashed bg-background p-3"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div>
                                    <p className="font-medium">{cuota.subconcepto || "Matrícula"}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Año: {cuota.anio ?? "—"}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold">{formatCurrency(cuota.importe)}</p>
                                    <Badge variant={estado.variant}>{estado.label}</Badge>
                                  </div>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                                  <span>Código: {cuota.codigoPago ?? "—"}</span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDetalleCuota(cuota)}
                                  >
                                    <FileText className="mr-2 h-4 w-4" /> Ver detalle
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      );
    }

    if (isAdmin) {
      return (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Gestión de cuotas</h2>
              <p className="text-sm text-muted-foreground">
                Administrá cuotas, matrículas y visualizá el estado financiero por sección.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Nueva cuota
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  resetPagoForm();
                  setPagoDialogOpen(true);
                }}
              >
                <DollarSign className="mr-2 h-4 w-4" /> Registrar pago
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cuotas generadas</CardTitle>
                <Users className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resumenCuotas.total}</div>
                <p className="text-xs text-muted-foreground">Totales registradas en el sistema</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Importe emitido</CardTitle>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(resumenCuotas.importeTotal)}</div>
                <p className="text-xs text-muted-foreground">Suma de cuotas y matrículas</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cuotas vencidas</CardTitle>
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resumenCuotas.vencidas}</div>
                <p className="text-xs text-muted-foreground">Incluye vencimientos al día de hoy</p>
              </CardContent>
            </Card>
          </div>

          {cuotasError && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{cuotasError}</span>
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Listado de cuotas</CardTitle>
              <CardDescription>
                Visualizá cada cuota generada y accedé rápidamente al código de pago.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cuotasLoading ? (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando cuotas...
                </div>
              ) : !cuotasOrdenadasAdmin.length ? (
                <p className="text-sm text-muted-foreground">
                  Aún no se registraron cuotas. Creá la primera para comenzar.
                </p>
              ) : (
                <div className="space-y-3">
                  {cuotasOrdenadasAdmin.map((cuota) => {
                    const info = cuotaEstadoInfo(cuota);
                    return (
                      <div
                        key={cuota.id}
                        className="grid gap-3 rounded-lg border p-4 md:grid-cols-5 md:items-center"
                      >
                        <div className="md:col-span-2">
                          <p className="font-medium">{conceptoTexto(cuota)}</p>
                          <p className="text-sm text-muted-foreground">
                            {getAlumnoNombre(cuota.matriculaId)} — {getAlumnoSeccion(cuota.matriculaId)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Período</p>
                          <p className="text-sm text-muted-foreground">
                            {formatMonthAndYear(cuota.mes ?? undefined, cuota.anio ?? undefined)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(cuota.importe)}</p>
                          <Badge variant={info.variant}>{info.label}</Badge>
                        </div>
                        <div className="flex flex-col items-end gap-2 md:items-start">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(
                                cuota.codigoPago ?? "",
                                "Código de pago copiado",
                              )
                            }
                          >
                            <Download className="mr-2 h-4 w-4" /> Copiar código
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDetalleCuota(cuota)}>
                            Detalle
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        No tenés permisos para visualizar cuotas en este momento.
      </div>
    );
  };

  const renderPagosTab = () => {
    if (!shouldLoadPagos) {
      return (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          No tenés acceso al registro de pagos.
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Pagos registrados</h2>
            <p className="text-sm text-muted-foreground">
              Validá los pagos recibidos y gestioná su estado de acreditación.
            </p>
          </div>
          <Button onClick={() => setPagoDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo pago
          </Button>
        </div>
        {pagosError && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{pagosError}</span>
          </div>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Historial</CardTitle>
            <CardDescription>Pagos ordenados por fecha de registro.</CardDescription>
          </CardHeader>
          <CardContent>
            {pagosLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando pagos...
              </div>
            ) : !pagosOrdenados.length ? (
              <p className="text-sm text-muted-foreground">Aún no hay pagos registrados.</p>
            ) : (
              <div className="space-y-3">
                {pagosOrdenados.map((pago) => {
                  const cuota = pago.cuotaId ? cuotaMap.get(pago.cuotaId) ?? null : null;
                  return (
                    <div
                      key={pago.id}
                      className="grid gap-3 rounded-lg border p-4 md:grid-cols-5 md:items-center"
                    >
                      <div className="md:col-span-2">
                        <p className="font-medium">{cuota ? conceptoTexto(cuota) : "Pago sin cuota"}</p>
                        <p className="text-sm text-muted-foreground">
                          {cuota
                            ? `${getAlumnoNombre(cuota.matriculaId)} — ${formatMonthAndYear(
                                cuota.mes ?? undefined,
                                cuota.anio ?? undefined,
                              )}`
                            : ""}
                        </p>
                        {pago.referenciaExterna && (
                          <p className="text-xs text-muted-foreground">
                            Ref.: {pago.referenciaExterna}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Fecha</p>
                        <p className="text-sm text-muted-foreground">
                          {pago.fechaPago
                            ? formatDate(pago.fechaPago.slice(0, 10))
                            : "Sin registrar"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(pago.montoPagado)}</p>
                        <p className="text-xs text-muted-foreground">{pago.medioPago}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 md:items-start">
                        {renderEstadoPago(pago.estadoPago)}
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => actualizarEstadoPago(pago.id, EstadoPago.ACREDITADO)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" /> Acreditar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => actualizarEstadoPago(pago.id, EstadoPago.EN_REVISION)}
                          >
                            Revisar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => actualizarEstadoPago(pago.id, EstadoPago.RECHAZADO)}
                          >
                            Rechazar
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderRecibosTab = () => {
    if (!shouldLoadRecibos) {
      return (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          No tenés acceso a los recibos de sueldo.
        </div>
      );
    }

    const listado = isAdmin ? recibosOrdenados : misRecibos;

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">
              {isAdmin ? "Recibos del personal" : "Mis recibos"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isAdmin
                ? "Consulta los recibos emitidos y verifica su confirmación."
                : "Descargá y confirmá la recepción de tus recibos de sueldo."}
            </p>
          </div>
          {isAdmin && (
            <Button
              variant="outline"
              onClick={() => {
                resetPagoForm();
                setPagoForm((prev) => ({ ...prev, tipo: "sueldo" }));
                setPagoDialogOpen(true);
              }}
            >
              <Upload className="mr-2 h-4 w-4" /> Nuevo recibo
            </Button>
          )}
        </div>

        {recibosError && (
          <div className="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{recibosError}</span>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Recibos</CardTitle>
            <CardDescription>
              {isAdmin
                ? "Listado cronológico de recibos emitidos al personal."
                : "Recibos disponibles para descargar y confirmar."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recibosLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando recibos...
              </div>
            ) : !listado.length ? (
              <p className="text-sm text-muted-foreground">
                {isAdmin
                  ? "Aún no se registraron recibos."
                  : "Todavía no tenés recibos disponibles."}
              </p>
            ) : (
              <div className="space-y-3">
                {listado.map((recibo) => {
                  const empleadoNombre = getEmpleadoNombre(recibo.empleadoId);
                  const periodo = formatMonthAndYear(
                    recibo.mes ?? undefined,
                    recibo.anio ?? undefined,
                  );
                  return (
                    <div
                      key={recibo.id}
                      className="grid gap-3 rounded-lg border p-4 md:grid-cols-5 md:items-center"
                    >
                      <div className="md:col-span-2">
                        <p className="font-medium">{empleadoNombre}</p>
                        <p className="text-sm text-muted-foreground">Período {periodo}</p>
                        <p className="text-xs text-muted-foreground">
                          Bruto: {formatCurrency(recibo.bruto)} — Neto: {formatCurrency(recibo.neto)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Estado</p>
                        <p className="text-sm text-muted-foreground">
                          {recibo.recibiConforme ? "Recibí conforme" : "Pendiente de confirmación"}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {recibo.comprobanteArchivoId ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              copyToClipboard(
                                recibo.comprobanteArchivoId ?? "",
                                "Identificador de archivo copiado",
                              )
                            }
                          >
                            <Download className="mr-2 h-4 w-4" /> Copiar comprobante
                          </Button>
                        ) : (
                          <span>Sin comprobante adjunto</span>
                        )}
                      </div>
                      <div className="flex flex-wrap justify-end gap-2 md:justify-start">
                        {isTeacher && (
                          <Button
                            size="sm"
                            variant={recibo.recibiConforme ? "secondary" : "outline"}
                            onClick={() => handleConfirmarRecibo(recibo, !recibo.recibiConforme)}
                          >
                            {recibo.recibiConforme ? "Quitar confirmación" : "Recibí conforme"}
                          </Button>
                        )}
                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              resetPagoForm();
                              setPagoForm((prev) => ({
                                ...prev,
                                tipo: "sueldo",
                                empleadoId:
                                  recibo.empleadoId != null ? String(recibo.empleadoId) : "",
                                anio:
                                  recibo.anio != null ? String(recibo.anio) : prev.anio,
                                mes:
                                  recibo.mes != null ? String(recibo.mes) : prev.mes,
                                bruto:
                                  recibo.bruto != null ? String(recibo.bruto) : prev.bruto,
                                neto:
                                  recibo.neto != null ? String(recibo.neto) : prev.neto,
                                comprobanteId: recibo.comprobanteArchivoId ?? "",
                              }));
                              setPagoDialogOpen(true);
                            }}
                          >
                            Gestionar
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const detalleRecargo = detallesRecargo(detalleCuota);
  const cuotasDisponiblesParaPago =
    pagoForm.tipo === "matricula"
      ? cuotasParaPago.cuotasMatricula
      : pagoForm.tipo === "cuota"
        ? cuotasParaPago.cuotasMensuales
        : [];
  const pagoDialogTitle =
    pagoForm.tipo === "sueldo"
      ? "Registrar recibo de sueldo"
      : pagoForm.tipo === "matricula"
        ? "Registrar pago de matrícula"
        : "Registrar pago de cuota";
  const pagoDialogDescription =
    pagoForm.tipo === "sueldo"
      ? "Cargá el recibo correspondiente y dejá constancia para el personal."
      : pagoForm.tipo === "matricula"
        ? "Registrá un pago asociado a la matrícula seleccionada."
        : "Registrá un pago asociado a la cuota seleccionada.";

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Pagos y cuotas</h2>
            <p className="text-sm text-muted-foreground">
              {isAdmin
                ? "Generá cuotas, registrá pagos y administrá los recibos del personal."
                : isTeacher
                  ? "Consultá tus recibos de sueldo y confirmá la recepción."
                  : "Accedé al estado de cuotas y matrículas de tu familia."}
            </p>
          </div>
        </div>

        {!availableTabs.length ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            No tenés acceso a la información de pagos en este momento.
          </div>
        ) : (
          <Tabs
            value={selectedTab}
            onValueChange={(value) => setSelectedTab(value)}
            className="space-y-6"
          >
            <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
              {availableTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {availableTabs.some((tab) => tab.value === "cuotas") && (
              <TabsContent
                value="cuotas"
                className="space-y-6 focus-visible:outline-none"
              >
                {renderCuotasTab()}
              </TabsContent>
            )}

            {availableTabs.some((tab) => tab.value === "pagos") && (
              <TabsContent
                value="pagos"
                className="space-y-6 focus-visible:outline-none"
              >
                {renderPagosTab()}
              </TabsContent>
            )}

            {availableTabs.some((tab) => tab.value === "recibos") && (
              <TabsContent
                value="recibos"
                className="space-y-6 focus-visible:outline-none"
              >
                {renderRecibosTab()}
              </TabsContent>
            )}
          </Tabs>
        )}

        <Dialog
          open={!!detalleCuota}
          onOpenChange={(open) => {
            if (!open) setDetalleCuota(null);
          }}
        >
          <DialogContent className="max-w-xl">
            {detalleCuota && (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle>Detalle de cuota</DialogTitle>
                  <DialogDescription>
                    Información completa de la cuota seleccionada.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">
                      {conceptoTexto(detalleCuota)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatMonthAndYear(
                        detalleCuota.mes ?? undefined,
                        detalleCuota.anio ?? undefined,
                      )}
                    </p>
                  </div>
                  {(() => {
                    const info = cuotaEstadoInfo(detalleCuota);
                    return <Badge variant={info.variant}>{info.label}</Badge>;
                  })()}
                </div>

                <div className="grid gap-3 text-sm md:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs uppercase text-muted-foreground">Alumno</p>
                    <p className="font-medium">
                      {getAlumnoNombre(detalleCuota.matriculaId)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase text-muted-foreground">Sección</p>
                    <p className="font-medium">
                      {getAlumnoSeccion(detalleCuota.matriculaId)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase text-muted-foreground">Vencimiento</p>
                    <p className="font-medium">
                      {formatDate(detalleCuota.fechaVencimiento)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs uppercase text-muted-foreground">Código de pago</p>
                    <p className="font-mono text-sm">
                      {detalleCuota.codigoPago ?? "—"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 rounded-md border p-3 text-sm">
                  <p className="font-semibold">Importe y recargo</p>
                  <div className="flex items-center justify-between">
                    <span>Importe base</span>
                    <span>{formatCurrency(detalleCuota.importe)}</span>
                  </div>
                  {detalleRecargo.porcentaje > 0 ? (
                    <>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Recargo ({detalleRecargo.porcentaje}%)</span>
                        <span>{formatCurrency(detalleRecargo.recargo)}</span>
                      </div>
                      <div className="flex items-center justify-between font-semibold">
                        <span>Total con recargo</span>
                        <span>{formatCurrency(detalleRecargo.total)}</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground">
                      Sin recargo configurado para esta cuota.
                    </p>
                  )}
                </div>

                {detalleCuota.observaciones && (
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold">Observaciones</p>
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {detalleCuota.observaciones}
                    </p>
                  </div>
                )}

                <DialogFooter className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm text-muted-foreground">
                    Código:
                    <span className="ml-1 font-mono">
                      {detalleCuota.codigoPago ?? "—"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        copyToClipboard(
                          detalleCuota.codigoPago ?? "",
                          "Código de pago copiado",
                        )
                      }
                    >
                      <Download className="mr-2 h-4 w-4" /> Copiar código
                    </Button>
                    <Button type="button" onClick={() => setDetalleCuota(null)}>
                      Cerrar
                    </Button>
                  </div>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog
          open={createDialogOpen}
          onOpenChange={(open) => {
            setCreateDialogOpen(open);
            if (!open) {
              resetCreateForm();
            }
          }}
        >
          <DialogContent className="max-w-3xl">
            <form onSubmit={handleSubmitNuevaCuota} className="space-y-6">
              <DialogHeader>
                <DialogTitle>Nueva cuota</DialogTitle>
                <DialogDescription>
                  Definí el período, concepto e importe que se aplicará a las secciones
                  seleccionadas.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <Label>Secciones</Label>
                  <div className="max-h-60 space-y-2 overflow-auto rounded-md border p-3 text-sm">
                    {seccionesLoading ? (
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Cargando secciones...
                      </div>
                    ) : !seccionesOrdenadas.length ? (
                      <p className="text-muted-foreground">
                        No hay secciones disponibles para generar cuotas.
                      </p>
                    ) : (
                      seccionesOrdenadas.map((seccion) => {
                        if (seccion.id == null) return null;
                        const checked = createForm.seccionIds.includes(seccion.id);
                        const nombreSeccion = [
                          seccion.nivel,
                          seccion.gradoSala,
                          seccion.division,
                        ]
                          .filter(Boolean)
                          .join(" ")
                          .trim();
                        return (
                          <div key={seccion.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`seccion-${seccion.id}`}
                              checked={checked}
                              onCheckedChange={(value) =>
                                toggleSeccion(seccion.id!, Boolean(value))
                              }
                            />
                            <Label
                              htmlFor={`seccion-${seccion.id}`}
                              className="flex-1 cursor-pointer text-sm"
                            >
                              {nombreSeccion || `Sección #${seccion.id}`}
                            </Label>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Checkbox
                      id="matricula"
                      checked={createForm.matricula}
                      onCheckedChange={(value) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          matricula: Boolean(value),
                        }))
                      }
                    />
                    <Label htmlFor="matricula" className="cursor-pointer">
                      Marcar como matrícula
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Las cuotas de matrícula no requieren selección de mes y se generan una única
                    vez por ciclo lectivo.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="concepto">Concepto</Label>
                    <Select
                      value={createForm.concepto}
                      onValueChange={(value) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          concepto: value as ConceptoCuota,
                        }))
                      }
                      disabled={createForm.matricula}
                    >
                      <SelectTrigger id="concepto">
                        <SelectValue placeholder="Seleccioná un concepto" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CONCEPTO_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="titulo">Título o descripción</Label>
                    <Input
                      id="titulo"
                      value={createForm.titulo}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          titulo: event.target.value,
                        }))
                      }
                      placeholder="Ej. Marzo 2025"
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="anio">Año</Label>
                      <Input
                        id="anio"
                        type="number"
                        value={createForm.anio}
                        onChange={(event) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            anio: event.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="mes">Mes</Label>
                      <Select
                        value={createForm.mes}
                        onValueChange={(value) =>
                          setCreateForm((prev) => ({
                            ...prev,
                            mes: value,
                          }))
                        }
                        disabled={createForm.matricula}
                      >
                        <SelectTrigger id="mes">
                          <SelectValue placeholder="Seleccioná el mes" />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTH_LABELS.map((label, index) => {
                            const value = String(index + 1);
                            return (
                              <SelectItem key={value} value={value}>
                                {label.charAt(0).toUpperCase() + label.slice(1)}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="importe">Importe</Label>
                    <Input
                      id="importe"
                      type="number"
                      step="0.01"
                      min="0"
                      value={createForm.importe}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          importe: event.target.value,
                        }))
                      }
                      placeholder="0,00"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="fechaVencimiento">Fecha de vencimiento</Label>
                    <Input
                      id="fechaVencimiento"
                      type="date"
                      value={createForm.fechaVencimiento}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          fechaVencimiento: event.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="porcentajeRecargo">Recargo por mora (%)</Label>
                    <Input
                      id="porcentajeRecargo"
                      type="number"
                      step="0.1"
                      min="0"
                      value={createForm.porcentajeRecargo}
                      onChange={(event) =>
                        setCreateForm((prev) => ({
                          ...prev,
                          porcentajeRecargo: event.target.value,
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Este porcentaje se aplicará automáticamente a los pagos fuera de término.
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={creatingCuota}>
                  {creatingCuota && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear cuota
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={pagoDialogOpen}
          onOpenChange={(open) => {
            setPagoDialogOpen(open);
            if (!open) {
              resetPagoForm();
            }
          }}
        >
          <DialogContent className="max-w-2xl">
            <form onSubmit={handleSubmitPago} className="space-y-6">
              <DialogHeader>
                <DialogTitle>{pagoDialogTitle}</DialogTitle>
                <DialogDescription>{pagoDialogDescription}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="tipoRegistro">Tipo de registro</Label>
                  <Select
                    value={pagoForm.tipo}
                    onValueChange={(value) =>
                      setPagoForm((prev) => ({
                        ...prev,
                        tipo: value as typeof pagoForm.tipo,
                      }))
                    }
                  >
                    <SelectTrigger id="tipoRegistro">
                      <SelectValue placeholder="Seleccioná el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cuota">Pago de cuota</SelectItem>
                      <SelectItem value="matricula">Pago de matrícula</SelectItem>
                      <SelectItem value="sueldo">Recibo de sueldo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {pagoForm.tipo === "sueldo" ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2 md:col-span-2">
                      <Label htmlFor="empleado">Empleado</Label>
                      <Select
                        value={pagoForm.empleadoId}
                        onValueChange={(value) =>
                          setPagoForm((prev) => ({
                            ...prev,
                            empleadoId: value,
                          }))
                        }
                      >
                        <SelectTrigger id="empleado">
                          <SelectValue placeholder="Seleccioná un empleado" />
                        </SelectTrigger>
                        <SelectContent>
                          {!empleados.length ? (
                            <SelectItem value="" disabled>
                              No hay empleados disponibles
                            </SelectItem>
                          ) : (
                            empleados.map((empleado) => (
                              <SelectItem
                                key={empleado.id}
                                value={empleado.id != null ? String(empleado.id) : ""}
                                disabled={empleado.id == null}
                              >
                                {getEmpleadoNombre(empleado.id)}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="anioRecibo">Año</Label>
                      <Input
                        id="anioRecibo"
                        type="number"
                        value={pagoForm.anio}
                        onChange={(event) =>
                          setPagoForm((prev) => ({
                            ...prev,
                            anio: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="mesRecibo">Mes</Label>
                      <Select
                        value={pagoForm.mes}
                        onValueChange={(value) =>
                          setPagoForm((prev) => ({
                            ...prev,
                            mes: value,
                          }))
                        }
                      >
                        <SelectTrigger id="mesRecibo">
                          <SelectValue placeholder="Seleccioná el mes" />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTH_LABELS.map((label, index) => {
                            const value = String(index + 1);
                            return (
                              <SelectItem key={value} value={value}>
                                {label.charAt(0).toUpperCase() + label.slice(1)}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="bruto">Monto bruto</Label>
                      <Input
                        id="bruto"
                        type="number"
                        step="0.01"
                        min="0"
                        value={pagoForm.bruto}
                        onChange={(event) =>
                          setPagoForm((prev) => ({
                            ...prev,
                            bruto: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="neto">Monto neto</Label>
                      <Input
                        id="neto"
                        type="number"
                        step="0.01"
                        min="0"
                        value={pagoForm.neto}
                        onChange={(event) =>
                          setPagoForm((prev) => ({
                            ...prev,
                            neto: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="grid gap-2 md:col-span-2">
                      <Label htmlFor="comprobanteRecibo">Identificador de comprobante</Label>
                      <Input
                        id="comprobanteRecibo"
                        value={pagoForm.comprobanteId}
                        onChange={(event) =>
                          setPagoForm((prev) => ({
                            ...prev,
                            comprobanteId: event.target.value,
                          }))
                        }
                        placeholder="ID del archivo o referencia"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2 md:col-span-2">
                      <Label htmlFor="cuotaId">Cuota</Label>
                      <Select
                        value={pagoForm.cuotaId}
                        onValueChange={(value) =>
                          setPagoForm((prev) => ({
                            ...prev,
                            cuotaId: value,
                          }))
                        }
                      >
                        <SelectTrigger id="cuotaId">
                          <SelectValue placeholder="Seleccioná una cuota" />
                        </SelectTrigger>
                        <SelectContent>
                          {!cuotasDisponiblesParaPago.length ? (
                            <SelectItem value="" disabled>
                              No hay cuotas disponibles
                            </SelectItem>
                          ) : (
                            cuotasDisponiblesParaPago.map((cuota) => (
                              <SelectItem
                                key={cuota.id}
                                value={cuota.id != null ? String(cuota.id) : ""}
                                disabled={cuota.id == null}
                              >
                                {`${conceptoTexto(cuota)} · ${getAlumnoNombre(
                                  cuota.matriculaId,
                                )} · ${formatMonthAndYear(
                                  cuota.mes ?? undefined,
                                  cuota.anio ?? undefined,
                                )}`}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="fechaPago">Fecha de pago</Label>
                      <Input
                        id="fechaPago"
                        type="date"
                        value={pagoForm.fecha}
                        onChange={(event) =>
                          setPagoForm((prev) => ({
                            ...prev,
                            fecha: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="montoPago">Monto abonado</Label>
                      <Input
                        id="montoPago"
                        type="number"
                        step="0.01"
                        min="0"
                        value={pagoForm.monto}
                        onChange={(event) =>
                          setPagoForm((prev) => ({
                            ...prev,
                            monto: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="medioPago">Medio de pago</Label>
                      <Select
                        value={pagoForm.medioPago}
                        onValueChange={(value) =>
                          setPagoForm((prev) => ({
                            ...prev,
                            medioPago: value as MedioPago,
                          }))
                        }
                      >
                        <SelectTrigger id="medioPago">
                          <SelectValue placeholder="Seleccioná un medio" />
                        </SelectTrigger>
                        <SelectContent>
                          {medioPagoOptions.map((medio) => (
                            <SelectItem key={medio} value={medio}>
                              {formatMedioPagoLabel(medio)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="referencia">Referencia externa</Label>
                      <Input
                        id="referencia"
                        value={pagoForm.referencia}
                        onChange={(event) =>
                          setPagoForm((prev) => ({
                            ...prev,
                            referencia: event.target.value,
                          }))
                        }
                        placeholder="Número de comprobante, transacción, etc."
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="comprobante">Identificador de comprobante</Label>
                      <Input
                        id="comprobante"
                        value={pagoForm.comprobanteId}
                        onChange={(event) =>
                          setPagoForm((prev) => ({
                            ...prev,
                            comprobanteId: event.target.value,
                          }))
                        }
                        placeholder="ID del archivo o referencia"
                      />
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPagoDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={registrandoPago}>
                  {registrandoPago && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Guardar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

function detallesRecargo(cuota?: CuotaDTO | null) {
  const importe = Number(cuota?.importe ?? 0);
  const porcentaje = Number(cuota?.porcentajeRecargo ?? 0);
  const safeImporte = Number.isFinite(importe) ? importe : 0;
  const safePorcentaje = Number.isFinite(porcentaje) ? porcentaje : 0;
  const recargo = safeImporte * (safePorcentaje / 100);
  return {
    porcentaje: Math.round(safePorcentaje * 100) / 100,
    recargo,
    total: safeImporte + recargo,
  };
}

function formatMedioPagoLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}
