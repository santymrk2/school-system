"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { DashboardLayout } from "@/app/dashboard/dashboard-layout";
import LoadingState from "@/components/common/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { formatDni } from "@/lib/form-utils";
import { api } from "@/services/api";
import { isBirthDateValid, maxBirthDate } from "@/lib/form-utils";
import {
  RolEmpleado,
  UserRole,
  type AsignacionDocenteMateriaDTO,
  type AsignacionDocenteSeccionDTO,
  type EmpleadoDTO,
  type FormacionAcademicaDTO,
  type LicenciaDTO,
  type MateriaDTO,
  type PersonaDTO,
  type SeccionDTO,
} from "@/types/api-generated";
import {
  AlertCircle,
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  User,
  Users,
} from "lucide-react";

const rolOptions = [
  { value: RolEmpleado.DIRECCION, label: "Dirección" },
  { value: RolEmpleado.ADMINISTRACION, label: "Administración" },
  { value: RolEmpleado.SECRETARIA, label: "Secretaría" },
  { value: RolEmpleado.DOCENTE, label: "Docente" },
];

const tipoLicenciaOptions = [
  { value: "ENFERMEDAD", label: "Enfermedad" },
  { value: "CUIDADO_FAMILIAR", label: "Cuidado familiar" },
  { value: "FORMACION", label: "Formación" },
  { value: "PERSONAL", label: "Motivo personal" },
  { value: "MATERNIDAD", label: "Maternidad / Paternidad" },
  { value: "OTRA", label: "Otra" },
];

const initialPersonaForm = {
  nombre: "",
  apellido: "",
  dni: "",
  fechaNacimiento: "",
  genero: "",
  estadoCivil: "",
  nacionalidad: "",
  domicilio: "",
  telefono: "",
  celular: "",
  email: "",
};

const initialEmpleadoForm = {
  rolEmpleado: RolEmpleado.DOCENTE,
  cuil: "",
  condicionLaboral: "",
  cargo: "",
  situacionActual: "ACTIVO",
  fechaIngreso: "",
  antecedentesLaborales: "",
  observacionesGenerales: "",
};

const initialFormacionForm = {
  nivel: "",
  tituloObtenido: "",
  institucion: "",
  fechaInicio: "",
  fechaFin: "",
};

const initialFormacionNotas = {
  otrosTitulos: "",
  especializaciones: "",
  cursos: "",
};

const initialLicenseForm = {
  empleadoId: "",
  tipoLicencia: "",
  fechaInicio: "",
  fechaFin: "",
  justificada: "si" as "si" | "no",
  horasAusencia: "",
  motivo: "",
  observaciones: "",
};

type NewPersonaForm = typeof initialPersonaForm;
type NewEmpleadoForm = typeof initialEmpleadoForm;
type NewFormacionForm = typeof initialFormacionForm;
type FormacionNotas = typeof initialFormacionNotas;
type NewLicenseForm = typeof initialLicenseForm;

type EmpleadoView = {
  empleado: EmpleadoDTO;
  persona: PersonaDTO | null;
  secciones: Array<{ id: number; label: string; nivel?: string | null }>;
  materias: Array<{ id: number; nombre: string }>;
  formaciones: FormacionAcademicaDTO[];
  licencias: LicenciaDTO[];
};

const nivelLabel: Record<string, string> = {
  INICIAL: "Inicial",
  PRIMARIO: "Primario",
};

function formatNivel(value?: string | null) {
  if (!value) return "";
  return nivelLabel[value] ?? value.charAt(0) + value.slice(1).toLowerCase();
}

function formatRol(rol?: RolEmpleado | null) {
  if (!rol) return "Sin rol";
  const option = rolOptions.find((r) => r.value === rol);
  return option?.label ?? rol.charAt(0) + rol.slice(1).toLowerCase();
}

function buildFullName(persona?: PersonaDTO | null) {
  const nombre = persona?.nombre ?? "";
  const apellido = persona?.apellido ?? "";
  return `${nombre} ${apellido}`.trim();
}

function formatSeccionLabel(seccion?: Partial<SeccionDTO> | null) {
  if (!seccion) return "";
  const grado = seccion.gradoSala ?? "";
  const division = seccion.division ? ` ${seccion.division}` : "";
  const turno = seccion.turno ? ` (${seccion.turno.toLowerCase()})` : "";
  const composed = `${grado}${division}`.trim();
  return composed ? `${composed}${turno}` : `Sección #${seccion.id ?? ""}`;
}

const dateFormatter = new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" });

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return dateFormatter.format(date);
}

function formatTipoLicencia(value?: string | null) {
  if (!value) return "Sin tipo";
  const option = tipoLicenciaOptions.find((opt) => opt.value === value);
  if (option) {
    return option.label;
  }
  const normalized = value.replace(/_/g, " ").toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

async function safeRequest<T>(
  promise: Promise<{ data?: T }>,
  fallback: T,
  label: string,
): Promise<T> {
  try {
    const res = await promise;
    return (res.data ?? fallback) as T;
  } catch (error) {
    console.error(label, error);
    return fallback;
  }
}

function getSituacionBadge(situacion?: string | null) {
  const normalized = (situacion ?? "").toLowerCase();
  if (normalized === "activo") {
    return (
      <Badge variant="default">
        <CheckCircle className="mr-1 h-3 w-3" /> Activo
      </Badge>
    );
  }
  if (normalized.includes("licencia")) {
    return (
      <Badge variant="secondary">
        <Clock className="mr-1 h-3 w-3" /> En licencia
      </Badge>
    );
  }
  if (normalized.includes("baja")) {
    return (
      <Badge variant="destructive">
        <AlertCircle className="mr-1 h-3 w-3" /> Baja
      </Badge>
    );
  }
  const label = situacion && situacion.length ? situacion : "Sin estado";
  return <Badge variant="outline">{label}</Badge>;
}

function getLicenseStart(licencia: LicenciaDTO) {
  return licencia.fechaInicio ?? "";
}
export default function PersonalPage() {
  const { loading, user, hasRole } = useAuth();
  const router = useRouter();
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (
      !(
        hasRole(UserRole.DIRECTOR) ||
        hasRole(UserRole.SECRETARY) ||
        hasRole(UserRole.ADMIN)
      )
    ) {
      router.replace("/dashboard");
    }
  }, [loading, user, hasRole, router]);

  const [selectedTab, setSelectedTab] = useState("listado");
  const [searchTerm, setSearchTerm] = useState("");
  const [nivelFilter, setNivelFilter] = useState("all");
  const [seccionFilter, setSeccionFilter] = useState("all");
  const [materiaFilter, setMateriaFilter] = useState("all");
  const [cargoFilter, setCargoFilter] = useState("all");
  const [situacionFilter, setSituacionFilter] = useState("all");

  const [dataLoading, setDataLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [personal, setPersonal] = useState<EmpleadoView[]>([]);
  const [allLicencias, setAllLicencias] = useState<LicenciaDTO[]>([]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [licenseDialogOpen, setLicenseDialogOpen] = useState(false);
  const [creatingPersonal, setCreatingPersonal] = useState(false);
  const [creatingLicense, setCreatingLicense] = useState(false);

  const [newPersona, setNewPersona] = useState<NewPersonaForm>({
    ...initialPersonaForm,
  });
  const [newEmpleado, setNewEmpleado] = useState<NewEmpleadoForm>({
    ...initialEmpleadoForm,
  });
  const [newFormacion, setNewFormacion] = useState<NewFormacionForm>({
    ...initialFormacionForm,
  });
  const [formacionNotas, setFormacionNotas] = useState<FormacionNotas>({
    ...initialFormacionNotas,
  });
  const [newLicense, setNewLicense] = useState<NewLicenseForm>({
    ...initialLicenseForm,
  });

  const resetNewPersonalForm = useCallback(() => {
    setNewPersona({ ...initialPersonaForm });
    setNewEmpleado({ ...initialEmpleadoForm });
    setNewFormacion({ ...initialFormacionForm });
    setFormacionNotas({ ...initialFormacionNotas });
  }, []);

  const resetNewLicenseForm = useCallback(() => {
    setNewLicense({ ...initialLicenseForm });
  }, []);

  useEffect(() => {
    if (!createDialogOpen) {
      resetNewPersonalForm();
      setCreatingPersonal(false);
    }
  }, [createDialogOpen, resetNewPersonalForm]);

  useEffect(() => {
    if (!licenseDialogOpen) {
      resetNewLicenseForm();
      setCreatingLicense(false);
    }
  }, [licenseDialogOpen, resetNewLicenseForm]);

  const fetchData = useCallback(async () => {
    const empleadosRes = await api.empleados.list();
    const empleados = (empleadosRes.data ?? []) as EmpleadoDTO[];

    const [
      licencias,
      formaciones,
      secciones,
      materias,
      asignacionesSeccion,
      asignacionesMateria,
    ] = await Promise.all([
      safeRequest<LicenciaDTO[]>(
        api.licencias.list(),
        [] as LicenciaDTO[],
        "No se pudieron obtener las licencias",
      ),
      safeRequest<FormacionAcademicaDTO[]>(
        api.formaciones.list(),
        [] as FormacionAcademicaDTO[],
        "No se pudo obtener la formación académica",
      ),
      safeRequest<SeccionDTO[]>(
        api.secciones.list(),
        [] as SeccionDTO[],
        "No se pudieron obtener las secciones",
      ),
      safeRequest<MateriaDTO[]>(
        api.materias.list(),
        [] as MateriaDTO[],
        "No se pudieron obtener las materias",
      ),
      safeRequest<AsignacionDocenteSeccionDTO[]>(
        api.asignacionDocenteSeccion.list(),
        [] as AsignacionDocenteSeccionDTO[],
        "No se pudieron obtener las asignaciones de sección",
      ),
      safeRequest<AsignacionDocenteMateriaDTO[]>(
        api.asignacionDocenteMateria.list(),
        [] as AsignacionDocenteMateriaDTO[],
        "No se pudieron obtener las asignaciones de materia",
      ),
    ]);

    const personaIds = Array.from(
      new Set(
        empleados
          .map((emp) => emp.personaId)
          .filter((id): id is number => typeof id === "number"),
      ),
    );

    const personaEntries = await Promise.all(
      personaIds.map(async (id) => {
        try {
          const res = await api.personasCore.getById(id);
          return [id, res.data ?? null] as const;
        } catch (error) {
          console.error("No se pudo obtener la persona", id, error);
          return [id, null] as const;
        }
      }),
    );

    const personaMap = new Map<number, PersonaDTO | null>(personaEntries as Array<readonly [number, PersonaDTO | null]>);

    const seccionMap = new Map<number, SeccionDTO>();
    for (const seccion of secciones) {
      if (typeof seccion.id === "number") {
        seccionMap.set(seccion.id, seccion);
      }
    }

    const materiaMap = new Map<number, MateriaDTO>();
    for (const materia of materias) {
      if (typeof materia.id === "number") {
        materiaMap.set(materia.id, materia);
      }
    }

    const seccionesPorEmpleado = new Map<number, Set<number>>();
    for (const asign of asignacionesSeccion as Array<any>) {
      const empleadoId =
        asign.empleadoId ?? asign.personalId ?? asign.docenteId;
      const seccionId = asign.seccionId ?? asign.seccion?.id;
      if (typeof empleadoId !== "number" || typeof seccionId !== "number") {
        continue;
      }
      if (!seccionesPorEmpleado.has(empleadoId)) {
        seccionesPorEmpleado.set(empleadoId, new Set());
      }
      seccionesPorEmpleado.get(empleadoId)!.add(seccionId);
    }

    const materiasPorEmpleado = new Map<number, Set<number>>();
    for (const asign of asignacionesMateria as Array<any>) {
      const empleadoId =
        asign.empleadoId ?? asign.personalId ?? asign.docenteId;
      const materiaId = asign.materiaId ?? asign.materia?.id;
      if (typeof empleadoId !== "number" || typeof materiaId !== "number") {
        continue;
      }
      if (!materiasPorEmpleado.has(empleadoId)) {
        materiasPorEmpleado.set(empleadoId, new Set());
      }
      materiasPorEmpleado.get(empleadoId)!.add(materiaId);
    }

    const licenciasPorEmpleado = new Map<number, LicenciaDTO[]>();
    for (const licencia of licencias) {
      if (typeof licencia.empleadoId !== "number") continue;
      const list = licenciasPorEmpleado.get(licencia.empleadoId) ?? [];
      list.push(licencia);
      licenciasPorEmpleado.set(licencia.empleadoId, list);
    }

    const formacionesPorEmpleado = new Map<number, FormacionAcademicaDTO[]>();
    for (const formacion of formaciones) {
      if (typeof formacion.empleadoId !== "number") continue;
      const list = formacionesPorEmpleado.get(formacion.empleadoId) ?? [];
      list.push(formacion);
      formacionesPorEmpleado.set(formacion.empleadoId, list);
    }

    const personalData: EmpleadoView[] = empleados.map((empleado) => {
      const persona =
        typeof empleado.personaId === "number"
          ? personaMap.get(empleado.personaId) ?? null
          : null;

      const seccionesIds = Array.from(
        seccionesPorEmpleado.get(empleado.id ?? 0) ?? [],
      );
      const seccionesInfo = seccionesIds
        .map((id) => seccionMap.get(id))
        .filter((s): s is SeccionDTO => Boolean(s))
        .map((s) => ({
          id: s.id!,
          label: formatSeccionLabel(s),
          nivel: s.nivel ?? null,
        }));

      const materiasIds = Array.from(
        materiasPorEmpleado.get(empleado.id ?? 0) ?? [],
      );
      const materiasInfo = materiasIds
        .map((id) => materiaMap.get(id))
        .filter((m): m is MateriaDTO => Boolean(m))
        .map((m) => ({ id: m.id!, nombre: m.nombre ?? `Materia #${m.id}` }));

      const formacionInfo = formacionesPorEmpleado.get(empleado.id ?? 0) ?? [];
      const licenciasInfo = licenciasPorEmpleado.get(empleado.id ?? 0) ?? [];

      return {
        empleado,
        persona,
        secciones: seccionesInfo,
        materias: materiasInfo,
        formaciones: formacionInfo,
        licencias: licenciasInfo,
      };
    });

    const licenciasOrdenadas = [...licencias].sort((a, b) =>
      getLicenseStart(b).localeCompare(getLicenseStart(a)),
    );

    return { personalData, licenciasOrdenadas };
  }, []);
  const refreshData = useCallback(async () => {
    setDataLoading(true);
    setLoadError(null);
    try {
      const { personalData, licenciasOrdenadas } = await fetchData();
      if (!mountedRef.current) return;
      setPersonal(personalData);
      setAllLicencias(licenciasOrdenadas);
    } catch (error) {
      console.error("Error cargando personal", error);
      if (!mountedRef.current) return;
      setLoadError("No se pudo obtener la información del personal.");
      setPersonal([]);
      setAllLicencias([]);
    } finally {
      if (mountedRef.current) {
        setDataLoading(false);
      }
    }
  }, [fetchData]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const personalById = useMemo(() => {
    const map = new Map<number, EmpleadoView>();
    personal.forEach((item) => {
      const id = item.empleado.id;
      if (typeof id === "number") {
        map.set(id, item);
      }
    });
    return map;
  }, [personal]);

  const empleadoNameMap = useMemo(() => {
    const map = new Map<number, { name: string; cargo?: string | null }>();
    personalById.forEach((item, id) => {
      const name = buildFullName(item.persona) || `Empleado #${id}`;
      map.set(id, { name, cargo: item.empleado.cargo ?? null });
    });
    return map;
  }, [personalById]);

  const nivelOptions = useMemo(() => {
    const set = new Set<string>();
    personal.forEach((p) => {
      p.secciones.forEach((s) => {
        if (s.nivel) set.add(String(s.nivel));
      });
    });
    return Array.from(set.values()).sort((a, b) =>
      formatNivel(a).localeCompare(formatNivel(b), "es", { sensitivity: "base" }),
    );
  }, [personal]);

  const seccionOptions = useMemo(() => {
    const map = new Map<string, string>();
    personal.forEach((p) => {
      p.secciones.forEach((s) => {
        map.set(String(s.id), s.label);
      });
    });
    return Array.from(map.entries()).sort((a, b) =>
      a[1].localeCompare(b[1], "es", { sensitivity: "base" }),
    );
  }, [personal]);

  const materiaOptions = useMemo(() => {
    const map = new Map<string, string>();
    personal.forEach((p) => {
      p.materias.forEach((m) => {
        map.set(String(m.id), m.nombre);
      });
    });
    return Array.from(map.entries()).sort((a, b) =>
      a[1].localeCompare(b[1], "es", { sensitivity: "base" }),
    );
  }, [personal]);

  const cargoOptions = useMemo(() => {
    const set = new Set<string>();
    personal.forEach((p) => {
      if (p.empleado.cargo) {
        set.add(p.empleado.cargo);
      }
    });
    return Array.from(set.values()).sort((a, b) => a.localeCompare(b));
  }, [personal]);

  const situacionOptions = useMemo(() => {
    const set = new Set<string>();
    personal.forEach((p) => {
      if (p.empleado.situacionActual) {
        set.add(p.empleado.situacionActual);
      }
    });
    return Array.from(set.values()).sort((a, b) => a.localeCompare(b));
  }, [personal]);

  const filteredPersonal = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const normalizedNivel = nivelFilter === "all" ? null : nivelFilter;
    const normalizedSeccion = seccionFilter === "all" ? null : seccionFilter;
    const normalizedMateria = materiaFilter === "all" ? null : materiaFilter;
    const normalizedCargo =
      cargoFilter === "all" ? null : cargoFilter.toLowerCase();
    const normalizedSituacion =
      situacionFilter === "all" ? null : situacionFilter.toLowerCase();

    return personal
      .filter((item) => {
        const haystack = [
          buildFullName(item.persona),
          item.persona?.dni ?? "",
          item.persona?.cuil ?? "",
          item.persona?.email ?? "",
          item.persona?.telefono ?? "",
          item.persona?.celular ?? "",
          item.persona?.domicilio ?? "",
          item.empleado.cuil ?? "",
          item.empleado.cargo ?? "",
          item.empleado.condicionLaboral ?? "",
          item.empleado.situacionActual ?? "",
          item.empleado.rolEmpleado ?? "",
          ...item.secciones.map((s) => s.label ?? ""),
          ...item.secciones.map((s) => String(s.nivel ?? "")),
          ...item.materias.map((m) => m.nombre ?? ""),
          ...item.formaciones.map((f) => f.tituloObtenido ?? ""),
          ...item.formaciones.map((f) => f.institucion ?? ""),
          item.empleado.antecedentesLaborales ?? "",
          item.empleado.observacionesGenerales ?? "",
        ];

        const matchesSearch =
          !term ||
          haystack.some(
            (value) =>
              value && value.toString().toLowerCase().includes(term),
          );
        if (!matchesSearch) return false;

        if (
          normalizedNivel &&
          !item.secciones.some(
            (s) =>
              String(s.nivel ?? "").toLowerCase() === normalizedNivel,
          )
        ) {
          return false;
        }

        if (
          normalizedSeccion &&
          !item.secciones.some((s) => String(s.id) === normalizedSeccion)
        ) {
          return false;
        }

        if (
          normalizedMateria &&
          !item.materias.some((m) => String(m.id) === normalizedMateria)
        ) {
          return false;
        }

        if (
          normalizedCargo &&
          (item.empleado.cargo ?? "").toLowerCase() !== normalizedCargo
        ) {
          return false;
        }

        if (
          normalizedSituacion &&
          (item.empleado.situacionActual ?? "").toLowerCase() !==
            normalizedSituacion
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const nameA = buildFullName(a.persona);
        const nameB = buildFullName(b.persona);
        return nameA.localeCompare(nameB, "es", { sensitivity: "base" });
      });
  }, [
    personal,
    searchTerm,
    nivelFilter,
    seccionFilter,
    materiaFilter,
    cargoFilter,
    situacionFilter,
  ]);

  const licenciasConNombre = useMemo(() => {
    return allLicencias.map((licencia) => {
      const empleadoId = licencia.empleadoId ?? 0;
      const info = empleadoNameMap.get(empleadoId);
      const personalInfo = personalById.get(empleadoId) ?? null;
      return {
        licencia,
        empleadoId,
        empleadoNombre:
          info?.name ||
          buildFullName(personalInfo?.persona) ||
          `Empleado #${empleadoId}`,
        empleadoCargo: info?.cargo ?? personalInfo?.empleado.cargo ?? null,
        empleadoSituacion: personalInfo?.empleado.situacionActual ?? null,
        secciones: personalInfo?.secciones ?? [],
        materias: personalInfo?.materias ?? [],
      };
    });
  }, [allLicencias, empleadoNameMap, personalById]);

  const filteredLicencias = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const normalizedNivel = nivelFilter === "all" ? null : nivelFilter;
    const normalizedSeccion = seccionFilter === "all" ? null : seccionFilter;
    const normalizedMateria = materiaFilter === "all" ? null : materiaFilter;
    const normalizedCargo =
      cargoFilter === "all" ? null : cargoFilter.toLowerCase();
    const normalizedSituacion =
      situacionFilter === "all" ? null : situacionFilter.toLowerCase();

    return licenciasConNombre.filter(
      ({
        licencia,
        empleadoNombre,
        empleadoCargo,
        empleadoSituacion,
        secciones,
        materias,
      }) => {
        const matchesSearch =
          !term ||
          empleadoNombre.toLowerCase().includes(term) ||
          (empleadoCargo ?? "").toLowerCase().includes(term) ||
          (licencia.tipoLicencia ?? "").toLowerCase().includes(term) ||
          (licencia.motivo ?? "").toLowerCase().includes(term) ||
          (licencia.observaciones ?? "").toLowerCase().includes(term);

        if (!matchesSearch) return false;

        if (
          normalizedNivel &&
          !secciones.some(
            (s) =>
              String(s.nivel ?? "").toLowerCase() === normalizedNivel,
          )
        ) {
          return false;
        }

        if (
          normalizedSeccion &&
          !secciones.some((s) => String(s.id) === normalizedSeccion)
        ) {
          return false;
        }

        if (
          normalizedMateria &&
          !materias.some((m) => String(m.id) === normalizedMateria)
        ) {
          return false;
        }

        if (
          normalizedCargo &&
          (empleadoCargo ?? "").toLowerCase() !== normalizedCargo
        ) {
          return false;
        }

        if (
          normalizedSituacion &&
          (empleadoSituacion ?? "").toLowerCase() !== normalizedSituacion
        ) {
          return false;
        }

        return true;
      },
    );
  }, [
    licenciasConNombre,
    searchTerm,
    nivelFilter,
    seccionFilter,
    materiaFilter,
    cargoFilter,
    situacionFilter,
  ]);

  const empleadoOptions = useMemo(() => {
    return Array.from(empleadoNameMap.entries())
      .map(([id, info]) => ({
        id,
        name: info.name,
        cargo: info.cargo ?? null,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));
  }, [empleadoNameMap]);

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        searchTerm.trim().length > 0 ||
          nivelFilter !== "all" ||
          seccionFilter !== "all" ||
          materiaFilter !== "all" ||
          cargoFilter !== "all" ||
          situacionFilter !== "all",
      ),
    [
      searchTerm,
      nivelFilter,
      seccionFilter,
      materiaFilter,
      cargoFilter,
      situacionFilter,
    ],
  );

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setNivelFilter("all");
    setSeccionFilter("all");
    setMateriaFilter("all");
    setCargoFilter("all");
    setSituacionFilter("all");
  }, [
    setSearchTerm,
    setNivelFilter,
    setSeccionFilter,
    setMateriaFilter,
    setCargoFilter,
    setSituacionFilter,
  ]);

  const resumenPersonal = useMemo(() => {
    let activos = 0;
    let enLicencia = 0;
    personal.forEach((item) => {
      const situacion = (item.empleado.situacionActual ?? "").toLowerCase();
      if (situacion.includes("licencia")) {
        enLicencia += 1;
      } else if (situacion.includes("activo")) {
        activos += 1;
      }
    });
    return {
      total: personal.length,
      activos,
      enLicencia,
    };
  }, [personal]);
  const handleCreatePersonal = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!newPersona.nombre || !newPersona.apellido || !newPersona.dni) {
        toast.error("Datos incompletos", {
          description: "Nombre, apellido y DNI son obligatorios.",
        });
        return;
      }
      const dniValue = formatDni(newPersona.dni);
      if (!dniValue || dniValue.length < 7 || dniValue.length > 10) {
        toast.error("DNI inválido", {
          description: "El DNI debe tener entre 7 y 10 dígitos numéricos.",
        });
        return;
      }
      if (!newEmpleado.rolEmpleado) {
        toast.error("Rol requerido", {
          description: "Seleccione el rol institucional del personal.",
        });
        return;
      }
      if (!newEmpleado.cargo) {
        toast.error("Cargo requerido", {
          description: "Ingrese el cargo actual del personal.",
        });
        return;
      }
      if (
        newPersona.fechaNacimiento &&
        !isBirthDateValid(newPersona.fechaNacimiento)
      ) {
        toast.error("Fecha de nacimiento inválida", {
          description:
            "La fecha de nacimiento debe ser al menos dos años anterior a hoy.",
        });
        return;
      }

      const fechaInicioFormacion = newFormacion.fechaInicio.trim();
      const fechaFinFormacion = newFormacion.fechaFin.trim();
      if (
        fechaInicioFormacion &&
        fechaFinFormacion &&
        fechaFinFormacion < fechaInicioFormacion
      ) {
        toast.error("Fechas de formación inválidas", {
          description:
            "La fecha de finalización no puede ser anterior a la de inicio.",
        });
        return;
      }
      setCreatingPersonal(true);
      try {
        const personaPayload = {
          nombre: newPersona.nombre,
          apellido: newPersona.apellido,
          dni: dniValue,
          fechaNacimiento: newPersona.fechaNacimiento || undefined,
          genero: newPersona.genero || undefined,
          estadoCivil: newPersona.estadoCivil || undefined,
          nacionalidad: newPersona.nacionalidad || undefined,
          domicilio: newPersona.domicilio || undefined,
          telefono: newPersona.telefono || undefined,
          celular: newPersona.celular || undefined,
          email: newPersona.email || undefined,
        };

        const personaRes = await api.personasCore.create(personaPayload);
        const personaId = personaRes.data;
        if (!personaId) {
          throw new Error("El backend no devolvió el ID de la persona");
        }

        const extraNotas: string[] = [];
        if (formacionNotas.otrosTitulos.trim().length > 0) {
          extraNotas.push(`Otros títulos: ${formacionNotas.otrosTitulos.trim()}`);
        }
        if (formacionNotas.especializaciones.trim().length > 0) {
          extraNotas.push(
            `Especializaciones: ${formacionNotas.especializaciones.trim()}`,
          );
        }
        if (formacionNotas.cursos.trim().length > 0) {
          extraNotas.push(`Cursos: ${formacionNotas.cursos.trim()}`);
        }

        const observacionesGenerales = [
          newEmpleado.observacionesGenerales?.trim() ?? "",
          ...extraNotas,
        ]
          .filter(Boolean)
          .join("\n");

        const empleadoPayload = {
          personaId,
          rolEmpleado: newEmpleado.rolEmpleado,
          cuil: newEmpleado.cuil || undefined,
          condicionLaboral: newEmpleado.condicionLaboral || undefined,
          cargo: newEmpleado.cargo || undefined,
          situacionActual: newEmpleado.situacionActual || undefined,
          fechaIngreso: newEmpleado.fechaIngreso || undefined,
          antecedentesLaborales:
            newEmpleado.antecedentesLaborales || undefined,
          observacionesGenerales: observacionesGenerales || undefined,
        };

        const empleadoRes = await api.empleados.create(empleadoPayload);
        const empleadoId = empleadoRes.data?.id;

        if (
          empleadoId &&
          newFormacion.tituloObtenido.trim() &&
          newFormacion.institucion.trim() &&
          newFormacion.nivel.trim() &&
          newFormacion.fechaInicio.trim()
        ) {
          await api.formaciones.create({
            empleadoId,
            tituloObtenido: newFormacion.tituloObtenido.trim(),
            institucion: newFormacion.institucion.trim(),
            nivel: newFormacion.nivel.trim(),
            fechaInicio: newFormacion.fechaInicio.trim(),
            fechaFin: newFormacion.fechaFin.trim() || undefined,
          });
        }

        toast.success("Personal registrado", {
          description: "El nuevo miembro del personal fue creado correctamente.",
        });
        setCreateDialogOpen(false);
        await refreshData();
      } catch (error: any) {
        console.error("Error al crear personal", error);
        const description =
          error?.response?.data?.message ??
          error?.message ??
          "No se pudo registrar al personal.";
        toast.error("Error al crear personal", { description });
      } finally {
        setCreatingPersonal(false);
      }
    },
    [formacionNotas, newEmpleado, newFormacion, newPersona, refreshData],
  );

  const handleCreateLicense = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!newLicense.empleadoId) {
        toast.error("Seleccione personal", {
          description: "Debe elegir a quién corresponde la licencia.",
        });
        return;
      }
      if (!newLicense.tipoLicencia) {
        toast.error("Tipo requerido", {
          description: "Seleccione el tipo de licencia.",
        });
        return;
      }
      if (!newLicense.fechaInicio) {
        toast.error("Fecha requerida", {
          description: "Ingrese la fecha de inicio de la licencia.",
        });
        return;
      }
      if (!newLicense.motivo.trim()) {
        toast.error("Motivo requerido", {
          description: "Detalle el motivo de la licencia.",
        });
        return;
      }

      if (
        newLicense.fechaFin &&
        newLicense.fechaInicio &&
        newLicense.fechaFin < newLicense.fechaInicio
      ) {
        toast.error("Fechas de licencia inválidas", {
          description: "La fecha de fin no puede ser anterior a la de inicio.",
        });
        return;
      }

      setCreatingLicense(true);
      try {
        const payload = {
          empleadoId: Number(newLicense.empleadoId),
          tipoLicencia: newLicense.tipoLicencia,
          fechaInicio: newLicense.fechaInicio,
          fechaFin: newLicense.fechaFin || undefined,
          motivo: newLicense.motivo.trim(),
          justificada: newLicense.justificada === "si",
          horasAusencia: newLicense.horasAusencia
            ? Number(newLicense.horasAusencia)
            : undefined,
          observaciones: newLicense.observaciones.trim() || undefined,
        };
        await api.licencias.create(payload);
        toast.success("Licencia registrada", {
          description: "La licencia se registró correctamente.",
        });
        setLicenseDialogOpen(false);
        await refreshData();
      } catch (error: any) {
        console.error("Error al registrar licencia", error);
        const description =
          error?.response?.data?.message ??
          error?.message ??
          "No se pudo registrar la licencia.";
        toast.error("Error al registrar licencia", { description });
      } finally {
        setCreatingLicense(false);
      }
    },
    [newLicense, refreshData],
  );

  const handleOpenLicenseDialog = useCallback(
    (empleadoId?: number) => {
      setNewLicense({
        ...initialLicenseForm,
        empleadoId: empleadoId ? String(empleadoId) : "",
      });
      setLicenseDialogOpen(true);
    },
    [setLicenseDialogOpen, setNewLicense],
  );

  const renderLoadingState = () => <LoadingState label="Cargando información…" />;

  const renderErrorState = () => (
    <Alert variant="destructive">
      <AlertTitle>Error al cargar la información</AlertTitle>
      <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {loadError ?? "No se pudo obtener la información del personal."}
        <Button type="button" variant="outline" size="sm" onClick={refreshData}>
          Reintentar
        </Button>
      </AlertDescription>
    </Alert>
  );

  const renderFilters = (context: "personal" | "licencias") => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          {context === "personal" ? "Filtros del personal" : "Filtros de licencias"}
        </CardTitle>
        <CardDescription>
          {context === "personal"
            ? "Combina búsqueda y filtros para ubicar rápidamente al plantel docente y no docente."
            : "Refina la consulta de licencias por docente, nivel, cargo o tipo de licencia."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={
                context === "personal"
                  ? "Buscar por nombre, DNI, cargo o asignatura…"
                  : "Buscar por docente, tipo o motivo de licencia…"
              }
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
            >
              Limpiar filtros
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={refreshData}
              disabled={dataLoading}
            >
              Actualizar datos
            </Button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">
              Nivel
            </Label>
            <Select value={nivelFilter} onValueChange={setNivelFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos los niveles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los niveles</SelectItem>
                {nivelOptions
                  .filter((nivel) => nivel)
                  .map((nivel) => {
                    const value = String(nivel).toLowerCase();
                    return (
                      <SelectItem key={value} value={value}>
                        {formatNivel(nivel)}
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">
              Sección
            </Label>
            <Select value={seccionFilter} onValueChange={setSeccionFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas las secciones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las secciones</SelectItem>
                {seccionOptions.map(([id, label]) => (
                  <SelectItem key={id} value={id}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">
              Asignatura
            </Label>
            <Select value={materiaFilter} onValueChange={setMateriaFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas las asignaturas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las asignaturas</SelectItem>
                {materiaOptions.map(([id, label]) => (
                  <SelectItem key={id} value={id}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">
              Cargo
            </Label>
            <Select value={cargoFilter} onValueChange={setCargoFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos los cargos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los cargos</SelectItem>
                {cargoOptions.map((cargo) => (
                  <SelectItem key={cargo} value={cargo}>
                    {cargo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">
              Situación
            </Label>
            <Select value={situacionFilter} onValueChange={setSituacionFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas las situaciones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las situaciones</SelectItem>
                {situacionOptions.map((situacion) => (
                  <SelectItem key={situacion} value={situacion}>
                    {situacion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading || !user) {
    return (
      <DashboardLayout>
        <div className="flex-1 p-4 pt-6 md:p-8">{renderLoadingState()}</div>
      </DashboardLayout>
    );
  }

  const canCreatePersonal =
    hasRole(UserRole.DIRECTOR) || hasRole(UserRole.ADMIN);
  const canRegisterLicenses =
    hasRole(UserRole.DIRECTOR) ||
    hasRole(UserRole.ADMIN) ||
    hasRole(UserRole.SECRETARY);

  const { total, activos, enLicencia } = resumenPersonal;
  const totalLicenciasRegistradas = allLicencias.length;

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Gestión de personal</h1>
          <p className="text-muted-foreground">
            Administra la información del personal docente y no docente, registra nuevas altas y
            realiza el seguimiento de licencias.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Personal registrado</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total}</div>
              <p className="text-xs text-muted-foreground">
                Total de docentes y personal administrativo registrados.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <CheckCircle className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activos}</div>
              <p className="text-xs text-muted-foreground">
                Personal que actualmente se encuentra prestando servicio.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En licencia</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{enLicencia}</div>
              <p className="text-xs text-muted-foreground">
                Integrantes con licencias activas o próximas a vencer.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Licencias registradas</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLicenciasRegistradas}</div>
              <p className="text-xs text-muted-foreground">
                Historial de licencias cargadas en el sistema.
              </p>
            </CardContent>
          </Card>
        </div>

        {loadError ? renderErrorState() : null}

        <Tabs
          value={selectedTab}
          onValueChange={(value) => setSelectedTab(value)}
          className="space-y-4"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <TabsList className="w-full lg:w-auto">
              <TabsTrigger value="listado">Personal</TabsTrigger>
              <TabsTrigger value="licencias">Licencias</TabsTrigger>
            </TabsList>
            <div className="flex flex-wrap gap-2">
              {selectedTab === "licencias" && canRegisterLicenses ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenLicenseDialog()}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Nueva licencia
                </Button>
              ) : null}
              {selectedTab === "listado" && canCreatePersonal ? (
                <Button type="button" onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Registrar personal
                </Button>
              ) : null}
            </div>
          </div>
          <TabsContent value="listado" className="space-y-4">
            {renderFilters("personal")}
            {dataLoading && personal.length === 0 ? (
              renderLoadingState()
            ) : filteredPersonal.length > 0 ? (
              <div className="space-y-4">
                {filteredPersonal.map((item, index) => {
                  const empleadoId = item.empleado.id ?? index;
                  const persona = item.persona;
                  const fullName =
                    buildFullName(persona) || `Empleado #${item.empleado.id ?? empleadoId}`;
                  const initials = `${(persona?.nombre?.[0] ?? "").toUpperCase()}${(
                    persona?.apellido?.[0] ?? ""
                  ).toUpperCase()}`.trim();
                  const licenciasOrdenadas = [...item.licencias].sort((a, b) =>
                    getLicenseStart(b).localeCompare(getLicenseStart(a)),
                  );
                  const ultimaLicencia = licenciasOrdenadas[0];
                  const fechaIngreso = formatDate(item.empleado.fechaIngreso);
                  const condicion = item.empleado.condicionLaboral ?? "No especificada";
                  const situacion = item.empleado.situacionActual ?? "Sin estado";
                  const dni = persona?.dni ?? "Sin registrar";
                  const cuil = item.empleado.cuil ?? persona?.cuil ?? "Sin registrar";
                  const fechaNacimiento = formatDate(persona?.fechaNacimiento);
                  const nacionalidad = persona?.nacionalidad ?? "No informada";
                  const estadoCivil = persona?.estadoCivil ?? "No informado";
                  const genero = persona?.genero ?? "No informado";
                  const email = persona?.email ?? "Sin correo registrado";
                  const telefono = persona?.telefono ?? "Sin teléfono";
                  const celular = persona?.celular ?? "Sin celular";
                  const domicilio = persona?.domicilio ?? "Sin domicilio registrado";
                  return (
                    <Card key={`personal-${empleadoId}`}>
                      <CardHeader className="space-y-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>
                                {initials.length ? initials : <User className="h-5 w-5" />}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-semibold leading-none">{fullName}</h3>
                                {item.empleado.cargo ? (
                                  <Badge variant="outline">{item.empleado.cargo}</Badge>
                                ) : null}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {formatRol(item.empleado.rolEmpleado)}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {getSituacionBadge(item.empleado.situacionActual)}
                            {canRegisterLicenses && typeof item.empleado.id === "number" ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenLicenseDialog(item.empleado.id)}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Registrar licencia
                              </Button>
                            ) : null}
                          </div>
                        </div>
                        {(item.secciones.length > 0 || item.materias.length > 0) && (
                          <div className="flex flex-wrap gap-2">
                            {item.secciones.map((seccion) => (
                              <Badge
                                key={`seccion-${empleadoId}-${seccion.id}`}
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                <Users className="h-3 w-3" />
                                <span>{formatNivel(seccion.nivel)} • {seccion.label}</span>
                              </Badge>
                            ))}
                            {item.materias.map((materia) => (
                              <Badge
                                key={`materia-${empleadoId}-${materia.id}`}
                                variant="outline"
                                className="flex items-center gap-1"
                              >
                                <GraduationCap className="h-3 w-3" />
                                <span>{materia.nombre}</span>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          <div className="rounded-lg border bg-muted/40 p-4">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                              <Briefcase className="h-4 w-4 text-muted-foreground" />
                              Información laboral
                            </div>
                            <div className="mt-3 space-y-2 text-muted-foreground">
                              <div>
                                <span className="font-medium text-foreground">Condición:</span> {condicion}
                              </div>
                              <div>
                                <span className="font-medium text-foreground">Situación:</span> {situacion}
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  Ingreso: {fechaIngreso || "Sin registrar"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="rounded-lg border bg-muted/40 p-4">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                              <User className="h-4 w-4 text-muted-foreground" />
                              Datos personales
                            </div>
                            <div className="mt-3 space-y-2 text-muted-foreground">
                              <div>
                                <span className="font-medium text-foreground">DNI:</span> {dni}
                              </div>
                              <div>
                                <span className="font-medium text-foreground">CUIL:</span> {cuil}
                              </div>
                              <div>
                                <span className="font-medium text-foreground">Nacimiento:</span> {fechaNacimiento || "Sin registrar"}
                              </div>
                              <div>
                                <span className="font-medium text-foreground">Nacionalidad:</span> {nacionalidad}
                              </div>
                              <div>
                                <span className="font-medium text-foreground">Estado civil:</span> {estadoCivil}
                              </div>
                              <div>
                                <span className="font-medium text-foreground">Género:</span> {genero}
                              </div>
                            </div>
                          </div>
                          <div className="rounded-lg border bg-muted/40 p-4">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              Información de contacto
                            </div>
                            <div className="mt-3 space-y-2 text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>Tel.: {telefono}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>Cel.: {celular}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                <span>{domicilio}</span>
                              </div>
                            </div>
                          </div>
                          <div className="rounded-lg border bg-muted/40 p-4">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              Licencias registradas
                            </div>
                            <div className="mt-3 space-y-2 text-muted-foreground">
                              <div>
                                <span className="font-medium text-foreground">Total:</span> {item.licencias.length}
                              </div>
                              {ultimaLicencia ? (
                                <div>
                                  <span className="font-medium text-foreground">Última:</span> {formatTipoLicencia(ultimaLicencia.tipoLicencia)}
                                  {" "}• {formatDate(ultimaLicencia.fechaInicio) || "Sin inicio"}
                                  {ultimaLicencia.fechaFin ? ` al ${formatDate(ultimaLicencia.fechaFin)}` : ""}
                                </div>
                              ) : (
                                <div>No hay licencias cargadas.</div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-lg border bg-muted/40 p-4">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                              <GraduationCap className="h-4 w-4 text-muted-foreground" />
                              Formación académica
                            </div>
                            <div className="mt-3 space-y-2 text-muted-foreground">
                              {item.formaciones.length > 0 ? (
                                item.formaciones.map((formacion) => (
                                  <div key={`formacion-${empleadoId}-${formacion.id}`}>
                                    <div className="font-medium text-foreground">
                                      {formacion.tituloObtenido ?? "Título sin nombre"}
                                    </div>
                                    <div>
                                      {formacion.institucion ?? "Institución no informada"}
                                      {formacion.nivel ? ` • ${formacion.nivel}` : ""}
                                    </div>
                                    <div className="text-xs">
                                      {formacion.fechaInicio
                                        ? `Desde ${formatDate(formacion.fechaInicio)}`
                                        : "Fecha de inicio no registrada"}
                                      {formacion.fechaFin
                                        ? ` hasta ${formatDate(formacion.fechaFin)}`
                                        : ""}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div>No se registraron títulos o cursos.</div>
                              )}
                            </div>
                          </div>
                          {(item.empleado.antecedentesLaborales || item.empleado.observacionesGenerales) && (
                            <div className="rounded-lg border bg-muted/40 p-4">
                              <div className="flex items-center gap-2 text-sm font-semibold">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                Notas y antecedentes
                              </div>
                              <div className="mt-3 space-y-3 text-muted-foreground">
                                {item.empleado.antecedentesLaborales ? (
                                  <div>
                                    <div className="font-medium text-foreground">Antecedentes laborales</div>
                                    <div className="whitespace-pre-wrap">
                                      {item.empleado.antecedentesLaborales}
                                    </div>
                                  </div>
                                ) : null}
                                {item.empleado.observacionesGenerales ? (
                                  <div>
                                    <div className="font-medium text-foreground">Observaciones</div>
                                    <div className="whitespace-pre-wrap">
                                      {item.empleado.observacionesGenerales}
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  {hasActiveFilters
                    ? "No se encontraron integrantes que coincidan con los filtros seleccionados."
                    : "Aún no se registró personal en el sistema."}
                </CardContent>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="licencias" className="space-y-4">
            {renderFilters("licencias")}
            {dataLoading && allLicencias.length === 0 ? (
              renderLoadingState()
            ) : filteredLicencias.length > 0 ? (
              <div className="space-y-4">
                {filteredLicencias.map(
                  (
                    {
                      licencia,
                      empleadoNombre,
                      empleadoCargo,
                      empleadoSituacion,
                      secciones,
                      materias,
                      empleadoId,
                    },
                    index,
                  ) => {
                    const licenseKey = licencia.id ?? `${empleadoId}-${index}`;
                    const fechaInicio = formatDate(licencia.fechaInicio) || "Sin inicio";
                    const fechaFin = licencia.fechaFin ? formatDate(licencia.fechaFin) : "";
                    return (
                      <Card key={`licencia-${licenseKey}`}>
                        <CardHeader className="space-y-2">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-semibold leading-none">
                                  {empleadoNombre}
                                </h3>
                                <Badge variant="outline">
                                  {formatTipoLicencia(licencia.tipoLicencia)}
                                </Badge>
                                <Badge variant={licencia.justificada ? "secondary" : "destructive"}>
                                  {licencia.justificada ? "Justificada" : "Sin justificar"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {empleadoCargo ?? "Sin cargo asignado"}
                              </p>
                            </div>
                            <div className="flex flex-col items-start gap-1 text-sm text-muted-foreground sm:items-end">
                              <div className="flex flex-wrap items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {fechaFin
                                    ? `${fechaInicio} al ${fechaFin}`
                                    : fechaInicio}
                                </span>
                              </div>
                              {typeof licencia.horasAusencia === "number" ? (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{licencia.horasAusencia} hs de ausencia</span>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                          <div className="flex items-start gap-2 text-foreground">
                            <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                            <span>
                              <span className="font-semibold">Motivo:</span> {licencia.motivo || "Sin detallar"}
                            </span>
                          </div>
                          {licencia.observaciones ? (
                            <div className="whitespace-pre-wrap">
                              <span className="font-semibold text-foreground">Observaciones:</span>{" "}
                              {licencia.observaciones}
                            </div>
                          ) : null}
                          {secciones.length ? (
                            <div className="flex flex-wrap gap-2">
                              {secciones.map((seccion) => (
                                <Badge
                                  key={`licencia-${licenseKey}-seccion-${seccion.id}`}
                                  variant="secondary"
                                  className="flex items-center gap-1"
                                >
                                  <Users className="h-3 w-3" />
                                  <span>{formatNivel(seccion.nivel)} • {seccion.label}</span>
                                </Badge>
                              ))}
                            </div>
                          ) : null}
                          {materias.length ? (
                            <div className="flex flex-wrap gap-2">
                              {materias.map((materia) => (
                                <Badge
                                  key={`licencia-${licenseKey}-materia-${materia.id}`}
                                  variant="outline"
                                  className="flex items-center gap-1"
                                >
                                  <GraduationCap className="h-3 w-3" />
                                  <span>{materia.nombre}</span>
                                </Badge>
                              ))}
                            </div>
                          ) : null}
                          {empleadoSituacion ? (
                            <div>
                              <span className="font-semibold text-foreground">Situación actual:</span>{" "}
                              {empleadoSituacion}
                            </div>
                          ) : null}
                        </CardContent>
                      </Card>
                    );
                  },
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  {hasActiveFilters
                    ? "No se encontraron licencias con los criterios seleccionados."
                    : "Aún no se registraron licencias."}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <form onSubmit={handleCreatePersonal} className="space-y-6">
            <DialogHeader>
              <DialogTitle>Alta de nuevo personal</DialogTitle>
              <DialogDescription>
                Completa la ficha para incorporar un nuevo integrante. Los campos marcados como
                obligatorios permiten garantizar la trazabilidad del legajo.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Datos personales</h3>
                  <p className="text-sm text-muted-foreground">
                    Información básica de identificación del docente o integrante.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-nombre">Nombres</Label>
                    <Input
                      id="nuevo-nombre"
                      value={newPersona.nombre}
                      onChange={(event) =>
                        setNewPersona((prev) => ({ ...prev, nombre: event.target.value }))
                      }
                      placeholder="Nombre completo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-apellido">Apellidos</Label>
                    <Input
                      id="nuevo-apellido"
                      value={newPersona.apellido}
                      onChange={(event) =>
                        setNewPersona((prev) => ({ ...prev, apellido: event.target.value }))
                      }
                      placeholder="Apellido"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-dni">DNI</Label>
                    <Input
                      id="nuevo-dni"
                      value={newPersona.dni}
                      onChange={(event) =>
                        setNewPersona((prev) => ({
                          ...prev,
                          dni: formatDni(event.target.value),
                        }))
                      }
                      placeholder="Documento"
                      inputMode="numeric"
                      pattern="\d*"
                      minLength={7}
                      maxLength={10}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-fecha-nac">Fecha de nacimiento</Label>
                    <Input
                      id="nuevo-fecha-nac"
                      type="date"
                      max={maxBirthDate}
                      value={newPersona.fechaNacimiento}
                      onChange={(event) =>
                        setNewPersona((prev) => ({ ...prev, fechaNacimiento: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-genero">Género</Label>
                    <Input
                      id="nuevo-genero"
                      value={newPersona.genero}
                      onChange={(event) =>
                        setNewPersona((prev) => ({ ...prev, genero: event.target.value }))
                      }
                      placeholder="Femenino, Masculino, Otro…"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-estado-civil">Estado civil</Label>
                    <Input
                      id="nuevo-estado-civil"
                      value={newPersona.estadoCivil}
                      onChange={(event) =>
                        setNewPersona((prev) => ({ ...prev, estadoCivil: event.target.value }))
                      }
                      placeholder="Soltero/a, Casado/a…"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-nacionalidad">Nacionalidad</Label>
                    <Input
                      id="nuevo-nacionalidad"
                      value={newPersona.nacionalidad}
                      onChange={(event) =>
                        setNewPersona((prev) => ({ ...prev, nacionalidad: event.target.value }))
                      }
                      placeholder="Argentina, Uruguaya…"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-cuil">CUIL</Label>
                    <Input
                      id="nuevo-cuil"
                      value={newEmpleado.cuil}
                      onChange={(event) =>
                        setNewEmpleado((prev) => ({ ...prev, cuil: event.target.value }))
                      }
                      placeholder="Ej. 20-12345678-3"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Información de contacto</h3>
                  <p className="text-sm text-muted-foreground">
                    Datos para comunicación institucional y notificaciones.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="nuevo-domicilio">Domicilio</Label>
                    <Input
                      id="nuevo-domicilio"
                      value={newPersona.domicilio}
                      onChange={(event) =>
                        setNewPersona((prev) => ({ ...prev, domicilio: event.target.value }))
                      }
                      placeholder="Calle, número, localidad"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-telefono">Teléfono</Label>
                    <Input
                      id="nuevo-telefono"
                      value={newPersona.telefono}
                      onChange={(event) =>
                        setNewPersona((prev) => ({ ...prev, telefono: event.target.value }))
                      }
                      placeholder="Teléfono fijo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-celular">Celular</Label>
                    <Input
                      id="nuevo-celular"
                      value={newPersona.celular}
                      onChange={(event) =>
                        setNewPersona((prev) => ({ ...prev, celular: event.target.value }))
                      }
                      placeholder="Número de contacto"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="nuevo-email">Correo electrónico</Label>
                    <Input
                      id="nuevo-email"
                      type="email"
                      value={newPersona.email}
                      onChange={(event) =>
                        setNewPersona((prev) => ({ ...prev, email: event.target.value }))
                      }
                      placeholder="nombre@institucion.edu.ar"
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Datos laborales</h3>
                  <p className="text-sm text-muted-foreground">
                    Rol, cargo y situación dentro de la institución.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-rol">Rol institucional</Label>
                    <Select
                      value={newEmpleado.rolEmpleado}
                      onValueChange={(value) =>
                        setNewEmpleado((prev) => ({ ...prev, rolEmpleado: value as RolEmpleado }))
                      }
                    >
                      <SelectTrigger id="nuevo-rol">
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                      <SelectContent>
                        {rolOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-condicion">Condición laboral</Label>
                    <Input
                      id="nuevo-condicion"
                      value={newEmpleado.condicionLaboral}
                      onChange={(event) =>
                        setNewEmpleado((prev) => ({ ...prev, condicionLaboral: event.target.value }))
                      }
                      placeholder="Principal, suplente, interino…"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-cargo">Cargo actual</Label>
                    <Input
                      id="nuevo-cargo"
                      value={newEmpleado.cargo}
                      onChange={(event) =>
                        setNewEmpleado((prev) => ({ ...prev, cargo: event.target.value }))
                      }
                      placeholder="Maestro, Profesor, Preceptor…"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-situacion">Situación actual</Label>
                    <Input
                      id="nuevo-situacion"
                      value={newEmpleado.situacionActual}
                      onChange={(event) =>
                        setNewEmpleado((prev) => ({ ...prev, situacionActual: event.target.value }))
                      }
                      placeholder="Activo, En licencia, De baja…"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-fecha-ingreso">Fecha de ingreso</Label>
                    <Input
                      id="nuevo-fecha-ingreso"
                      type="date"
                      value={newEmpleado.fechaIngreso}
                      onChange={(event) =>
                        setNewEmpleado((prev) => ({ ...prev, fechaIngreso: event.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="nuevo-antecedentes">Antecedentes laborales</Label>
                    <Textarea
                      id="nuevo-antecedentes"
                      value={newEmpleado.antecedentesLaborales}
                      onChange={(event) =>
                        setNewEmpleado((prev) => ({ ...prev, antecedentesLaborales: event.target.value }))
                      }
                      placeholder="Experiencia previa, instituciones en las que trabajó…"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="nuevo-observaciones">Observaciones generales</Label>
                    <Textarea
                      id="nuevo-observaciones"
                      value={newEmpleado.observacionesGenerales}
                      onChange={(event) =>
                        setNewEmpleado((prev) => ({ ...prev, observacionesGenerales: event.target.value }))
                      }
                      placeholder="Notas internas, requerimientos o documentación adicional"
                      rows={3}
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Formación académica</h3>
                  <p className="text-sm text-muted-foreground">
                    Registra la titulación principal y otras certificaciones relevantes.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-nivel">Nivel</Label>
                    <Input
                      id="nuevo-nivel"
                      value={newFormacion.nivel}
                      onChange={(event) =>
                        setNewFormacion((prev) => ({ ...prev, nivel: event.target.value }))
                      }
                      placeholder="Terciario, Universitario, Posgrado…"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-titulo">Título principal</Label>
                    <Input
                      id="nuevo-titulo"
                      value={newFormacion.tituloObtenido}
                      onChange={(event) =>
                        setNewFormacion((prev) => ({ ...prev, tituloObtenido: event.target.value }))
                      }
                      placeholder="Profesor/a en…"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-institucion">Institución</Label>
                    <Input
                      id="nuevo-institucion"
                      value={newFormacion.institucion}
                      onChange={(event) =>
                        setNewFormacion((prev) => ({ ...prev, institucion: event.target.value }))
                      }
                      placeholder="Nombre de la institución"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-fecha-inicio-formacion">Fecha de inicio</Label>
                    <Input
                      id="nuevo-fecha-inicio-formacion"
                      type="date"
                      value={newFormacion.fechaInicio}
                      onChange={(event) => {
                        const value = event.target.value;
                        setNewFormacion((prev) => {
                          if (!value) {
                            return { ...prev, fechaInicio: value };
                          }
                          const next = { ...prev, fechaInicio: value };
                          if (prev.fechaFin && prev.fechaFin < value) {
                            next.fechaFin = value;
                          }
                          return next;
                        });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-fecha-fin-formacion">Fecha de finalización</Label>
                    <Input
                      id="nuevo-fecha-fin-formacion"
                      type="date"
                      value={newFormacion.fechaFin}
                      onChange={(event) => {
                        const value = event.target.value;
                        setNewFormacion((prev) => {
                          if (!value) {
                            return { ...prev, fechaFin: value };
                          }
                          if (prev.fechaInicio && value < prev.fechaInicio) {
                            return { ...prev, fechaFin: prev.fechaInicio };
                          }
                          return { ...prev, fechaFin: value };
                        });
                      }}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-otros-titulos">Otros títulos</Label>
                    <Textarea
                      id="nuevo-otros-titulos"
                      value={formacionNotas.otrosTitulos}
                      onChange={(event) =>
                        setFormacionNotas((prev) => ({ ...prev, otrosTitulos: event.target.value }))
                      }
                      placeholder="Especializaciones o formaciones complementarias"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-especializaciones">Especializaciones</Label>
                    <Textarea
                      id="nuevo-especializaciones"
                      value={formacionNotas.especializaciones}
                      onChange={(event) =>
                        setFormacionNotas((prev) => ({ ...prev, especializaciones: event.target.value }))
                      }
                      placeholder="Posgrados, diplomaturas…"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="nuevo-cursos">Cursos realizados</Label>
                    <Textarea
                      id="nuevo-cursos"
                      value={formacionNotas.cursos}
                      onChange={(event) =>
                        setFormacionNotas((prev) => ({ ...prev, cursos: event.target.value }))
                      }
                      placeholder="Cursos o capacitaciones recientes"
                      rows={3}
                    />
                  </div>
                </div>
              </section>
            </div>

            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={creatingPersonal}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={creatingPersonal}>
                {creatingPersonal ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando…
                  </>
                ) : (
                  "Registrar personal"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={licenseDialogOpen} onOpenChange={setLicenseDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <form onSubmit={handleCreateLicense} className="space-y-6">
            <DialogHeader>
              <DialogTitle>Nueva licencia</DialogTitle>
              <DialogDescription>
                Registra las fechas y el motivo de la licencia para mantener actualizado el legajo.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="licencia-personal">Personal</Label>
                <Select
                  value={newLicense.empleadoId}
                  onValueChange={(value) =>
                    setNewLicense((prev) => ({ ...prev, empleadoId: value }))
                  }
                >
                  <SelectTrigger id="licencia-personal">
                    <SelectValue placeholder="Selecciona el personal" />
                  </SelectTrigger>
                  <SelectContent>
                    {empleadoOptions.length === 0 ? (
                      <SelectItem value="" disabled>
                        No hay personal disponible
                      </SelectItem>
                    ) : (
                      empleadoOptions.map((option) => (
                        <SelectItem key={option.id} value={String(option.id)}>
                          {option.name}
                          {option.cargo ? ` • ${option.cargo}` : ""}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="licencia-tipo">Tipo de licencia</Label>
                <Select
                  value={newLicense.tipoLicencia}
                  onValueChange={(value) =>
                    setNewLicense((prev) => ({ ...prev, tipoLicencia: value }))
                  }
                >
                  <SelectTrigger id="licencia-tipo">
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tipoLicenciaOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="licencia-inicio">Fecha de inicio</Label>
                  <Input
                    id="licencia-inicio"
                    type="date"
                    value={newLicense.fechaInicio}
                    onChange={(event) => {
                      const value = event.target.value;
                      setNewLicense((prev) => {
                        if (!value) {
                          return { ...prev, fechaInicio: value };
                        }
                        const next = { ...prev, fechaInicio: value };
                        if (prev.fechaFin && prev.fechaFin < value) {
                          next.fechaFin = value;
                        }
                        return next;
                      });
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licencia-fin">Fecha de finalización</Label>
                  <Input
                    id="licencia-fin"
                    type="date"
                    value={newLicense.fechaFin}
                    onChange={(event) => {
                      const value = event.target.value;
                      setNewLicense((prev) => {
                        if (!value) {
                          return { ...prev, fechaFin: value };
                        }
                        if (prev.fechaInicio && value < prev.fechaInicio) {
                          return { ...prev, fechaFin: prev.fechaInicio };
                        }
                        return { ...prev, fechaFin: value };
                      });
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="licencia-justificada">¿La licencia está justificada?</Label>
                <Select
                  value={newLicense.justificada}
                  onValueChange={(value: "si" | "no") =>
                    setNewLicense((prev) => ({ ...prev, justificada: value }))
                  }
                >
                  <SelectTrigger id="licencia-justificada">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="si">Sí, justificada</SelectItem>
                    <SelectItem value="no">No justificada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="licencia-motivo">Motivo</Label>
                  <Textarea
                    id="licencia-motivo"
                    value={newLicense.motivo}
                    onChange={(event) =>
                      setNewLicense((prev) => ({ ...prev, motivo: event.target.value }))
                    }
                    placeholder="Describe el motivo de la licencia"
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licencia-horas">Horas de ausencia (opcional)</Label>
                  <Input
                    id="licencia-horas"
                    type="number"
                    min="0"
                    value={newLicense.horasAusencia}
                    onChange={(event) =>
                      setNewLicense((prev) => ({ ...prev, horasAusencia: event.target.value }))
                    }
                    placeholder="Cantidad de horas"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="licencia-observaciones">Observaciones</Label>
                <Textarea
                  id="licencia-observaciones"
                  value={newLicense.observaciones}
                  onChange={(event) =>
                    setNewLicense((prev) => ({ ...prev, observaciones: event.target.value }))
                  }
                  placeholder="Detalles adicionales o documentación presentada"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={creatingLicense}>
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={creatingLicense}>
                {creatingLicense ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando…
                  </>
                ) : (
                  "Registrar licencia"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
