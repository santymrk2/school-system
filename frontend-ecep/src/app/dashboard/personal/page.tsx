"use client";

import {
  ChangeEvent,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { formatDni } from "@/lib/form-utils";
import { gestionAcademica, identidad } from "@/services/api/modules";
import { isBirthDateValid, maxBirthDate } from "@/lib/form-utils";
import { displayRole, normalizeRoles } from "@/lib/auth-roles";
import {
  DEFAULT_GENERO_VALUE,
  GENERO_OPTIONS,
  normalizeGenero,
} from "@/lib/genero";
import {
  RolEmpleado,
  RolMateria,
  RolSeccion,
  UserRole,
  type AsignacionDocenteMateriaDTO,
  type AsignacionDocenteSeccionDTO,
  type EmpleadoDTO,
  type FormacionAcademicaDTO,
  type LicenciaDTO,
  type MateriaDTO,
  type PersonaDTO,
  type PersonaUpdateDTO,
  type SeccionDTO,
  type SeccionMateriaDTO,
} from "@/types/api-generated";
import {
  AlertCircle,
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  GraduationCap,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Trash2,
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

const DEFAULT_SITUACION = "Activo";
const LICENCIA_SITUACION = "En licencia";

const ESTADO_CIVIL_PRESET_OPTIONS = [
  { value: "Soltero/a", label: "Soltero/a" },
  { value: "Casado/a", label: "Casado/a" },
  { value: "Divorciado/a", label: "Divorciado/a" },
  { value: "Viudo/a", label: "Viudo/a" },
  { value: "En pareja", label: "En pareja" },
];

const CONDICION_LABORAL_PRESET_OPTIONS = [
  { value: "Titular", label: "Titular" },
  { value: "Suplente", label: "Suplente" },
  { value: "Interino", label: "Interino" },
  { value: "Contratado", label: "Contratado" },
  { value: "Ad honorem", label: "Ad honorem" },
];

const CARGO_PRESET_OPTIONS = [
  { value: "Docente", label: "Docente" },
  { value: "Preceptor", label: "Preceptor" },
  { value: "Maestro", label: "Maestro" },
  { value: "Profesor", label: "Profesor" },
  { value: "Directivo", label: "Directivo" },
  { value: "Administrativo", label: "Administrativo" },
  { value: "Auxiliar", label: "Auxiliar" },
];

const SITUACION_PRESET_OPTIONS = [
  { value: DEFAULT_SITUACION, label: DEFAULT_SITUACION },
  { value: LICENCIA_SITUACION, label: LICENCIA_SITUACION },
  { value: "De baja", label: "De baja" },
  { value: "Suspendido", label: "Suspendido" },
];

const LEGAJO_MAX_LENGTH = 20;
const LEGAJO_REGEX = /^[A-Z0-9-]{4,20}$/;

function sanitizeLegajoInput(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, LEGAJO_MAX_LENGTH);
}

function normalizeLegajo(value: string) {
  return sanitizeLegajoInput(value).trim();
}

function isLegajoFormatValid(value: string) {
  return LEGAJO_REGEX.test(value);
}

const DEFAULT_PAGE_SIZE = 8;

const MAX_PHOTO_SIZE_MB = 2;
const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const PHOTO_TYPE_EXTENSIONS: Record<
  (typeof ALLOWED_PHOTO_TYPES)[number],
  string[]
> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};
const ALLOWED_PHOTO_LABEL = "JPG, PNG o WEBP";
const PHOTO_INPUT_ACCEPT = ALLOWED_PHOTO_TYPES.join(",");
const PHOTO_URL_REGEX = /^(https?:\/\/.+|\/.+)$/i;

const initialPersonaForm = {
  nombre: "",
  apellido: "",
  dni: "",
  fechaNacimiento: "",
  genero: DEFAULT_GENERO_VALUE,
  estadoCivil: "",
  nacionalidad: "",
  domicilio: "",
  telefono: "",
  celular: "",
  email: "",
  fotoPerfilUrl: "",
};

const initialEmpleadoForm = {
  rolEmpleado: RolEmpleado.DOCENTE,
  cuil: "",
  legajo: "",
  condicionLaboral: "",
  cargo: "",
  situacionActual: DEFAULT_SITUACION,
  fechaIngreso: "",
  antecedentesLaborales: "",
  observacionesGenerales: "",
};

const initialFormacionEntry = {
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

const STAFF_ROLE_OPTIONS: UserRole[] = normalizeRoles([
  UserRole.DIRECTOR,
  UserRole.ADMIN,
  UserRole.SECRETARY,
  UserRole.COORDINATOR,
  UserRole.TEACHER,
  UserRole.ALTERNATE,
]);

type NewPersonaForm = typeof initialPersonaForm;
type NewEmpleadoForm = typeof initialEmpleadoForm;
type NewFormacionEntry = typeof initialFormacionEntry;
type FormacionNotas = typeof initialFormacionNotas;
type NewLicenseForm = typeof initialLicenseForm;
type AccessFormState = {
  email: string;
  password: string;
  confirmPassword: string;
  roles: UserRole[];
};

type EmpleadoSeccionView = {
  seccionId: number;
  label: string;
  nivel?: string | null;
  asignacionId?: number;
  rol?: RolSeccion | null;
  vigenciaDesde?: string | null;
  vigenciaHasta?: string | null;
};

type EmpleadoMateriaView = {
  seccionMateriaId: number;
  seccionId: number;
  seccionLabel: string;
  materiaId: number;
  materiaNombre: string;
  asignacionId?: number;
  rol?: RolMateria | null;
  vigenciaDesde?: string | null;
  vigenciaHasta?: string | null;
};

type EmpleadoView = {
  empleado: EmpleadoDTO;
  persona: PersonaDTO | null;
  secciones: EmpleadoSeccionView[];
  materias: EmpleadoMateriaView[];
  formaciones: FormacionAcademicaDTO[];
  licencias: LicenciaDTO[];
  situacionVisible: string;
  activeLicense: LicenciaDTO | null;
};

type MultiSelectOption = {
  id: number;
  label: string;
  description?: string;
};

type MultiSelectControlProps = {
  label: string;
  placeholder: string;
  options: MultiSelectOption[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
  emptyMessage?: string;
  summaryEmptyText?: string;
  badgeVariant?: "secondary" | "outline";
};

type AssignmentManagerProps = {
  empleadoId: number | null;
  secciones: EmpleadoSeccionView[];
  materias: EmpleadoMateriaView[];
  disabled?: boolean;
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

function getInitialsFromNames(
  nombre?: string | null,
  apellido?: string | null,
) {
  const firstName = (nombre ?? "").trim();
  const lastName = (apellido ?? "").trim();
  const nombreInitial = firstName.length > 0 ? firstName[0] : "";
  const apellidoInitial = lastName.length > 0 ? lastName[0] : "";
  return `${nombreInitial}${apellidoInitial}`.toUpperCase();
}

function formatSeccionLabel(seccion?: Partial<SeccionDTO> | null) {
  if (!seccion) return "";
  const grado = seccion.gradoSala ?? "";
  const division = seccion.division ? ` ${seccion.division}` : "";
  const turno = seccion.turno ? ` (${seccion.turno.toLowerCase()})` : "";
  const composed = `${grado}${division}`.trim();
  return composed ? `${composed}${turno}` : `Sección #${seccion.id ?? ""}`;
}

function getSeccionDisplayName(label?: string | null) {
  if (!label) return "";
  return label.replace(/\s*\([^)]*\)\s*$/, "").trim();
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

function inferDefaultRolesForEmpleado(
  empleado?: EmpleadoDTO | null,
  persona?: PersonaDTO | null,
): UserRole[] {
  if (persona?.roles && persona.roles.length > 0) {
    return normalizeRoles(persona.roles);
  }

  switch (empleado?.rolEmpleado) {
    case RolEmpleado.DIRECCION:
      return [UserRole.DIRECTOR];
    case RolEmpleado.ADMINISTRACION:
      return [UserRole.ADMIN];
    case RolEmpleado.SECRETARIA:
      return [UserRole.SECRETARY];
    case RolEmpleado.DOCENTE:
      return [UserRole.TEACHER];
    default:
      return [];
  }
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

function sanitizeDigits(value: string, maxLength?: number) {
  const digits = (value ?? "").replace(/\D/g, "");
  if (typeof maxLength === "number") {
    return digits.slice(0, maxLength);
  }
  return digits;
}

function composeCuil(prefix: string, dni: string, suffix: string) {
  const normalizedPrefix = sanitizeDigits(prefix, 2);
  const normalizedDni = sanitizeDigits(dni);
  const normalizedSuffix = sanitizeDigits(suffix, 1);
  if (
    normalizedPrefix.length !== 2 ||
    normalizedDni.length < 7 ||
    normalizedSuffix.length !== 1
  ) {
    return "";
  }
  return `${normalizedPrefix}-${normalizedDni}-${normalizedSuffix}`;
}

function splitCuilParts(cuil?: string | null) {
  const digits = sanitizeDigits(cuil ?? "");
  const prefix = digits.slice(0, 2);
  const suffix = digits.length > 2 ? digits.slice(-1) : "";
  return { prefix, suffix };
}

function normalizeIsoDate(value?: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

function isValidPhotoUrl(value?: string | null) {
  if (!value) {
    return true;
  }
  return PHOTO_URL_REGEX.test(value.trim());
}

function todayIso(reference: Date = new Date()) {
  return reference.toISOString().slice(0, 10);
}

function MultiSelectControl({
  label,
  placeholder,
  options,
  selectedIds,
  onChange,
  disabled,
  emptyMessage,
  summaryEmptyText,
  badgeVariant = "secondary",
}: MultiSelectControlProps) {
  const [open, setOpen] = useState(false);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedOptions = useMemo(
    () => options.filter((option) => selectedSet.has(option.id)),
    [options, selectedSet],
  );

  const toggleOption = useCallback(
    (id: number) => {
      onChange(
        selectedSet.has(id)
          ? selectedIds.filter((current) => current !== id)
          : Array.from(new Set([...selectedIds, id])),
      );
    },
    [onChange, selectedIds, selectedSet],
  );

  const resolvedPlaceholder = selectedOptions.length
    ? `${selectedOptions.length} seleccionada${
        selectedOptions.length === 1 ? "" : "s"
      }`
    : placeholder;

  const resolvedEmptyMessage = emptyMessage ?? "Sin opciones disponibles";
  const resolvedSummaryEmpty =
    summaryEmptyText ??
    (options.length === 0
      ? resolvedEmptyMessage
      : "Seleccioná una o más opciones según corresponda.");

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Popover
        open={disabled ? false : open}
        onOpenChange={(next) => {
          if (!disabled) {
            setOpen(next);
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between"
            disabled={disabled || options.length === 0}
          >
            <span className="truncate text-left">{resolvedPlaceholder}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[260px] p-0" align="start">
          <Command>
            <CommandInput placeholder={`Buscar ${label.toLowerCase()}…`} />
            <CommandList>
              <CommandEmpty>{resolvedEmptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const checked = selectedSet.has(option.id);
                  return (
                    <CommandItem
                      key={option.id}
                      onSelect={() => {
                        toggleOption(option.id);
                      }}
                    >
                      <div className="flex w-full items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{option.label}</p>
                          {option.description ? (
                            <p className="text-xs text-muted-foreground">
                              {option.description}
                            </p>
                          ) : null}
                        </div>
                        <div
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            toggleOption(option.id);
                          }}
                          className="cursor-pointer"
                        >
                          <Checkbox checked={checked} disabled={disabled} />
                        </div>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedOptions.length ? (
        <div className="flex flex-wrap gap-2 pt-1">
          {selectedOptions.map((option) => (
            <Badge
              key={`selected-${label}-${option.id}`}
              variant={badgeVariant}
              className="flex items-center gap-1"
            >
              {option.description ? (
                <span className="text-xs text-muted-foreground">
                  {option.description}
                </span>
              ) : null}
              <span>{option.label}</span>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">{resolvedSummaryEmpty}</p>
      )}
    </div>
  );
}

function isLicenseActiveOn(licencia: LicenciaDTO, referenceIso: string) {
  const start = normalizeIsoDate(licencia.fechaInicio);
  if (!start || start > referenceIso) {
    return false;
  }
  const end = normalizeIsoDate(licencia.fechaFin);
  if (end && end < referenceIso) {
    return false;
  }
  return true;
}
export default function PersonalPage() {
  const { loading, user, hasRole } = useAuth();
  const router = useRouter();
  const mountedRef = useRef(false);
  const searchRef = useRef<string>("");
  const currentPageRef = useRef(1);

  useEffect(() => {
    mountedRef.current = true;
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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [nivelFilter, setNivelFilter] = useState("all");
  const [seccionFilter, setSeccionFilter] = useState("all");
  const [materiaFilter, setMateriaFilter] = useState("all");
  const [cargoFilter, setCargoFilter] = useState("all");
  const [situacionFilter, setSituacionFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = DEFAULT_PAGE_SIZE;
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [expandedEmployees, setExpandedEmployees] = useState<Set<number>>(
    new Set<number>(),
  );

  const [dataLoading, setDataLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [personal, setPersonal] = useState<EmpleadoView[]>([]);
  const [allLicencias, setAllLicencias] = useState<LicenciaDTO[]>([]);
  const [availableSecciones, setAvailableSecciones] = useState<SeccionDTO[]>([]);
  const [availableSeccionMaterias, setAvailableSeccionMaterias] = useState<
    SeccionMateriaDTO[]
  >([]);
  const [availableMaterias, setAvailableMaterias] = useState<MateriaDTO[]>([]);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [licenseDialogOpen, setLicenseDialogOpen] = useState(false);
  const [creatingPersonal, setCreatingPersonal] = useState(false);
  const [creatingLicense, setCreatingLicense] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [savingEditPersonal, setSavingEditPersonal] = useState(false);
  const [editingIds, setEditingIds] = useState<{
    personaId: number;
    empleadoId: number;
  } | null>(null);
  const [editingName, setEditingName] = useState("");

  const [accessDialogOpen, setAccessDialogOpen] = useState(false);
  const [activeAccess, setActiveAccess] = useState<{
    persona: PersonaDTO | null;
    empleado: EmpleadoDTO | null;
  } | null>(null);
  const [accessForm, setAccessForm] = useState<AccessFormState>({
    email: "",
    password: "",
    confirmPassword: "",
    roles: [],
  });
  const [savingAccess, setSavingAccess] = useState(false);

  const [newPersona, setNewPersona] = useState<NewPersonaForm>({
    ...initialPersonaForm,
  });
  const [newEmpleado, setNewEmpleado] = useState<NewEmpleadoForm>({
    ...initialEmpleadoForm,
  });
  const [newEmpleadoCuilPrefix, setNewEmpleadoCuilPrefix] = useState("");
  const [newEmpleadoCuilSuffix, setNewEmpleadoCuilSuffix] = useState("");
  const [newSeccionIds, setNewSeccionIds] = useState<number[]>([]);
  const [newMateriaIds, setNewMateriaIds] = useState<number[]>([]);
  const [newFormaciones, setNewFormaciones] = useState<NewFormacionEntry[]>([
    { ...initialFormacionEntry },
  ]);
  const addNewFormacionEntry = useCallback(() => {
    setNewFormaciones((prev) => [...prev, { ...initialFormacionEntry }]);
  }, []);
  const updateNewFormacionEntry = useCallback(
    (index: number, patch: Partial<NewFormacionEntry>) => {
      setNewFormaciones((prev) =>
        prev.map((entry, idx) =>
          idx === index ? { ...entry, ...patch } : entry,
        ),
      );
    },
    [],
  );
  const removeNewFormacionEntry = useCallback((index: number) => {
    setNewFormaciones((prev) => {
      if (prev.length <= 1) {
        return [{ ...initialFormacionEntry }];
      }
      const next = prev.filter((_, idx) => idx !== index);
      return next.length ? next : [{ ...initialFormacionEntry }];
    });
  }, []);
  const [formacionNotas, setFormacionNotas] = useState<FormacionNotas>({
    ...initialFormacionNotas,
  });
  const [editPersona, setEditPersona] = useState<NewPersonaForm>({
    ...initialPersonaForm,
  });
  const [editEmpleado, setEditEmpleado] = useState<NewEmpleadoForm>({
    ...initialEmpleadoForm,
  });
  const [editEmpleadoCuilPrefix, setEditEmpleadoCuilPrefix] = useState("");
  const [editEmpleadoCuilSuffix, setEditEmpleadoCuilSuffix] = useState("");
  const [editSeccionIds, setEditSeccionIds] = useState<number[]>([]);
  const [editMateriaIds, setEditMateriaIds] = useState<number[]>([]);
  const [editSeccionDetails, setEditSeccionDetails] = useState<
    EmpleadoSeccionView[]
  >([]);
  const [editMateriaDetails, setEditMateriaDetails] = useState<
    EmpleadoMateriaView[]
  >([]);
  const [newLicense, setNewLicense] = useState<NewLicenseForm>({
    ...initialLicenseForm,
  });
  const [newPersonaPhotoUploading, setNewPersonaPhotoUploading] =
    useState(false);
  const [newPersonaPhotoError, setNewPersonaPhotoError] = useState<
    string | null
  >(null);
  const [editPersonaPhotoUploading, setEditPersonaPhotoUploading] =
    useState(false);
  const [editPersonaPhotoError, setEditPersonaPhotoError] = useState<
    string | null
  >(null);

  const resetNewPersonalForm = useCallback(() => {
    setNewPersona({ ...initialPersonaForm });
    setNewEmpleado({ ...initialEmpleadoForm });
    setNewFormaciones([{ ...initialFormacionEntry }]);
    setFormacionNotas({ ...initialFormacionNotas });
    setNewEmpleadoCuilPrefix("");
    setNewEmpleadoCuilSuffix("");
    setNewSeccionIds([]);
    setNewMateriaIds([]);
  }, []);

  const resetEditForm = useCallback(() => {
    setEditPersona({ ...initialPersonaForm });
    setEditEmpleado({ ...initialEmpleadoForm });
    setEditEmpleadoCuilPrefix("");
    setEditEmpleadoCuilSuffix("");
    setEditingIds(null);
    setEditingName("");
    setSavingEditPersonal(false);
    setEditSeccionIds([]);
    setEditMateriaIds([]);
    setEditSeccionDetails([]);
    setEditMateriaDetails([]);
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

  useEffect(() => {
    if (!editDialogOpen) {
      resetEditForm();
    }
  }, [editDialogOpen, resetEditForm]);

  useEffect(() => {
    if (!accessDialogOpen) {
      setActiveAccess(null);
      setAccessForm((prev) => {
        const isAlreadyPristine =
          prev.email === "" &&
          prev.password === "" &&
          prev.confirmPassword === "" &&
          prev.roles.length === 0;

        if (isAlreadyPristine) {
          return prev;
        }

        return {
          email: "",
          password: "",
          confirmPassword: "",
          roles: [],
        };
      });
      setSavingAccess(false);
      return;
    }

    const suggestedRoles = inferDefaultRolesForEmpleado(
      activeAccess?.empleado ?? null,
      activeAccess?.persona ?? null,
    );
    const normalizedRoles = normalizeRoles(suggestedRoles);
    const email = activeAccess?.persona?.email ?? "";

    setAccessForm((prev) => {
      const hasSameEmail = prev.email === email;
      const hasEmptyPasswords =
        prev.password === "" && prev.confirmPassword === "";
      const hasSameRoles =
        prev.roles.length === normalizedRoles.length &&
        prev.roles.every((role, index) => role === normalizedRoles[index]);

      if (hasSameEmail && hasEmptyPasswords && hasSameRoles) {
        return prev;
      }

      return {
        email,
        password: "",
        confirmPassword: "",
        roles: normalizedRoles,
      };
    });
  }, [accessDialogOpen, activeAccess]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchData = useCallback(
    async (options: { search?: string; page?: number } = {}) => {
      const normalizedSearch = (options.search ?? "").trim();
      const requestedPage = Math.max(1, options.page ?? 1);
      const empleadosRes = await identidad.empleados.list({
        ...(normalizedSearch.length > 0 ? { search: normalizedSearch } : {}),
        page: requestedPage - 1,
        size: pageSize,
      });
      const empleadoPage = empleadosRes.data;
      const empleados = (empleadoPage?.content ?? []) as EmpleadoDTO[];

      const pageInfo = {
        page: (empleadoPage?.number ?? requestedPage - 1) + 1,
        totalPages: empleadoPage?.totalPages ?? 1,
        totalElements: empleadoPage?.totalElements ?? empleados.length,
        size: empleadoPage?.size ?? pageSize,
      };

      const [
        licencias,
        formaciones,
        secciones,
        seccionMaterias,
        materias,
        asignacionesSeccion,
        asignacionesMateria,
      ] = await Promise.all([
        safeRequest<LicenciaDTO[]>(
          identidad.licencias.list(),
          [] as LicenciaDTO[],
          "No se pudieron obtener las licencias",
        ),
        safeRequest<FormacionAcademicaDTO[]>(
          identidad.formaciones.list(),
          [] as FormacionAcademicaDTO[],
          "No se pudo obtener la formación académica",
        ),
        safeRequest<SeccionDTO[]>(
          gestionAcademica.secciones.list(),
          [] as SeccionDTO[],
          "No se pudieron obtener las secciones",
        ),
        safeRequest<SeccionMateriaDTO[]>(
          gestionAcademica.seccionMaterias.list(),
          [] as SeccionMateriaDTO[],
          "No se pudieron obtener las materias por sección",
        ),
        safeRequest<MateriaDTO[]>(
          gestionAcademica.materias.list(),
          [] as MateriaDTO[],
          "No se pudieron obtener las materias",
        ),
        safeRequest<AsignacionDocenteSeccionDTO[]>(
          gestionAcademica.asignacionDocenteSeccion.list(),
          [] as AsignacionDocenteSeccionDTO[],
          "No se pudieron obtener las asignaciones de sección",
        ),
        safeRequest<AsignacionDocenteMateriaDTO[]>(
          gestionAcademica.asignacionDocenteMateria.list(),
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

      const personaMap = new Map<number, PersonaDTO | null>();
      if (personaIds.length > 0) {
        const personas = await safeRequest<PersonaDTO[]>(
          identidad.personasCore.getManyById(personaIds),
          [] as PersonaDTO[],
          "No se pudo obtener la información personal",
        );

        personas.forEach((persona) => {
          const personaId = persona?.id;
          if (typeof personaId === "number") {
            personaMap.set(personaId, persona);
          }
        });

        personaIds.forEach((id) => {
          if (!personaMap.has(id)) {
            personaMap.set(id, null);
          }
        });
      }

      const seccionMap = new Map<number, SeccionDTO>();
      for (const seccion of secciones) {
        if (typeof seccion.id === "number") {
          seccionMap.set(seccion.id, seccion);
        }
      }

      const seccionMateriaMap = new Map<number, SeccionMateriaDTO>();
      for (const seccionMateria of seccionMaterias) {
        if (typeof seccionMateria.id === "number") {
          seccionMateriaMap.set(seccionMateria.id, seccionMateria);
        }
      }

      const materiaMap = new Map<number, MateriaDTO>();
      for (const materia of materias) {
        if (typeof materia.id === "number") {
          materiaMap.set(materia.id, materia);
        }
      }

      const seccionesPorEmpleado = new Map<number, EmpleadoSeccionView[]>();
      for (const asign of asignacionesSeccion as Array<any>) {
        const empleadoId =
          asign.empleadoId ?? asign.personalId ?? asign.docenteId;
        const seccionId = asign.seccionId ?? asign.seccion?.id;
        if (typeof empleadoId !== "number" || typeof seccionId !== "number") {
          continue;
        }
        const asignacionId =
          typeof asign.id === "number" ? asign.id : undefined;
        const rol = (asign.rol ?? asign.rolSeccion ?? null) as
          | RolSeccion
          | null
          | undefined;
        const vigenciaDesdeRaw =
          asign.vigenciaDesde ?? asign.vigencia_desde ?? asign.desde ?? null;
        const vigenciaHastaRaw =
          asign.vigenciaHasta ?? asign.vigencia_hasta ?? asign.hasta ?? null;
        const entry: EmpleadoSeccionView = {
          seccionId,
          label: "",
          asignacionId,
          rol: rol ?? null,
          vigenciaDesde:
            typeof vigenciaDesdeRaw === "string"
              ? normalizeIsoDate(vigenciaDesdeRaw) || vigenciaDesdeRaw
              : undefined,
          vigenciaHasta:
            typeof vigenciaHastaRaw === "string"
              ? normalizeIsoDate(vigenciaHastaRaw) || vigenciaHastaRaw
              : undefined,
        };
        const current = seccionesPorEmpleado.get(empleadoId) ?? [];
        current.push(entry);
        seccionesPorEmpleado.set(empleadoId, current);
      }

      const materiasPorEmpleado = new Map<number, EmpleadoMateriaView[]>();
      for (const asign of asignacionesMateria as Array<any>) {
        const empleadoId =
          asign.empleadoId ?? asign.personalId ?? asign.docenteId;
        const seccionMateriaId =
          asign.seccionMateriaId ?? asign.seccionMateria?.id ?? null;
        const materiaId =
          asign.materiaId ??
          asign.materia?.id ??
          asign.seccionMateria?.materiaId ??
          asign.seccionMateria?.materia?.id ??
          null;
        if (typeof empleadoId !== "number") {
          continue;
        }
        if (typeof seccionMateriaId !== "number") {
          continue;
        }
        const asignacionId =
          typeof asign.id === "number" ? asign.id : undefined;
        const rol = (asign.rol ?? null) as RolMateria | null | undefined;
        const vigenciaDesdeRaw =
          asign.vigenciaDesde ?? asign.vigencia_desde ?? asign.desde ?? null;
        const vigenciaHastaRaw =
          asign.vigenciaHasta ?? asign.vigencia_hasta ?? asign.hasta ?? null;
        const seccionMateria = seccionMateriaMap.get(seccionMateriaId);
        const resolvedMateriaId =
          typeof seccionMateria?.materiaId === "number"
            ? seccionMateria.materiaId
            : typeof materiaId === "number"
              ? materiaId
              : 0;
        const resolvedSeccionId =
          typeof seccionMateria?.seccionId === "number"
            ? seccionMateria.seccionId
            : 0;
        const entry: EmpleadoMateriaView = {
          seccionMateriaId,
          seccionId: resolvedSeccionId,
          seccionLabel: "",
          materiaId: resolvedMateriaId,
          materiaNombre: "",
          asignacionId,
          rol: rol ?? null,
          vigenciaDesde:
            typeof vigenciaDesdeRaw === "string"
              ? normalizeIsoDate(vigenciaDesdeRaw) || vigenciaDesdeRaw
              : undefined,
          vigenciaHasta:
            typeof vigenciaHastaRaw === "string"
              ? normalizeIsoDate(vigenciaHastaRaw) || vigenciaHastaRaw
              : undefined,
        };
        const current = materiasPorEmpleado.get(empleadoId) ?? [];
        current.push(entry);
        materiasPorEmpleado.set(empleadoId, current);
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

      const referenciaIso = todayIso();

      const personalData: EmpleadoView[] = empleados.map((empleado) => {
        const persona =
          typeof empleado.personaId === "number"
            ? (personaMap.get(empleado.personaId) ?? null)
            : null;

        const seccionAssignments =
          seccionesPorEmpleado.get(empleado.id ?? 0) ?? [];
        const seccionesInfo: EmpleadoSeccionView[] = seccionAssignments
          .map((assignment) => {
            const seccion = seccionMap.get(assignment.seccionId);
            if (!seccion) {
              return null;
            }
            return {
              ...assignment,
              seccionId: seccion.id!,
              label: formatSeccionLabel(seccion),
              nivel: seccion.nivel ?? null,
            } satisfies EmpleadoSeccionView;
          })
          .filter((value): value is EmpleadoSeccionView => Boolean(value));

        const materiaAssignments =
          materiasPorEmpleado.get(empleado.id ?? 0) ?? [];
        const materiasInfo: EmpleadoMateriaView[] = materiaAssignments
          .map((assignment) => {
            const seccionMateria = seccionMateriaMap.get(
              assignment.seccionMateriaId,
            );
            if (!seccionMateria) {
              return null;
            }
            const seccion =
              typeof seccionMateria.seccionId === "number"
                ? seccionMap.get(seccionMateria.seccionId)
                : null;
            const materia =
              typeof seccionMateria.materiaId === "number"
                ? materiaMap.get(seccionMateria.materiaId)
                : null;
            if (!seccion || !materia) {
              return null;
            }
            const materiaNombre =
              materia.nombre ?? `Materia #${materia.id ?? assignment.materiaId}`;
            return {
              ...assignment,
              seccionId: seccion.id!,
              seccionLabel: formatSeccionLabel(seccion),
              materiaId: materia.id!,
              materiaNombre,
            } satisfies EmpleadoMateriaView;
          })
          .filter((value): value is EmpleadoMateriaView => Boolean(value));

        const formacionInfo =
          formacionesPorEmpleado.get(empleado.id ?? 0) ?? [];
        const licenciasInfo = licenciasPorEmpleado.get(empleado.id ?? 0) ?? [];

        const situacionActualRaw = (empleado.situacionActual ?? "").trim();
        const situacionBase =
          situacionActualRaw.length > 0
            ? situacionActualRaw
            : DEFAULT_SITUACION;
        const activeLicense =
          licenciasInfo.find((licencia) =>
            isLicenseActiveOn(licencia, referenciaIso),
          ) ?? null;
        const situacionVisible = activeLicense
          ? LICENCIA_SITUACION
          : situacionBase;

        const empleadoViewData: EmpleadoDTO = {
          ...empleado,
          situacionActual: situacionBase,
        };

        return {
          empleado: empleadoViewData,
          persona,
          secciones: seccionesInfo,
          materias: materiasInfo,
          formaciones: formacionInfo,
          licencias: licenciasInfo,
          situacionVisible,
          activeLicense,
        };
      });

      const licenciasOrdenadas = [...licencias].sort((a, b) =>
        getLicenseStart(b).localeCompare(getLicenseStart(a)),
      );

      return {
        personalData,
        licenciasOrdenadas,
        pageInfo,
        secciones,
        seccionMaterias,
        materias,
      };
    },
    [pageSize],
  );

  const refreshData = useCallback(
    async (options: { search?: string; page?: number } = {}) => {
      setDataLoading(true);
      setLoadError(null);
      try {
        const searchValue = (options.search ?? searchRef.current ?? "").trim();
        const requestedPage = Math.max(
          1,
          options.page ?? currentPageRef.current ?? 1,
        );
        const {
          personalData,
          licenciasOrdenadas,
          pageInfo,
          secciones,
          seccionMaterias,
          materias,
        } = await fetchData({
          search: searchValue,
          page: requestedPage,
        });
        if (!mountedRef.current) return;
        setPersonal(personalData);
        setAllLicencias(licenciasOrdenadas);
        setAvailableSecciones(secciones);
        setAvailableSeccionMaterias(seccionMaterias);
        setAvailableMaterias(materias);
        const resolvedPage = Math.max(1, pageInfo.page);
        setCurrentPage(resolvedPage);
        currentPageRef.current = resolvedPage;
        setTotalPages(Math.max(1, pageInfo.totalPages));
        setTotalItems(Math.max(0, pageInfo.totalElements));
        searchRef.current = searchValue;
      } catch (error) {
        console.error("Error cargando personal", error);
        if (!mountedRef.current) return;
        setLoadError("No se pudo obtener la información del personal.");
        setPersonal([]);
        setAllLicencias([]);
        setAvailableSecciones([]);
        setAvailableSeccionMaterias([]);
        setAvailableMaterias([]);
        setCurrentPage(1);
        currentPageRef.current = 1;
        setTotalPages(1);
        setTotalItems(0);
      } finally {
        if (mountedRef.current) {
          setDataLoading(false);
        }
      }
    },
    [fetchData],
  );

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    refreshData({ search: debouncedSearchTerm, page: 1 });
  }, [loading, user, debouncedSearchTerm, refreshData]);

  useEffect(() => {
    setCurrentPage(1);
    currentPageRef.current = 1;
  }, [nivelFilter, seccionFilter, materiaFilter, cargoFilter, situacionFilter]);

  useEffect(() => {
    setExpandedEmployees(new Set<number>());
  }, [
    debouncedSearchTerm,
    nivelFilter,
    seccionFilter,
    materiaFilter,
    cargoFilter,
    situacionFilter,
  ]);

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
      formatNivel(a).localeCompare(formatNivel(b), "es", {
        sensitivity: "base",
      }),
    );
  }, [personal]);

  const seccionOptions = useMemo(() => {
    const map = new Map<string, string>();
    personal.forEach((p) => {
      p.secciones.forEach((s) => {
        map.set(String(s.seccionId), s.label);
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
        map.set(
          String(m.seccionMateriaId),
          `${m.materiaNombre} • ${m.seccionLabel}`,
        );
      });
    });
    return Array.from(map.entries()).sort((a, b) =>
      a[1].localeCompare(b[1], "es", { sensitivity: "base" }),
    );
  }, [personal]);

  const seccionMultiOptions = useMemo(() => {
    return availableSecciones
      .filter(
        (seccion): seccion is SeccionDTO & { id: number } =>
          typeof seccion.id === "number",
      )
      .map((seccion) => ({
        id: seccion.id!,
        label: formatSeccionLabel(seccion),
        description: seccion.nivel ? formatNivel(seccion.nivel) : undefined,
      }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, "es", { sensitivity: "base" }),
      );
  }, [availableSecciones]);

  const materiaMultiOptions = useMemo(() => {
    const seccionMap = new Map<number, SeccionDTO>();
    availableSecciones.forEach((seccion) => {
      if (typeof seccion.id === "number") {
        seccionMap.set(seccion.id, seccion);
      }
    });
    const materiaMap = new Map<number, MateriaDTO>();
    availableMaterias.forEach((materia) => {
      if (typeof materia.id === "number") {
        materiaMap.set(materia.id, materia);
      }
    });

    return availableSeccionMaterias
      .filter((sm): sm is SeccionMateriaDTO & { id: number } =>
        typeof sm.id === "number" &&
        typeof sm.seccionId === "number" &&
        typeof sm.materiaId === "number",
      )
      .map((sm) => {
        const seccion = seccionMap.get(sm.seccionId!);
        const materia = materiaMap.get(sm.materiaId!);
        const materiaNombre = materia?.nombre ?? `Materia #${sm.materiaId}`;
        const seccionLabel = seccion ? formatSeccionLabel(seccion) : "Sección";
        return {
          id: sm.id!,
          label: materiaNombre,
          description: seccionLabel,
        };
      })
      .sort((a, b) => {
        const byMateria = a.label.localeCompare(b.label, "es", {
          sensitivity: "base",
        });
        if (byMateria !== 0) {
          return byMateria;
        }
        const descA = a.description ?? "";
        const descB = b.description ?? "";
        return descA.localeCompare(descB, "es", { sensitivity: "base" });
      });
  }, [availableMaterias, availableSeccionMaterias, availableSecciones]);

  const syncEmployeeAssignments = useCallback(
    async ({
      empleadoId,
      targetSeccionIds,
      targetMateriaIds,
      existingSecciones,
      existingMaterias,
    }: {
      empleadoId: number;
      targetSeccionIds: number[];
      targetMateriaIds: number[];
      existingSecciones: EmpleadoSeccionView[];
      existingMaterias: EmpleadoMateriaView[];
    }) => {
      const normalizedSecciones = Array.from(
        new Set(
          targetSeccionIds
            .map((id) => Number(id))
            .filter((value) => Number.isFinite(value) && value > 0),
        ),
      );
      const normalizedMaterias = Array.from(
        new Set(
          targetMateriaIds
            .map((id) => Number(id))
            .filter((value) => Number.isFinite(value) && value > 0),
        ),
      );

      const existingSeccionIds = new Set(
        existingSecciones.map((item) => item.seccionId),
      );
      const existingMateriaIds = new Set(
        existingMaterias.map((item) => item.seccionMateriaId),
      );

      const seccionesToCreate = normalizedSecciones.filter(
        (id) => !existingSeccionIds.has(id),
      );
      const materiasToCreate = normalizedMaterias.filter(
        (id) => !existingMateriaIds.has(id),
      );

      const seccionesToRemove = existingSecciones.filter(
        (item) => !normalizedSecciones.includes(item.seccionId),
      );
      const materiasToRemove = existingMaterias.filter(
        (item) => !normalizedMaterias.includes(item.seccionMateriaId),
      );

      if (
        seccionesToCreate.length === 0 &&
        materiasToCreate.length === 0 &&
        seccionesToRemove.length === 0 &&
        materiasToRemove.length === 0
      ) {
        return;
      }

      for (const assignment of seccionesToRemove) {
        if (typeof assignment.asignacionId === "number") {
          await gestionAcademica.asignacionDocenteSeccion.delete(
            assignment.asignacionId,
          );
        }
      }

      for (const assignment of materiasToRemove) {
        if (typeof assignment.asignacionId === "number") {
          await gestionAcademica.asignacionDocenteMateria.delete(
            assignment.asignacionId,
          );
        }
      }

      for (const seccionId of seccionesToCreate) {
        await gestionAcademica.asignacionDocenteSeccion.create({
          empleadoId,
          seccionId,
          rol: RolSeccion.MAESTRO_TITULAR,
          vigenciaDesde: todayIso(),
        });
      }

      for (const seccionMateriaId of materiasToCreate) {
        await gestionAcademica.asignacionDocenteMateria.create({
          empleadoId,
          seccionMateriaId,
          rol: RolMateria.TITULAR,
          vigenciaDesde: todayIso(),
        } as any);
      }
    },
    [],
  );

  const AssignmentManager = ({
    empleadoId,
    secciones,
    materias,
    disabled,
  }: AssignmentManagerProps) => {
    const [selectedSecciones, setSelectedSecciones] = useState<number[]>(() =>
      secciones.map((seccion) => seccion.seccionId),
    );
    const [selectedMaterias, setSelectedMaterias] = useState<number[]>(() =>
      materias.map((materia) => materia.seccionMateriaId),
    );
    const [saving, setSaving] = useState(false);

    useEffect(() => {
      setSelectedSecciones(secciones.map((seccion) => seccion.seccionId));
    }, [secciones]);

    useEffect(() => {
      setSelectedMaterias(
        materias.map((materia) => materia.seccionMateriaId),
      );
    }, [materias]);

    const handleSeccionesChange = useCallback(
      (ids: number[]) => {
        if (ids.length > 2) {
          toast.error(
            "Solo se pueden asignar hasta dos secciones como titulares.",
          );
        }
        setSelectedSecciones(ids.slice(0, 2));
      },
      [],
    );

    const handleSave = useCallback(async () => {
      if (!empleadoId) {
        return;
      }
      setSaving(true);
      try {
        await syncEmployeeAssignments({
          empleadoId,
          targetSeccionIds: selectedSecciones,
          targetMateriaIds: selectedMaterias,
          existingSecciones: secciones,
          existingMaterias: materias,
        });
        toast.success("Asignaciones actualizadas correctamente");
        await refreshData();
      } catch (error: any) {
        console.error("Error al guardar asignaciones", error);
        const description =
          error?.response?.data?.message ??
          error?.message ??
          "No se pudieron guardar las asignaciones del personal.";
        toast.error("Error al guardar asignaciones", { description });
      } finally {
        setSaving(false);
      }
    }, [
      empleadoId,
      materias,
      refreshData,
      secciones,
      selectedMaterias,
      selectedSecciones,
      syncEmployeeAssignments,
    ]);

    const isDisabled = disabled || !empleadoId || saving;

    return (
      <div className="rounded-lg border bg-muted/40 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Users className="h-4 w-4 text-muted-foreground" />
          Gestión de asignaciones
        </div>
        <div className="mt-3 space-y-3">
          <MultiSelectControl
            label="Secciones asignadas"
            placeholder="Seleccioná las secciones"
            options={seccionMultiOptions}
            selectedIds={selectedSecciones}
            onChange={handleSeccionesChange}
            disabled={isDisabled}
            summaryEmptyText={
              isDisabled
                ? "Sin secciones asignadas."
                : "Seleccioná hasta dos secciones o dejalo vacío para no asignar ninguna."
            }
          />
          <MultiSelectControl
            label="Materias asignadas"
            placeholder="Seleccioná las materias"
            options={materiaMultiOptions}
            selectedIds={selectedMaterias}
            onChange={(ids) => setSelectedMaterias(ids)}
            disabled={isDisabled}
            badgeVariant="outline"
            summaryEmptyText={
              isDisabled
                ? "Sin materias asignadas."
                : "Seleccioná las materias por sección o dejalo vacío para removerlas."
            }
          />
          <div className="flex flex-col gap-2 pt-1 text-xs text-muted-foreground">
            <p>
              Los cambios aplican inmediatamente sobre la planificación y las
              vistas académicas.
            </p>
            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={isDisabled}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando…
                  </>
                ) : (
                  "Guardar asignaciones"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
      if (p.situacionVisible) {
        set.add(p.situacionVisible);
      }
    });
    return Array.from(set.values()).sort((a, b) => a.localeCompare(b));
  }, [personal]);

  const generoSelectOptions = useMemo(() => GENERO_OPTIONS, []);

  const estadoCivilSelectOptions = useMemo(() => {
    const map = new Map<string, string>();
    ESTADO_CIVIL_PRESET_OPTIONS.forEach((option) =>
      map.set(option.value, option.label),
    );
    personal.forEach((p) => {
      const value = p.persona?.estadoCivil?.trim();
      if (value) {
        map.set(value, value);
      }
    });
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, "es", { sensitivity: "base" }),
      );
  }, [personal]);

  const newPersonaInitials = getInitialsFromNames(
    newPersona.nombre,
    newPersona.apellido,
  );
  const editPersonaInitials = getInitialsFromNames(
    editPersona.nombre,
    editPersona.apellido,
  );

  const condicionLaboralSelectOptions = useMemo(() => {
    const map = new Map<string, string>();
    CONDICION_LABORAL_PRESET_OPTIONS.forEach((option) =>
      map.set(option.value, option.label),
    );
    personal.forEach((p) => {
      const value = p.empleado.condicionLaboral?.trim();
      if (value) {
        map.set(value, value);
      }
    });
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, "es", { sensitivity: "base" }),
      );
  }, [personal]);

  const cargoSelectOptions = useMemo(() => {
    const map = new Map<string, string>();
    CARGO_PRESET_OPTIONS.forEach((option) =>
      map.set(option.value, option.label),
    );
    personal.forEach((p) => {
      const value = p.empleado.cargo?.trim();
      if (value) {
        map.set(value, value);
      }
    });
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, "es", { sensitivity: "base" }),
      );
  }, [personal]);

  const situacionSelectOptions = useMemo(() => {
    const map = new Map<string, string>();
    SITUACION_PRESET_OPTIONS.forEach((option) =>
      map.set(option.value, option.label),
    );
    personal.forEach((p) => {
      const base = p.empleado.situacionActual?.trim();
      if (base) {
        map.set(base, base);
      }
      const visible = p.situacionVisible?.trim();
      if (visible) {
        map.set(visible, visible);
      }
    });
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) =>
        a.label.localeCompare(b.label, "es", { sensitivity: "base" }),
      );
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
          item.empleado.legajo ?? "",
          item.empleado.cargo ?? "",
          item.empleado.condicionLaboral ?? "",
          item.empleado.situacionActual ?? "",
          item.situacionVisible ?? "",
          item.empleado.rolEmpleado ?? "",
          ...item.secciones.map((s) => s.label ?? ""),
          ...item.secciones.map((s) => String(s.nivel ?? "")),
          ...item.materias.map((m) => m.materiaNombre ?? ""),
          ...item.materias.map((m) => m.seccionLabel ?? ""),
          ...item.formaciones.map((f) => f.tituloObtenido ?? ""),
          ...item.formaciones.map((f) => f.institucion ?? ""),
          item.empleado.antecedentesLaborales ?? "",
          item.empleado.observacionesGenerales ?? "",
        ];

        const matchesSearch =
          !term ||
          haystack.some(
            (value) => value && value.toString().toLowerCase().includes(term),
          );
        if (!matchesSearch) return false;

        if (
          normalizedNivel &&
          !item.secciones.some(
            (s) => String(s.nivel ?? "").toLowerCase() === normalizedNivel,
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
          !item.materias.some(
            (m) => String(m.seccionMateriaId) === normalizedMateria,
          )
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
          (item.situacionVisible ?? "").toLowerCase() !== normalizedSituacion &&
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
        empleadoSituacionVisible:
          personalInfo?.situacionVisible ??
          personalInfo?.empleado.situacionActual ??
          null,
        empleadoSituacionOriginal:
          personalInfo?.empleado.situacionActual ?? null,
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
        empleadoSituacionVisible,
        empleadoSituacionOriginal,
        secciones,
        materias,
      }) => {
        const matchesSearch =
          !term ||
          empleadoNombre.toLowerCase().includes(term) ||
          (empleadoCargo ?? "").toLowerCase().includes(term) ||
          (empleadoSituacionVisible ?? "").toLowerCase().includes(term) ||
          (licencia.tipoLicencia ?? "").toLowerCase().includes(term) ||
          (licencia.motivo ?? "").toLowerCase().includes(term) ||
          (licencia.observaciones ?? "").toLowerCase().includes(term);

        if (!matchesSearch) return false;

        if (
          normalizedNivel &&
          !secciones.some(
            (s) => String(s.nivel ?? "").toLowerCase() === normalizedNivel,
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
          (empleadoSituacionVisible ?? "").toLowerCase() !==
            normalizedSituacion &&
          (empleadoSituacionOriginal ?? "").toLowerCase() !==
            normalizedSituacion
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

  const visiblePages = useMemo(() => {
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    const pages: number[] = [];
    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }
    return pages;
  }, [currentPage, totalPages]);

  const paginatedPersonal = useMemo(() => filteredPersonal, [filteredPersonal]);

  const handlePageChange = useCallback(
    (page: number) => {
      const target = Math.max(1, Math.min(page, totalPages));
      if (target === currentPage) return;
      refreshData({ page: target });
    },
    [currentPage, totalPages, refreshData],
  );

  const empleadoOptions = useMemo(() => {
    return Array.from(empleadoNameMap.entries())
      .map(([id, info]) => ({
        id,
        name: info.name,
        cargo: info.cargo ?? null,
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name, "es", { sensitivity: "base" }),
      );
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

  const toggleEmployeeDetails = useCallback((empleadoId?: number | null) => {
    if (typeof empleadoId !== "number") {
      return;
    }
    setExpandedEmployees((prev) => {
      const next = new Set(prev);
      if (next.has(empleadoId)) {
        next.delete(empleadoId);
      } else {
        next.add(empleadoId);
      }
      return next;
    });
  }, []);

  const validatePhotoFile = useCallback((file: File) => {
    const normalizedType = (file.type || "").toLowerCase();
    const isAllowedType = ALLOWED_PHOTO_TYPES.includes(
      normalizedType as (typeof ALLOWED_PHOTO_TYPES)[number],
    );
    const lowerName = file.name.toLowerCase();
    const isAllowedExtension = ALLOWED_PHOTO_TYPES.some((type) =>
      PHOTO_TYPE_EXTENSIONS[type].some((ext) => lowerName.endsWith(ext)),
    );

    if (!isAllowedType && !isAllowedExtension) {
      return `Formato no soportado. Permitidos: ${ALLOWED_PHOTO_LABEL}.`;
    }

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      return `La imagen supera ${MAX_PHOTO_SIZE_MB} MB.`;
    }

    return null;
  }, []);

  const handleNewPersonaPhotoFile = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      event.target.value = "";
      if (!file) {
        return;
      }

      setNewPersonaPhotoError(null);
      const validationError = validatePhotoFile(file);
      if (validationError) {
        setNewPersonaPhotoError(validationError);
        toast.error("Archivo inválido", { description: validationError });
        return;
      }

      setNewPersonaPhotoUploading(true);
      try {
        const response = await identidad.personasCore.uploadPhoto(file);
        const url = response.data?.url;
        if (!url) {
          throw new Error("No recibimos la URL generada para la foto");
        }
        setNewPersona((prev) => ({ ...prev, fotoPerfilUrl: url }));
        toast.success("Foto de perfil cargada", {
          description: "Guardá el formulario para confirmar los cambios.",
        });
      } catch (error: any) {
        console.error("Error al subir foto de perfil", error);
        const description =
          error?.response?.data?.message ??
          error?.message ??
          "No pudimos subir la imagen seleccionada.";
        setNewPersonaPhotoError(description);
        toast.error("No se pudo subir la foto", { description });
      } finally {
        setNewPersonaPhotoUploading(false);
      }
    },
    [validatePhotoFile],
  );

  const handleEditPersonaPhotoFile = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      event.target.value = "";
      if (!file) {
        return;
      }

      setEditPersonaPhotoError(null);
      const validationError = validatePhotoFile(file);
      if (validationError) {
        setEditPersonaPhotoError(validationError);
        toast.error("Archivo inválido", { description: validationError });
        return;
      }

      setEditPersonaPhotoUploading(true);
      try {
        const response = await identidad.personasCore.uploadPhoto(file);
        const url = response.data?.url;
        if (!url) {
          throw new Error("No recibimos la URL generada para la foto");
        }
        setEditPersona((prev) => ({ ...prev, fotoPerfilUrl: url }));
        toast.success("Foto de perfil actualizada", {
          description: "Recordá guardar los cambios del legajo.",
        });
      } catch (error: any) {
        console.error("Error al subir foto de perfil", error);
        const description =
          error?.response?.data?.message ??
          error?.message ??
          "No pudimos subir la imagen seleccionada.";
        setEditPersonaPhotoError(description);
        toast.error("No se pudo subir la foto", { description });
      } finally {
        setEditPersonaPhotoUploading(false);
      }
    },
    [validatePhotoFile],
  );

  const clearNewPersonaPhoto = useCallback(() => {
    setNewPersona((prev) => ({ ...prev, fotoPerfilUrl: "" }));
    setNewPersonaPhotoError(null);
  }, []);

  const clearEditPersonaPhoto = useCallback(() => {
    setEditPersona((prev) => ({ ...prev, fotoPerfilUrl: "" }));
    setEditPersonaPhotoError(null);
  }, []);

  const handleOpenEditDialog = useCallback((item: EmpleadoView) => {
    const persona = item.persona;
    const empleado = item.empleado;
    if (!persona?.id || typeof empleado.id !== "number") {
      toast.error("No encontramos la ficha completa de este personal.");
      return;
    }

    setEditPersona({
      nombre: persona.nombre ?? "",
      apellido: persona.apellido ?? "",
      dni: formatDni(persona.dni ?? ""),
      fechaNacimiento: persona.fechaNacimiento ?? "",
      genero: normalizeGenero(persona.genero) || DEFAULT_GENERO_VALUE,
      estadoCivil: persona.estadoCivil ?? "",
      nacionalidad: persona.nacionalidad ?? "",
      domicilio: persona.domicilio ?? "",
      telefono: persona.telefono ?? "",
      celular: persona.celular ?? "",
      email: persona.email ?? "",
      fotoPerfilUrl: persona.fotoPerfilUrl ?? "",
    });

    setEditEmpleado({
      rolEmpleado: empleado.rolEmpleado ?? RolEmpleado.DOCENTE,
      cuil: empleado.cuil ?? persona.cuil ?? "",
      legajo: normalizeLegajo(empleado.legajo ?? ""),
      condicionLaboral: empleado.condicionLaboral ?? "",
      cargo: empleado.cargo ?? "",
      situacionActual: empleado.situacionActual ?? DEFAULT_SITUACION,
      fechaIngreso: empleado.fechaIngreso ?? "",
      antecedentesLaborales: empleado.antecedentesLaborales ?? "",
      observacionesGenerales: empleado.observacionesGenerales ?? "",
    });

    const { prefix, suffix } = splitCuilParts(
      empleado.cuil ?? persona.cuil ?? "",
    );
    setEditEmpleadoCuilPrefix(prefix);
    setEditEmpleadoCuilSuffix(suffix);
    setEditSeccionDetails(item.secciones);
    setEditMateriaDetails(item.materias);
    setEditSeccionIds(item.secciones.map((seccion) => seccion.seccionId));
    setEditMateriaIds(
      item.materias.map((materia) => materia.seccionMateriaId),
    );
    setEditingIds({ personaId: persona.id, empleadoId: empleado.id });
    setEditingName(buildFullName(persona) || `Empleado #${empleado.id}`);
    setEditPersonaPhotoError(null);
    setEditPersonaPhotoUploading(false);
    setEditDialogOpen(true);
  }, []);
  const handleCreatePersonal = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const nombre = newPersona.nombre.trim();
      const apellido = newPersona.apellido.trim();
      const dniValue = formatDni(newPersona.dni);

      if (!nombre || !apellido || !dniValue) {
        toast.error("Datos incompletos", {
          description: "Nombre, apellido y DNI son obligatorios.",
        });
        return;
      }

      if (dniValue.length < 7 || dniValue.length > 10) {
        toast.error("DNI inválido", {
          description: "El DNI debe tener entre 7 y 10 dígitos numéricos.",
        });
        return;
      }

      const fechaNacimiento = newPersona.fechaNacimiento;
      if (!fechaNacimiento) {
        toast.error("Fecha requerida", {
          description: "Ingresá la fecha de nacimiento.",
        });
        return;
      }

      if (!isBirthDateValid(fechaNacimiento)) {
        toast.error("Fecha de nacimiento inválida", {
          description:
            "La fecha de nacimiento debe ser al menos dos años anterior a hoy.",
        });
        return;
      }

      const genero = newPersona.genero;
      const estadoCivil = newPersona.estadoCivil;
      const nacionalidad = newPersona.nacionalidad.trim();
      const domicilio = newPersona.domicilio.trim();
      const telefono = newPersona.telefono.trim();
      const celular = newPersona.celular.trim();
      const email = newPersona.email.trim();
      const fotoPerfilUrl = newPersona.fotoPerfilUrl.trim();

      if (
        !genero ||
        !estadoCivil ||
        !nacionalidad ||
        !domicilio ||
        !telefono ||
        !celular ||
        !email
      ) {
        toast.error("Datos personales incompletos", {
          description:
            "Completá género, estado civil y los datos de contacto obligatorios.",
        });
        return;
      }

      if (fotoPerfilUrl && !isValidPhotoUrl(fotoPerfilUrl)) {
        const description =
          "Ingresá una URL válida que comience con http(s):// o utilice recursos del sistema.";
        setNewPersonaPhotoError(description);
        toast.error("URL de foto inválida", { description });
        return;
      }

      if (!newEmpleado.rolEmpleado) {
        toast.error("Rol requerido", {
          description: "Seleccioná el rol institucional del personal.",
        });
        return;
      }

      const legajo = normalizeLegajo(newEmpleado.legajo ?? "");

      if (!legajo) {
        toast.error("Legajo requerido", {
          description:
            "Ingresá el legajo institucional (4 a 20 caracteres alfanuméricos o guiones).",
        });
        return;
      }

      if (!isLegajoFormatValid(legajo)) {
        toast.error("Formato de legajo inválido", {
          description:
            "Usá entre 4 y 20 caracteres, solo letras mayúsculas, números y guiones.",
        });
        return;
      }

      const condicionLaboral = newEmpleado.condicionLaboral.trim();
      const cargo = newEmpleado.cargo.trim();
      const fechaIngreso = newEmpleado.fechaIngreso;

      if (!condicionLaboral || !cargo || !fechaIngreso) {
        toast.error("Datos laborales incompletos", {
          description:
            "Seleccioná la condición laboral, el cargo actual y la fecha de ingreso.",
        });
        return;
      }

      const cuil = composeCuil(
        newEmpleadoCuilPrefix,
        dniValue,
        newEmpleadoCuilSuffix,
      );

      if (!cuil) {
        toast.error("CUIL incompleto", {
          description:
            "Completá el prefijo y el dígito verificador vinculados al DNI.",
        });
        return;
      }

      const normalizedFormaciones = newFormaciones.map((entry) => ({
        nivel: entry.nivel.trim(),
        tituloObtenido: entry.tituloObtenido.trim(),
        institucion: entry.institucion.trim(),
        fechaInicio: entry.fechaInicio.trim(),
        fechaFin: entry.fechaFin.trim(),
      }));

      const formacionesARegistrar: Array<{
        nivel: string;
        tituloObtenido: string;
        institucion: string;
        fechaInicio: string;
        fechaFin?: string;
      }> = [];

      for (let index = 0; index < normalizedFormaciones.length; index += 1) {
        const formacion = normalizedFormaciones[index];
        const tieneDatos =
          formacion.nivel.length > 0 ||
          formacion.tituloObtenido.length > 0 ||
          formacion.institucion.length > 0 ||
          formacion.fechaInicio.length > 0 ||
          formacion.fechaFin.length > 0;

        if (!tieneDatos) {
          continue;
        }

        const numeroFormacion = index + 1;

        if (
          !formacion.nivel ||
          !formacion.tituloObtenido ||
          !formacion.institucion ||
          !formacion.fechaInicio
        ) {
          toast.error("Formación incompleta", {
            description:
              "Completá nivel, título, institución y fecha de inicio en la formación #" +
              numeroFormacion +
              " o eliminála si no querés guardarla.",
          });
          return;
        }

        if (
          formacion.fechaFin &&
          formacion.fechaFin.length > 0 &&
          formacion.fechaFin < formacion.fechaInicio
        ) {
          toast.error("Fechas de formación inválidas", {
            description:
              "La fecha de fin no puede ser anterior a la de inicio en la formación #" +
              numeroFormacion +
              ".",
          });
          return;
        }

        formacionesARegistrar.push({
          ...formacion,
          fechaFin: formacion.fechaFin || undefined,
        });
      }

      setCreatingPersonal(true);
      try {
        const personaPayload = {
          nombre,
          apellido,
          dni: dniValue,
          fechaNacimiento,
          genero,
          estadoCivil,
          nacionalidad,
          domicilio,
          telefono,
          celular,
          email,
          fotoPerfilUrl: fotoPerfilUrl || undefined,
        };

        const personaRes = await identidad.personasCore.create(personaPayload);
        const personaId = personaRes.data;
        if (!personaId) {
          throw new Error("El backend no devolvió el ID de la persona");
        }

        await identidad.personasCore.update(personaId, { cuil });

        const extraNotas: string[] = [];
        if (formacionNotas.otrosTitulos.trim().length > 0) {
          extraNotas.push(
            `Otros títulos: ${formacionNotas.otrosTitulos.trim()}`,
          );
        }
        if (formacionNotas.especializaciones.trim().length > 0) {
          extraNotas.push(
            `Especializaciones: ${formacionNotas.especializaciones.trim()}`,
          );
        }
        if (formacionNotas.cursos.trim().length > 0) {
          extraNotas.push(`Cursos: ${formacionNotas.cursos.trim()}`);
        }

        const observacionesBase =
          newEmpleado.observacionesGenerales?.trim() ?? "";
        const observacionesGenerales = [observacionesBase, ...extraNotas]
          .filter(Boolean)
          .join("\n");

        const empleadoPayload = {
          personaId,
          rolEmpleado: newEmpleado.rolEmpleado,
          cuil,
          legajo,
          condicionLaboral,
          cargo,
          situacionActual: DEFAULT_SITUACION,
          fechaIngreso,
          antecedentesLaborales:
            newEmpleado.antecedentesLaborales?.trim() || undefined,
          observacionesGenerales: observacionesGenerales || undefined,
        };

        const empleadoRes = await identidad.empleados.create(empleadoPayload);
        const empleadoId = empleadoRes.data?.id;

        try {
          if (typeof empleadoId === "number") {
            await syncEmployeeAssignments({
              empleadoId,
              targetSeccionIds: newSeccionIds,
              targetMateriaIds: newMateriaIds,
              existingSecciones: [],
              existingMaterias: [],
            });
          }
        } catch (assignError) {
          if (typeof empleadoId === "number") {
            try {
              await identidad.empleados.delete(empleadoId);
            } catch (deleteError) {
              console.error(
                "No se pudo revertir el empleado tras un error en las asignaciones",
                deleteError,
              );
            }
          }
          throw assignError;
        }

        if (empleadoId && formacionesARegistrar.length > 0) {
          for (const formacion of formacionesARegistrar) {
            await identidad.formaciones.create({
              empleadoId,
              tituloObtenido: formacion.tituloObtenido,
              institucion: formacion.institucion,
              nivel: formacion.nivel,
              fechaInicio: formacion.fechaInicio,
              fechaFin: formacion.fechaFin,
            });
          }
        }

        toast.success("Personal registrado", {
          description:
            "El nuevo miembro del personal fue creado correctamente.",
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
    [
      formacionNotas,
      newEmpleado,
      newEmpleadoCuilPrefix,
      newEmpleadoCuilSuffix,
      newFormaciones,
      newPersona,
      newSeccionIds,
      newMateriaIds,
      refreshData,
      syncEmployeeAssignments,
    ],
  );

  const handleUpdatePersonal = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!editingIds) {
        toast.error("No encontramos la ficha seleccionada para editar.");
        return;
      }

      const nombre = editPersona.nombre.trim();
      const apellido = editPersona.apellido.trim();
      const dniValue = formatDni(editPersona.dni);

      if (!nombre || !apellido || !dniValue) {
        toast.error("Datos incompletos", {
          description: "Completá nombre, apellido y DNI.",
        });
        return;
      }

      if (dniValue.length < 7 || dniValue.length > 10) {
        toast.error("DNI inválido", {
          description: "El DNI debe tener entre 7 y 10 dígitos numéricos.",
        });
        return;
      }

      const fechaNacimiento = editPersona.fechaNacimiento;
      if (!fechaNacimiento) {
        toast.error("Fecha requerida", {
          description: "Ingresá la fecha de nacimiento.",
        });
        return;
      }

      if (!isBirthDateValid(fechaNacimiento)) {
        toast.error("Fecha de nacimiento inválida", {
          description:
            "La fecha de nacimiento debe ser al menos dos años anterior a hoy.",
        });
        return;
      }

      const genero = editPersona.genero;
      const estadoCivil = editPersona.estadoCivil;
      const nacionalidad = editPersona.nacionalidad.trim();
      const domicilio = editPersona.domicilio.trim();
      const telefono = editPersona.telefono.trim();
      const celular = editPersona.celular.trim();
      const email = editPersona.email.trim();
      const fotoPerfilUrl = editPersona.fotoPerfilUrl.trim();

      if (
        !genero ||
        !estadoCivil ||
        !nacionalidad ||
        !domicilio ||
        !telefono ||
        !celular ||
        !email
      ) {
        toast.error("Datos personales incompletos", {
          description:
            "Completá género, estado civil y los datos de contacto obligatorios.",
        });
        return;
      }

      if (fotoPerfilUrl && !isValidPhotoUrl(fotoPerfilUrl)) {
        const description =
          "Ingresá una URL válida que comience con http(s):// o utilice recursos del sistema.";
        setEditPersonaPhotoError(description);
        toast.error("URL de foto inválida", { description });
        return;
      }

      if (!editEmpleado.rolEmpleado) {
        toast.error("Rol requerido", {
          description: "Seleccioná el rol institucional del personal.",
        });
        return;
      }

      const legajo = normalizeLegajo(editEmpleado.legajo ?? "");

      if (!legajo) {
        toast.error("Legajo requerido", {
          description:
            "Ingresá el legajo institucional (4 a 20 caracteres alfanuméricos o guiones).",
        });
        return;
      }

      if (!isLegajoFormatValid(legajo)) {
        toast.error("Formato de legajo inválido", {
          description:
            "Usá entre 4 y 20 caracteres, solo letras mayúsculas, números y guiones.",
        });
        return;
      }

      const condicionLaboral = editEmpleado.condicionLaboral.trim();
      const cargo = editEmpleado.cargo.trim();
      const fechaIngreso = editEmpleado.fechaIngreso;
      const situacionActual =
        editEmpleado.situacionActual?.trim() || DEFAULT_SITUACION;

      if (!condicionLaboral || !cargo || !fechaIngreso) {
        toast.error("Datos laborales incompletos", {
          description:
            "Seleccioná la condición laboral, el cargo actual y la fecha de ingreso.",
        });
        return;
      }

      const cuil = composeCuil(
        editEmpleadoCuilPrefix,
        dniValue,
        editEmpleadoCuilSuffix,
      );

      if (!cuil) {
        toast.error("CUIL incompleto", {
          description:
            "Completá el prefijo y el dígito verificador vinculados al DNI.",
        });
        return;
      }

      setSavingEditPersonal(true);
      try {
        const personaPayload: Partial<PersonaUpdateDTO> = {
          nombre,
          apellido,
          dni: dniValue,
          fechaNacimiento,
          genero,
          estadoCivil,
          nacionalidad,
          domicilio,
          telefono,
          celular,
          email,
          cuil,
          fotoPerfilUrl: fotoPerfilUrl || undefined,
        };

        await identidad.personasCore.update(
          editingIds.personaId,
          personaPayload,
        );

        await identidad.empleados.update(editingIds.empleadoId, {
          rolEmpleado: editEmpleado.rolEmpleado,
          cuil,
          legajo,
          condicionLaboral,
          cargo,
          situacionActual,
          fechaIngreso,
          antecedentesLaborales:
            editEmpleado.antecedentesLaborales?.trim() || undefined,
          observacionesGenerales:
            editEmpleado.observacionesGenerales?.trim() || undefined,
        });

        try {
          await syncEmployeeAssignments({
            empleadoId: editingIds.empleadoId,
            targetSeccionIds: editSeccionIds,
            targetMateriaIds: editMateriaIds,
            existingSecciones: editSeccionDetails,
            existingMaterias: editMateriaDetails,
          });
        } catch (assignmentError: any) {
          console.error("Error al actualizar asignaciones", assignmentError);
          const description =
            assignmentError?.response?.data?.message ??
            assignmentError?.message ??
            "No se pudieron actualizar las asignaciones del personal.";
          toast.error("Error al actualizar asignaciones", { description });
          return;
        }

        toast.success("Datos del personal actualizados");
        setEditDialogOpen(false);
        await refreshData();
      } catch (error: any) {
        console.error("Error al actualizar personal", error);
        const description =
          error?.response?.data?.message ??
          error?.message ??
          "No se pudo actualizar la información del personal.";
        toast.error("Error al actualizar personal", { description });
      } finally {
        setSavingEditPersonal(false);
      }
    },
    [
      editEmpleado,
      editEmpleadoCuilPrefix,
      editEmpleadoCuilSuffix,
      editPersona,
      editingIds,
      editSeccionIds,
      editMateriaIds,
      editSeccionDetails,
      editMateriaDetails,
      refreshData,
      syncEmployeeAssignments,
    ],
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
        await identidad.licencias.create(payload);
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

  const handleOpenAccessDialog = useCallback(
    (persona: PersonaDTO | null, empleado: EmpleadoDTO | null) => {
      if (!persona?.id) {
        toast.error("No encontramos la persona vinculada a este perfil");
        return;
      }
      setActiveAccess({ persona, empleado });
      setAccessDialogOpen(true);
    },
    [],
  );

  const handleSaveAccess = useCallback(async () => {
    const persona = activeAccess?.persona;
    if (!persona?.id) {
      toast.error("No encontramos la persona vinculada a este perfil");
      return;
    }

    const email = accessForm.email.trim();
    const password = accessForm.password.trim();
    const confirmPassword = accessForm.confirmPassword.trim();

    if (!email) {
      toast.error("Ingresá un email válido para el acceso");
      return;
    }

    if (!persona.credencialesActivas && !password) {
      toast.error("Definí una contraseña inicial");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    const selectedRoles =
      accessForm.roles.length > 0
        ? accessForm.roles
        : inferDefaultRolesForEmpleado(activeAccess?.empleado ?? null, persona);

    if (!selectedRoles.length) {
      toast.error("Seleccioná al menos un rol para el acceso");
      return;
    }

    const payload: Partial<PersonaUpdateDTO> = {
      email,
      roles: normalizeRoles(selectedRoles),
    };

    if (password) {
      payload.password = password;
    }

    setSavingAccess(true);
    try {
      await identidad.personasCore.update(persona.id, payload);
      const { data: refreshed } = await identidad.personasCore.getById(
        persona.id,
      );
      if (refreshed) {
        setActiveAccess((prev) =>
          prev ? { ...prev, persona: refreshed ?? null } : prev,
        );
      }
      toast.success("Acceso del personal actualizado");
      setAccessDialogOpen(false);
      await refreshData();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "No pudimos actualizar el acceso del personal",
      );
    } finally {
      setSavingAccess(false);
    }
  }, [accessForm, activeAccess, refreshData]);

  const renderLoadingState = () => (
    <LoadingState label="Cargando información…" />
  );

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
          {context === "personal"
            ? "Filtros del personal"
            : "Filtros de licencias"}
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
  const canEditPersonal = canCreatePersonal;
  const canRegisterLicenses =
    hasRole(UserRole.DIRECTOR) ||
    hasRole(UserRole.ADMIN) ||
    hasRole(UserRole.SECRETARY);
  const canManageAccess = canCreatePersonal;

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de personal
          </h1>
          <p className="text-muted-foreground">
            Administra la información del personal docente y no docente,
            registra nuevas altas y realiza el seguimiento de licencias.
          </p>
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
                <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Mostrando {paginatedPersonal.length} de {totalItems}{" "}
                    integrantes
                  </span>
                  <span>
                    Página {currentPage} de {totalPages}
                  </span>
                </div>
                {paginatedPersonal.map((item, index) => {
                  const rawEmpleadoId = item.empleado.id;
                  const empleadoId = rawEmpleadoId ?? index;
                  const persona = item.persona;
                  const fullName =
                    buildFullName(persona) ||
                    `Empleado #${item.empleado.id ?? empleadoId}`;
                  const initials = getInitialsFromNames(
                    persona?.nombre,
                    persona?.apellido,
                  );
                  const fotoPerfilUrl = persona?.fotoPerfilUrl?.trim() ?? "";
                  const licenciasOrdenadas = [...item.licencias].sort((a, b) =>
                    getLicenseStart(b).localeCompare(getLicenseStart(a)),
                  );
                  const ultimaLicencia = licenciasOrdenadas[0];
                  const fechaIngreso = formatDate(item.empleado.fechaIngreso);
                  const condicion =
                    item.empleado.condicionLaboral ?? "No especificada";
                  const situacion =
                    item.situacionVisible ||
                    item.empleado.situacionActual ||
                    DEFAULT_SITUACION;
                  const dni = persona?.dni ?? "Sin registrar";
                  const cuil =
                    item.empleado.cuil ?? persona?.cuil ?? "Sin registrar";
                  const legajo = item.empleado.legajo ?? "Sin registrar";
                  const fechaNacimiento = formatDate(persona?.fechaNacimiento);
                  const nacionalidad = persona?.nacionalidad ?? "No informada";
                  const estadoCivil = persona?.estadoCivil ?? "No informado";
                  const genero = persona?.genero ?? "No informado";
                  const email = persona?.email ?? "Sin correo registrado";
                  const telefono = persona?.telefono ?? "Sin teléfono";
                  const celular = persona?.celular ?? "Sin celular";
                  const domicilio =
                    persona?.domicilio ?? "Sin domicilio registrado";
                  const licenciaActiva = item.activeLicense;
                  const personaId = persona?.id ?? null;
                  const roleOptions = normalizeRoles([
                    ...STAFF_ROLE_OPTIONS,
                    ...(persona?.roles ?? []),
                  ]);
                  const isAccessDialogOpen =
                    accessDialogOpen &&
                    personaId !== null &&
                    activeAccess?.persona?.id === personaId;
                  const canEditThis =
                    canEditPersonal &&
                    personaId !== null &&
                    typeof item.empleado.id === "number";
                  const isExpanded =
                    typeof rawEmpleadoId === "number" &&
                    expandedEmployees.has(rawEmpleadoId);
                  return (
                    <Card key={`personal-${empleadoId}`}>
                      <CardHeader className="space-y-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              {fotoPerfilUrl ? (
                                <AvatarImage
                                  src={fotoPerfilUrl}
                                  alt={`Foto de ${fullName}`}
                                />
                              ) : null}
                              <AvatarFallback>
                                {initials.length ? (
                                  initials
                                ) : (
                                  <User className="h-5 w-5" />
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-semibold leading-none">
                                  {fullName}
                                </h3>

                                {getSituacionBadge(item.situacionVisible)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {formatRol(item.empleado.rolEmpleado)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Legajo:{" "}
                                <span className="font-medium text-foreground">
                                  {legajo}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant={isExpanded ? "secondary" : "outline"}
                              onClick={() =>
                                toggleEmployeeDetails(item.empleado.id)
                              }
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="mr-2 h-4 w-4" />
                                  Ocultar detalles
                                </>
                              ) : (
                                <>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Ver detalles
                                </>
                              )}
                            </Button>
                            {canEditThis ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handleOpenEditDialog(item)}
                                disabled={savingEditPersonal}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar ficha
                              </Button>
                            ) : null}
                            {canRegisterLicenses &&
                            typeof item.empleado.id === "number" ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleOpenLicenseDialog(item.empleado.id)
                                }
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Registrar licencia
                              </Button>
                            ) : null}
                          </div>
                        </div>
                        {item.secciones.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {(() => {
                              const materiasPorSeccion = new Map<
                                number,
                                EmpleadoMateriaView[]
                              >();
                              for (const materia of item.materias) {
                                const list =
                                  materiasPorSeccion.get(materia.seccionId) ?? [];
                                list.push(materia);
                                materiasPorSeccion.set(materia.seccionId, list);
                              }

                              return item.secciones.map((seccion) => {
                                const materiasAsignadas =
                                  materiasPorSeccion.get(seccion.seccionId) ?? [];
                                const seccionNombre =
                                  getSeccionDisplayName(seccion.label);
                                const badgeKey = `seccion-${empleadoId}-${seccion.seccionId}`;
                                const contenidoMaterias = materiasAsignadas.length ? (
                                  <ul className="space-y-1 text-sm text-muted-foreground">
                                    {materiasAsignadas.map((materia) => (
                                      <li
                                        key={`materia-${badgeKey}-${materia.seccionMateriaId}`}
                                        className="flex items-start gap-2"
                                      >
                                        <GraduationCap className="mt-0.5 h-4 w-4 text-muted-foreground" />
                                        <span className="text-foreground">
                                          {materia.materiaNombre}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    Sin materias registradas.
                                  </p>
                                );

                                return (
                                  <Popover key={badgeKey}>
                                    <PopoverTrigger asChild>
                                      <Badge
                                        variant="secondary"
                                        className="flex cursor-pointer items-center gap-1"
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`Ver materias asignadas en ${seccionNombre}`}
                                      >
                                        <Users className="h-3 w-3" />
                                        <span>{seccionNombre}</span>
                                      </Badge>
                                    </PopoverTrigger>
                                    <PopoverContent
                                      align="start"
                                      sideOffset={4}
                                      className="w-64 space-y-2 p-3"
                                    >
                                      <div>
                                        <p className="text-sm font-semibold text-foreground">
                                          {seccionNombre || "Sección sin nombre"}
                                        </p>
                                        {seccion.nivel ? (
                                          <p className="text-xs text-muted-foreground">
                                            {formatNivel(seccion.nivel)}
                                          </p>
                                        ) : null}
                                      </div>
                                      <div className="space-y-1">
                                        <p className="text-xs font-medium uppercase text-muted-foreground">
                                          Materias asignadas
                                        </p>
                                        {contenidoMaterias}
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                );
                              });
                            })()}
                          </div>
                        )}
                      </CardHeader>
                      {isExpanded ? (
                        <CardContent className="space-y-4 text-sm">
                          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <div className="rounded-lg border bg-muted/40 p-4">
                              <div className="flex items-center gap-2 text-sm font-semibold">
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                Información laboral
                              </div>
                              <div className="mt-3 space-y-2 text-muted-foreground">
                                <div>
                                  <span className="font-medium text-foreground">
                                    Legajo:
                                  </span>{" "}
                                  {legajo}
                                </div>
                                <div>
                                  <span className="font-medium text-foreground">
                                    Condición:
                                  </span>{" "}
                                  {condicion}
                                </div>
                                <div>
                                  <span className="font-medium text-foreground">
                                    Situación:
                                  </span>{" "}
                                  {situacion}
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
                              <div className="mt-3 space-y-3 text-muted-foreground">
                                {fotoPerfilUrl ? (
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-16 w-16">
                                      <AvatarImage
                                        src={fotoPerfilUrl}
                                        alt={`Foto de ${fullName}`}
                                      />
                                      <AvatarFallback>
                                        {initials.length ? (
                                          initials
                                        ) : (
                                          <User className="h-5 w-5" />
                                        )}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-muted-foreground">
                                      Foto actual del legajo
                                    </span>
                                  </div>
                                ) : null}
                                <div className="space-y-2">
                                  <div>
                                    <span className="font-medium text-foreground">
                                      DNI:
                                    </span>{" "}
                                    {dni}
                                  </div>
                                  <div>
                                    <span className="font-medium text-foreground">
                                      CUIL:
                                    </span>{" "}
                                    {cuil}
                                  </div>
                                  <div>
                                    <span className="font-medium text-foreground">
                                      Nacimiento:
                                    </span>{" "}
                                    {fechaNacimiento || "Sin registrar"}
                                  </div>
                                  <div>
                                    <span className="font-medium text-foreground">
                                      Nacionalidad:
                                    </span>{" "}
                                    {nacionalidad}
                                  </div>
                                  <div>
                                    <span className="font-medium text-foreground">
                                      Estado civil:
                                    </span>{" "}
                                    {estadoCivil}
                                  </div>
                                  <div>
                                    <span className="font-medium text-foreground">
                                      Género:
                                    </span>{" "}
                                    {genero}
                                  </div>
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
                                  <span className="font-medium text-foreground">
                                    Total:
                                  </span>{" "}
                                  {item.licencias.length}
                                </div>
                                {licenciaActiva ? (
                                  <div>
                                    <span className="font-medium text-foreground">
                                      Estado actual:
                                    </span>{" "}
                                    {LICENCIA_SITUACION}{" "}
                                    {formatDate(licenciaActiva.fechaInicio) ? (
                                      <span className="text-xs text-muted-foreground">
                                        (desde{" "}
                                        {formatDate(licenciaActiva.fechaInicio)}
                                        {licenciaActiva.fechaFin
                                          ? ` hasta ${formatDate(licenciaActiva.fechaFin)}`
                                          : ""}
                                        )
                                      </span>
                                    ) : null}
                                  </div>
                                ) : null}
                                {ultimaLicencia ? (
                                  <div>
                                    <span className="font-medium text-foreground">
                                      Última:
                                    </span>{" "}
                                    {formatTipoLicencia(
                                      ultimaLicencia.tipoLicencia,
                                    )}{" "}
                                    •{" "}
                                    {formatDate(ultimaLicencia.fechaInicio) ||
                                      "Sin inicio"}
                                    {ultimaLicencia.fechaFin
                                      ? ` al ${formatDate(ultimaLicencia.fechaFin)}`
                                      : ""}
                                  </div>
                                ) : (
                                  <div>No hay licencias cargadas.</div>
                                )}
                              </div>
                            </div>
                            <AssignmentManager
                              empleadoId={
                                typeof item.empleado.id === "number"
                                  ? item.empleado.id
                                  : null
                              }
                              secciones={item.secciones}
                              materias={item.materias}
                              disabled={dataLoading || !canEditThis}
                            />
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
                                    <div
                                      key={`formacion-${empleadoId}-${formacion.id}`}
                                    >
                                      <div className="font-medium text-foreground">
                                        {formacion.tituloObtenido ??
                                          "Título sin nombre"}
                                      </div>
                                      <div>
                                        {formacion.institucion ??
                                          "Institución no informada"}
                                        {formacion.nivel
                                          ? ` • ${formacion.nivel}`
                                          : ""}
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
                            {(item.empleado.antecedentesLaborales ||
                              item.empleado.observacionesGenerales) && (
                              <div className="rounded-lg border bg-muted/40 p-4">
                                <div className="flex items-center gap-2 text-sm font-semibold">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  Notas y antecedentes
                                </div>
                                <div className="mt-3 space-y-3 text-muted-foreground">
                                  {item.empleado.antecedentesLaborales ? (
                                    <div>
                                      <div className="font-medium text-foreground">
                                        Antecedentes laborales
                                      </div>
                                      <div className="whitespace-pre-wrap">
                                        {item.empleado.antecedentesLaborales}
                                      </div>
                                    </div>
                                  ) : null}
                                  {item.empleado.observacionesGenerales ? (
                                    <div>
                                      <div className="font-medium text-foreground">
                                        Observaciones
                                      </div>
                                      <div className="whitespace-pre-wrap">
                                        {item.empleado.observacionesGenerales}
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="rounded-lg border bg-muted/40 p-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                              <div className="space-y-1 text-sm">
                                <div className="text-sm font-semibold text-foreground">
                                  Acceso al sistema
                                </div>
                                {persona?.credencialesActivas ? (
                                  <div className="space-y-1 text-muted-foreground">
                                    <div className="font-medium text-foreground">
                                      {persona.email ?? "Sin email"}
                                    </div>
                                    <div>
                                      Roles:{" "}
                                      {persona.roles && persona.roles.length > 0
                                        ? normalizeRoles(persona.roles)
                                            .map((role) => displayRole(role))
                                            .join(", ")
                                        : "Sin roles"}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-muted-foreground">
                                    El personal todavía no tiene credenciales
                                    asignadas.
                                  </div>
                                )}
                              </div>
                              {canManageAccess && personaId ? (
                                <Dialog
                                  open={isAccessDialogOpen}
                                  onOpenChange={(open) => {
                                    if (open) {
                                      handleOpenAccessDialog(
                                        persona,
                                        item.empleado,
                                      );
                                    } else {
                                      setAccessDialogOpen(false);
                                    }
                                  }}
                                >
                                  <DialogTrigger asChild>
                                    <Button
                                      type="button"
                                      size="sm"
                                      disabled={
                                        savingAccess && isAccessDialogOpen
                                      }
                                    >
                                      Gestionar acceso
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>
                                        {persona?.credencialesActivas
                                          ? "Actualizar acceso"
                                          : "Crear acceso"}
                                      </DialogTitle>
                                      <DialogDescription>
                                        Administrá el correo, la contraseña y
                                        los roles del personal.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input
                                          type="email"
                                          value={accessForm.email}
                                          onChange={(event) =>
                                            setAccessForm((prev) => ({
                                              ...prev,
                                              email: event.target.value,
                                            }))
                                          }
                                          disabled={savingAccess}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Contraseña</Label>
                                        <Input
                                          type="password"
                                          value={accessForm.password}
                                          placeholder={
                                            persona?.credencialesActivas
                                              ? "Ingresá una nueva contraseña"
                                              : "Contraseña inicial"
                                          }
                                          onChange={(event) =>
                                            setAccessForm((prev) => ({
                                              ...prev,
                                              password: event.target.value,
                                            }))
                                          }
                                          disabled={savingAccess}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Confirmar contraseña</Label>
                                        <Input
                                          type="password"
                                          value={accessForm.confirmPassword}
                                          onChange={(event) =>
                                            setAccessForm((prev) => ({
                                              ...prev,
                                              confirmPassword:
                                                event.target.value,
                                            }))
                                          }
                                          disabled={savingAccess}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label>Roles del sistema</Label>
                                        <div className="grid gap-2">
                                          {roleOptions.map((role) => {
                                            const checked =
                                              accessForm.roles.includes(role);
                                            return (
                                              <label
                                                key={`${personaId}-${role}`}
                                                className="flex items-center gap-2 text-sm text-muted-foreground"
                                              >
                                                <Checkbox
                                                  checked={checked}
                                                  onCheckedChange={(value) =>
                                                    setAccessForm((prev) => {
                                                      const isChecked =
                                                        value === true;
                                                      const nextRoles =
                                                        isChecked
                                                          ? [
                                                              ...prev.roles,
                                                              role,
                                                            ]
                                                          : prev.roles.filter(
                                                              (r) => r !== role,
                                                            );
                                                      return {
                                                        ...prev,
                                                        roles:
                                                          normalizeRoles(
                                                            nextRoles,
                                                          ),
                                                      };
                                                    })
                                                  }
                                                  disabled={savingAccess}
                                                />
                                                <span>{displayRole(role)}</span>
                                              </label>
                                            );
                                          })}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                          Seleccioná los permisos que tendrá el
                                          personal en la plataforma.
                                        </p>
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <DialogClose asChild>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          disabled={savingAccess}
                                          onClick={() =>
                                            setAccessDialogOpen(false)
                                          }
                                        >
                                          Cancelar
                                        </Button>
                                      </DialogClose>
                                      <Button
                                        type="button"
                                        onClick={handleSaveAccess}
                                        disabled={savingAccess}
                                      >
                                        {savingAccess && (
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        )}
                                        Guardar acceso
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              ) : null}
                            </div>
                          </div>
                        </CardContent>
                      ) : null}
                    </Card>
                  );
                })}
                {totalPages > 1 ? (
                  <div className="flex justify-center pt-2">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(event) => {
                              event.preventDefault();
                              if (currentPage > 1) {
                                handlePageChange(currentPage - 1);
                              }
                            }}
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                        {visiblePages.length > 0 && visiblePages[0] > 1 ? (
                          <>
                            <PaginationItem>
                              <PaginationLink
                                href="#"
                                onClick={(event) => {
                                  event.preventDefault();
                                  handlePageChange(1);
                                }}
                                isActive={currentPage === 1}
                              >
                                1
                              </PaginationLink>
                            </PaginationItem>
                            {visiblePages[0] > 2 ? (
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                            ) : null}
                          </>
                        ) : null}
                        {visiblePages.map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              onClick={(event) => {
                                event.preventDefault();
                                handlePageChange(page);
                              }}
                              isActive={page === currentPage}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        {visiblePages.length > 0 &&
                        visiblePages[visiblePages.length - 1] < totalPages ? (
                          <>
                            {visiblePages[visiblePages.length - 1] <
                            totalPages - 1 ? (
                              <PaginationItem>
                                <PaginationEllipsis />
                              </PaginationItem>
                            ) : null}
                            <PaginationItem>
                              <PaginationLink
                                href="#"
                                onClick={(event) => {
                                  event.preventDefault();
                                  handlePageChange(totalPages);
                                }}
                                isActive={currentPage === totalPages}
                              >
                                {totalPages}
                              </PaginationLink>
                            </PaginationItem>
                          </>
                        ) : null}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(event) => {
                              event.preventDefault();
                              if (currentPage < totalPages) {
                                handlePageChange(currentPage + 1);
                              }
                            }}
                            className={
                              currentPage === totalPages
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                ) : null}
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
                      empleadoSituacionVisible,
                      empleadoSituacionOriginal,
                      secciones,
                      materias,
                      empleadoId,
                    },
                    index,
                  ) => {
                    const licenseKey = licencia.id ?? `${empleadoId}-${index}`;
                    const fechaInicio =
                      formatDate(licencia.fechaInicio) || "Sin inicio";
                    const fechaFin = licencia.fechaFin
                      ? formatDate(licencia.fechaFin)
                      : "";
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
                                <Badge
                                  variant={
                                    licencia.justificada
                                      ? "secondary"
                                      : "destructive"
                                  }
                                >
                                  {licencia.justificada
                                    ? "Justificada"
                                    : "Sin justificar"}
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
                                  <span>
                                    {licencia.horasAusencia} hs de ausencia
                                  </span>
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                          <div className="flex items-start gap-2 text-foreground">
                            <FileText className="mt-0.5 h-4 w-4 text-muted-foreground" />
                            <span>
                              <span className="font-semibold">Motivo:</span>{" "}
                              {licencia.motivo || "Sin detallar"}
                            </span>
                          </div>
                          {licencia.observaciones ? (
                            <div className="whitespace-pre-wrap">
                              <span className="font-semibold text-foreground">
                                Observaciones:
                              </span>{" "}
                              {licencia.observaciones}
                            </div>
                          ) : null}
                          {secciones.length ? (
                            <div className="flex flex-wrap gap-2">
                              {secciones.map((seccion) => (
                                <Badge
                                  key={`licencia-${licenseKey}-seccion-${seccion.seccionId}`}
                                  variant="secondary"
                                  className="flex items-center gap-1"
                                >
                                  <Users className="h-3 w-3" />
                                  <span>
                                    {formatNivel(seccion.nivel)} •{" "}
                                    {seccion.label}
                                  </span>
                                </Badge>
                              ))}
                            </div>
                          ) : null}
                          {materias.length ? (
                            <div className="flex flex-wrap gap-2">
                              {materias.map((materia) => (
                                <Badge
                                  key={`licencia-${licenseKey}-materia-${materia.seccionMateriaId}`}
                                  variant="outline"
                                  className="flex items-center gap-1"
                                >
                                  <GraduationCap className="h-3 w-3" />
                                  <span>
                                    {materia.materiaNombre}
                                    {materia.seccionLabel
                                      ? ` • ${materia.seccionLabel}`
                                      : ""}
                                  </span>
                                </Badge>
                              ))}
                            </div>
                          ) : null}
                          {empleadoSituacionVisible ? (
                            <div>
                              <span className="font-semibold text-foreground">
                                Situación actual:
                              </span>{" "}
                              {empleadoSituacionVisible}
                              {empleadoSituacionOriginal &&
                              empleadoSituacionOriginal !==
                                empleadoSituacionVisible ? (
                                <span className="text-xs text-muted-foreground">
                                  {" "}
                                  (registrada como {empleadoSituacionOriginal})
                                </span>
                              ) : null}
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

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <form onSubmit={handleUpdatePersonal} className="space-y-6">
            <DialogHeader>
              <DialogTitle>Editar datos del personal</DialogTitle>
              <DialogDescription>
                Actualizá la información de{" "}
                {editingName || "la persona seleccionada"}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Datos personales
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Revisá y actualizá la información básica del legajo.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="editar-foto">Foto de perfil</Label>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                      <Avatar className="h-16 w-16">
                        {editPersona.fotoPerfilUrl.trim() ? (
                          <AvatarImage
                            src={editPersona.fotoPerfilUrl}
                            alt={`Foto de ${editingName || "la persona"}`}
                          />
                        ) : null}
                        <AvatarFallback>
                          {editPersonaInitials.length ? (
                            editPersonaInitials
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Input
                          id="editar-foto"
                          type="file"
                          accept={PHOTO_INPUT_ACCEPT}
                          onChange={handleEditPersonaPhotoFile}
                          disabled={editPersonaPhotoUploading}
                        />
                        {editPersonaPhotoUploading ? (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />{" "}
                            Subiendo foto…
                          </div>
                        ) : null}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <Input
                            id="editar-foto-url"
                            type="url"
                            placeholder="https://…"
                            value={editPersona.fotoPerfilUrl}
                            onChange={(event) => {
                              setEditPersonaPhotoError(null);
                              setEditPersona((prev) => ({
                                ...prev,
                                fotoPerfilUrl: event.target.value,
                              }));
                            }}
                            aria-invalid={
                              editPersonaPhotoError ? true : undefined
                            }
                          />
                          {editPersona.fotoPerfilUrl ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={clearEditPersonaPhoto}
                              disabled={editPersonaPhotoUploading}
                            >
                              Quitar foto
                            </Button>
                          ) : null}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Formatos permitidos: {ALLOWED_PHOTO_LABEL}. Tamaño
                          máximo {MAX_PHOTO_SIZE_MB} MB.
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Podés pegar una URL externa válida o subir una imagen
                          desde tu equipo.
                        </div>
                        {editPersonaPhotoError ? (
                          <p className="text-xs text-destructive">
                            {editPersonaPhotoError}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editar-nombre">Nombres</Label>
                    <Input
                      id="editar-nombre"
                      value={editPersona.nombre}
                      onChange={(event) =>
                        setEditPersona((prev) => ({
                          ...prev,
                          nombre: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editar-apellido">Apellidos</Label>
                    <Input
                      id="editar-apellido"
                      value={editPersona.apellido}
                      onChange={(event) =>
                        setEditPersona((prev) => ({
                          ...prev,
                          apellido: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editar-dni">DNI</Label>
                    <Input
                      id="editar-dni"
                      value={editPersona.dni}
                      onChange={(event) =>
                        setEditPersona((prev) => ({
                          ...prev,
                          dni: formatDni(event.target.value),
                        }))
                      }
                      inputMode="numeric"
                      pattern="\d*"
                      minLength={7}
                      maxLength={10}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editar-fecha-nac">
                      Fecha de nacimiento
                    </Label>
                    <Input
                      id="editar-fecha-nac"
                      type="date"
                      max={maxBirthDate}
                      value={editPersona.fechaNacimiento}
                      onChange={(event) =>
                        setEditPersona((prev) => ({
                          ...prev,
                          fechaNacimiento: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editar-genero">Género</Label>
                    <Select
                      value={editPersona.genero}
                      onValueChange={(value) =>
                        setEditPersona((prev) => ({ ...prev, genero: value }))
                      }
                    >
                      <SelectTrigger id="editar-genero" aria-required="true">
                        <SelectValue placeholder="Seleccioná el género" />
                      </SelectTrigger>
                      <SelectContent>
                        {generoSelectOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editar-estado-civil">Estado civil</Label>
                    <Select
                      value={editPersona.estadoCivil}
                      onValueChange={(value) =>
                        setEditPersona((prev) => ({
                          ...prev,
                          estadoCivil: value,
                        }))
                      }
                    >
                      <SelectTrigger
                        id="editar-estado-civil"
                        aria-required="true"
                      >
                        <SelectValue placeholder="Seleccioná el estado civil" />
                      </SelectTrigger>
                      <SelectContent>
                        {estadoCivilSelectOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editar-nacionalidad">Nacionalidad</Label>
                    <Input
                      id="editar-nacionalidad"
                      value={editPersona.nacionalidad}
                      onChange={(event) =>
                        setEditPersona((prev) => ({
                          ...prev,
                          nacionalidad: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Información de contacto
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Datos para comunicaciones institucionales y seguimiento.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="editar-domicilio">Domicilio</Label>
                    <Input
                      id="editar-domicilio"
                      value={editPersona.domicilio}
                      onChange={(event) =>
                        setEditPersona((prev) => ({
                          ...prev,
                          domicilio: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editar-telefono">Teléfono</Label>
                    <Input
                      id="editar-telefono"
                      type="tel"
                      value={editPersona.telefono}
                      onChange={(event) =>
                        setEditPersona((prev) => ({
                          ...prev,
                          telefono: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editar-celular">Celular</Label>
                    <Input
                      id="editar-celular"
                      type="tel"
                      value={editPersona.celular}
                      onChange={(event) =>
                        setEditPersona((prev) => ({
                          ...prev,
                          celular: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="editar-email">Correo electrónico</Label>
                    <Input
                      id="editar-email"
                      type="email"
                      value={editPersona.email}
                      onChange={(event) =>
                        setEditPersona((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Datos laborales
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Actualizá la asignación institucional y la situación del
                    personal.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="editar-rol">Rol institucional</Label>
                    <Select
                      value={editEmpleado.rolEmpleado}
                      onValueChange={(value) =>
                        setEditEmpleado((prev) => ({
                          ...prev,
                          rolEmpleado: value as RolEmpleado,
                        }))
                      }
                    >
                      <SelectTrigger id="editar-rol" aria-required="true">
                        <SelectValue placeholder="Seleccioná el rol" />
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
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="editar-cuil-prefijo">CUIL</Label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Input
                        id="editar-cuil-prefijo"
                        value={editEmpleadoCuilPrefix}
                        onChange={(event) =>
                          setEditEmpleadoCuilPrefix(
                            sanitizeDigits(event.target.value, 2),
                          )
                        }
                        inputMode="numeric"
                        pattern="\d{2}"
                        maxLength={2}
                        required
                        className="w-16"
                      />
                      <span className="text-muted-foreground">-</span>
                      <span
                        className="min-w-[120px] flex-1 rounded-md border border-input bg-muted/40 px-3 py-2 text-sm font-medium tabular-nums text-foreground shadow-sm"
                        aria-label="DNI del personal"
                        title={editPersona.dni || "Sin DNI"}
                      >
                        {editPersona.dni || "Sin DNI"}
                      </span>
                      <span className="text-muted-foreground">-</span>
                      <Input
                        id="editar-cuil-sufijo"
                        value={editEmpleadoCuilSuffix}
                        onChange={(event) =>
                          setEditEmpleadoCuilSuffix(
                            sanitizeDigits(event.target.value, 1),
                          )
                        }
                        inputMode="numeric"
                        pattern="\d"
                        maxLength={1}
                        required
                        className="w-14"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editar-legajo">Legajo institucional</Label>
                    <Input
                      id="editar-legajo"
                      value={editEmpleado.legajo}
                      onChange={(event) =>
                        setEditEmpleado((prev) => ({
                          ...prev,
                          legajo: sanitizeLegajoInput(event.target.value),
                        }))
                      }
                      maxLength={LEGAJO_MAX_LENGTH}
                      placeholder="Ej.: DOC-2025-01"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Solo letras mayúsculas, números y guiones.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editar-condicion">Condición laboral</Label>
                    <Select
                      value={editEmpleado.condicionLaboral}
                      onValueChange={(value) =>
                        setEditEmpleado((prev) => ({
                          ...prev,
                          condicionLaboral: value,
                        }))
                      }
                    >
                      <SelectTrigger id="editar-condicion" aria-required="true">
                        <SelectValue placeholder="Seleccioná la condición laboral" />
                      </SelectTrigger>
                      <SelectContent>
                        {condicionLaboralSelectOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editar-cargo">Cargo actual</Label>
                    <Select
                      value={editEmpleado.cargo}
                      onValueChange={(value) =>
                        setEditEmpleado((prev) => ({ ...prev, cargo: value }))
                      }
                    >
                      <SelectTrigger id="editar-cargo" aria-required="true">
                        <SelectValue placeholder="Seleccioná el cargo" />
                      </SelectTrigger>
                      <SelectContent>
                        {cargoSelectOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editar-situacion">Situación actual</Label>
                    <Select
                      value={editEmpleado.situacionActual ?? DEFAULT_SITUACION}
                      onValueChange={(value) =>
                        setEditEmpleado((prev) => ({
                          ...prev,
                          situacionActual: value,
                        }))
                      }
                    >
                      <SelectTrigger id="editar-situacion" aria-required="true">
                        <SelectValue placeholder="Seleccioná la situación" />
                      </SelectTrigger>
                      <SelectContent>
                        {situacionSelectOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editar-fecha-ingreso">
                      Fecha de ingreso
                    </Label>
                    <Input
                      id="editar-fecha-ingreso"
                      type="date"
                      value={editEmpleado.fechaIngreso}
                      onChange={(event) =>
                        setEditEmpleado((prev) => ({
                          ...prev,
                          fechaIngreso: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="editar-antecedentes">
                      Antecedentes laborales
                    </Label>
                    <Textarea
                      id="editar-antecedentes"
                      value={editEmpleado.antecedentesLaborales}
                      onChange={(event) =>
                        setEditEmpleado((prev) => ({
                          ...prev,
                          antecedentesLaborales: event.target.value,
                        }))
                      }
                      placeholder="Experiencia previa, instituciones en las que trabajó…"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="editar-observaciones">
                      Observaciones generales
                    </Label>
                    <Textarea
                      id="editar-observaciones"
                      value={editEmpleado.observacionesGenerales}
                      onChange={(event) =>
                        setEditEmpleado((prev) => ({
                          ...prev,
                          observacionesGenerales: event.target.value,
                        }))
                      }
                      placeholder="Notas internas o consideraciones relevantes"
                      rows={3}
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Asignaciones docentes
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Actualizá las secciones y materias que tiene a cargo.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <MultiSelectControl
                    label="Secciones asignadas"
                    placeholder="Seleccioná las secciones"
                    options={seccionMultiOptions}
                    selectedIds={editSeccionIds}
                    onChange={(ids) => {
                      if (ids.length > 2) {
                        toast.error(
                          "Podés asignar hasta dos secciones como titulares.",
                        );
                      }
                      setEditSeccionIds(ids.slice(0, 2));
                    }}
                    summaryEmptyText="Seleccioná las secciones correspondientes o dejalo vacío."
                  />
                  <MultiSelectControl
                    label="Materias asignadas"
                    placeholder="Seleccioná las materias"
                    options={materiaMultiOptions}
                    selectedIds={editMateriaIds}
                    onChange={(ids) => setEditMateriaIds(ids)}
                    badgeVariant="outline"
                    summaryEmptyText="Seleccioná las materias correspondientes o dejalo vacío."
                  />
                </div>
              </section>
            </div>

            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={savingEditPersonal}
                >
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={savingEditPersonal}>
                {savingEditPersonal ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando…
                  </>
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <form onSubmit={handleCreatePersonal} className="space-y-6">
            <DialogHeader>
              <DialogTitle>Alta de nuevo personal</DialogTitle>
              <DialogDescription>
                Completa la ficha para incorporar un nuevo integrante. Los
                campos marcados como obligatorios permiten garantizar la
                trazabilidad del legajo.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Datos personales
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Información básica de identificación del docente o
                    integrante.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="nuevo-foto">Foto de perfil</Label>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                      <Avatar className="h-16 w-16">
                        {newPersona.fotoPerfilUrl.trim() ? (
                          <AvatarImage
                            src={newPersona.fotoPerfilUrl}
                            alt={`Foto de ${newPersona.nombre || "la persona"}`}
                          />
                        ) : null}
                        <AvatarFallback>
                          {newPersonaInitials.length ? (
                            newPersonaInitials
                          ) : (
                            <User className="h-5 w-5" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <Input
                          id="nuevo-foto"
                          type="file"
                          accept={PHOTO_INPUT_ACCEPT}
                          onChange={handleNewPersonaPhotoFile}
                          disabled={newPersonaPhotoUploading}
                        />
                        {newPersonaPhotoUploading ? (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />{" "}
                            Subiendo foto…
                          </div>
                        ) : null}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <Input
                            id="nuevo-foto-url"
                            type="url"
                            placeholder="https://…"
                            value={newPersona.fotoPerfilUrl}
                            onChange={(event) => {
                              setNewPersonaPhotoError(null);
                              setNewPersona((prev) => ({
                                ...prev,
                                fotoPerfilUrl: event.target.value,
                              }));
                            }}
                            aria-invalid={
                              newPersonaPhotoError ? true : undefined
                            }
                          />
                          {newPersona.fotoPerfilUrl ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={clearNewPersonaPhoto}
                              disabled={newPersonaPhotoUploading}
                            >
                              Quitar foto
                            </Button>
                          ) : null}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Formatos permitidos: {ALLOWED_PHOTO_LABEL}. Tamaño
                          máximo {MAX_PHOTO_SIZE_MB} MB.
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Podés pegar una URL externa válida o subir una imagen
                          desde tu equipo.
                        </div>
                        {newPersonaPhotoError ? (
                          <p className="text-xs text-destructive">
                            {newPersonaPhotoError}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-nombre">Nombres</Label>
                    <Input
                      id="nuevo-nombre"
                      value={newPersona.nombre}
                      onChange={(event) =>
                        setNewPersona((prev) => ({
                          ...prev,
                          nombre: event.target.value,
                        }))
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
                        setNewPersona((prev) => ({
                          ...prev,
                          apellido: event.target.value,
                        }))
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
                        setNewPersona((prev) => ({
                          ...prev,
                          fechaNacimiento: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-genero">Género</Label>
                    <Select
                      value={newPersona.genero}
                      onValueChange={(value) =>
                        setNewPersona((prev) => ({ ...prev, genero: value }))
                      }
                    >
                      <SelectTrigger id="nuevo-genero" aria-required="true">
                        <SelectValue placeholder="Seleccioná el género" />
                      </SelectTrigger>
                      <SelectContent>
                        {generoSelectOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-estado-civil">Estado civil</Label>
                    <Select
                      value={newPersona.estadoCivil}
                      onValueChange={(value) =>
                        setNewPersona((prev) => ({
                          ...prev,
                          estadoCivil: value,
                        }))
                      }
                    >
                      <SelectTrigger
                        id="nuevo-estado-civil"
                        aria-required="true"
                      >
                        <SelectValue placeholder="Seleccioná el estado civil" />
                      </SelectTrigger>
                      <SelectContent>
                        {estadoCivilSelectOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-nacionalidad">Nacionalidad</Label>
                    <Input
                      id="nuevo-nacionalidad"
                      value={newPersona.nacionalidad}
                      onChange={(event) =>
                        setNewPersona((prev) => ({
                          ...prev,
                          nacionalidad: event.target.value,
                        }))
                      }
                      placeholder="Argentina, Uruguaya…"
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="nuevo-cuil-prefijo">CUIL</Label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Input
                        id="nuevo-cuil-prefijo"
                        value={newEmpleadoCuilPrefix}
                        onChange={(event) =>
                          setNewEmpleadoCuilPrefix(
                            sanitizeDigits(event.target.value, 2),
                          )
                        }
                        placeholder="20"
                        inputMode="numeric"
                        pattern="\d{2}"
                        maxLength={2}
                        required
                        className="w-16"
                      />
                      <span className="text-muted-foreground">-</span>
                      <span
                        className="min-w-[120px] flex-1 rounded-md border border-input bg-muted/40 px-3 py-2 text-sm font-medium tabular-nums text-foreground shadow-sm"
                        aria-label="DNI del nuevo personal"
                        title={newPersona.dni || "Sin DNI"}
                      >
                        {newPersona.dni || "Sin DNI"}
                      </span>
                      <span className="text-muted-foreground">-</span>
                      <Input
                        id="nuevo-cuil-sufijo"
                        value={newEmpleadoCuilSuffix}
                        onChange={(event) =>
                          setNewEmpleadoCuilSuffix(
                            sanitizeDigits(event.target.value, 1),
                          )
                        }
                        placeholder="3"
                        inputMode="numeric"
                        pattern="\d"
                        maxLength={1}
                        required
                        className="w-14"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-legajo">Legajo institucional</Label>
                    <Input
                      id="nuevo-legajo"
                      value={newEmpleado.legajo}
                      onChange={(event) =>
                        setNewEmpleado((prev) => ({
                          ...prev,
                          legajo: sanitizeLegajoInput(event.target.value),
                        }))
                      }
                      maxLength={LEGAJO_MAX_LENGTH}
                      placeholder="Ej.: DOC-2025-01"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Solo letras mayúsculas, números y guiones.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Información de contacto
                  </h3>
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
                        setNewPersona((prev) => ({
                          ...prev,
                          domicilio: event.target.value,
                        }))
                      }
                      placeholder="Calle, número, localidad"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-telefono">Teléfono</Label>
                    <Input
                      id="nuevo-telefono"
                      type="tel"
                      value={newPersona.telefono}
                      onChange={(event) =>
                        setNewPersona((prev) => ({
                          ...prev,
                          telefono: event.target.value,
                        }))
                      }
                      placeholder="Teléfono fijo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-celular">Celular</Label>
                    <Input
                      id="nuevo-celular"
                      type="tel"
                      value={newPersona.celular}
                      onChange={(event) =>
                        setNewPersona((prev) => ({
                          ...prev,
                          celular: event.target.value,
                        }))
                      }
                      placeholder="Número de contacto"
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="nuevo-email">Correo electrónico</Label>
                    <Input
                      id="nuevo-email"
                      type="email"
                      value={newPersona.email}
                      onChange={(event) =>
                        setNewPersona((prev) => ({
                          ...prev,
                          email: event.target.value,
                        }))
                      }
                      placeholder="nombre@institucion.edu.ar"
                      required
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Datos laborales
                  </h3>
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
                        setNewEmpleado((prev) => ({
                          ...prev,
                          rolEmpleado: value as RolEmpleado,
                        }))
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
                    <Select
                      value={newEmpleado.condicionLaboral}
                      onValueChange={(value) =>
                        setNewEmpleado((prev) => ({
                          ...prev,
                          condicionLaboral: value,
                        }))
                      }
                    >
                      <SelectTrigger id="nuevo-condicion" aria-required="true">
                        <SelectValue placeholder="Seleccioná la condición laboral" />
                      </SelectTrigger>
                      <SelectContent>
                        {condicionLaboralSelectOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-cargo">Cargo actual</Label>
                    <Select
                      value={newEmpleado.cargo}
                      onValueChange={(value) =>
                        setNewEmpleado((prev) => ({ ...prev, cargo: value }))
                      }
                    >
                      <SelectTrigger id="nuevo-cargo" aria-required="true">
                        <SelectValue placeholder="Seleccioná el cargo" />
                      </SelectTrigger>
                      <SelectContent>
                        {cargoSelectOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-situacion">Situación actual</Label>
                    <Input
                      id="nuevo-situacion"
                      value={DEFAULT_SITUACION}
                      readOnly
                      disabled
                      className="bg-muted/40"
                    />
                    <p className="text-xs text-muted-foreground">
                      Al registrar un nuevo personal se inicia con estado
                      "Activo".
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-fecha-ingreso">
                      Fecha de ingreso
                    </Label>
                    <Input
                      id="nuevo-fecha-ingreso"
                      type="date"
                      value={newEmpleado.fechaIngreso}
                      onChange={(event) =>
                        setNewEmpleado((prev) => ({
                          ...prev,
                          fechaIngreso: event.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="nuevo-antecedentes">
                      Antecedentes laborales
                    </Label>
                    <Textarea
                      id="nuevo-antecedentes"
                      value={newEmpleado.antecedentesLaborales}
                      onChange={(event) =>
                        setNewEmpleado((prev) => ({
                          ...prev,
                          antecedentesLaborales: event.target.value,
                        }))
                      }
                      placeholder="Experiencia previa, instituciones en las que trabajó…"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="nuevo-observaciones">
                      Observaciones generales
                    </Label>
                    <Textarea
                      id="nuevo-observaciones"
                      value={newEmpleado.observacionesGenerales}
                      onChange={(event) =>
                        setNewEmpleado((prev) => ({
                          ...prev,
                          observacionesGenerales: event.target.value,
                        }))
                      }
                      placeholder="Notas internas, requerimientos o documentación adicional"
                      rows={3}
                    />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Asignaciones docentes
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Definí las secciones y materias a cargo del nuevo
                    integrante. Podés dejarlo vacío si aún no tiene
                    asignaciones.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <MultiSelectControl
                    label="Secciones asignadas"
                    placeholder="Seleccioná las secciones"
                    options={seccionMultiOptions}
                    selectedIds={newSeccionIds}
                    onChange={(ids) => {
                      if (ids.length > 2) {
                        toast.error(
                          "Podés asignar hasta dos secciones como titulares.",
                        );
                      }
                      setNewSeccionIds(ids.slice(0, 2));
                    }}
                    summaryEmptyText="Seleccioná las secciones correspondientes o dejalo vacío."
                  />
                  <MultiSelectControl
                    label="Materias asignadas"
                    placeholder="Seleccioná las materias"
                    options={materiaMultiOptions}
                    selectedIds={newMateriaIds}
                    onChange={(ids) => setNewMateriaIds(ids)}
                    badgeVariant="outline"
                    summaryEmptyText="Seleccioná las materias correspondientes o dejalo vacío."
                  />
                </div>
              </section>

              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Formación académica
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Registra la titulación principal y otras certificaciones
                    relevantes.
                  </p>
                </div>
                <div className="space-y-4">
                  {newFormaciones.map((formacion, index) => {
                    const nivelId = `nuevo-formacion-${index}-nivel`;
                    const tituloId = `nuevo-formacion-${index}-titulo`;
                    const institucionId = `nuevo-formacion-${index}-institucion`;
                    const inicioId = `nuevo-formacion-${index}-inicio`;
                    const finId = `nuevo-formacion-${index}-fin`;
                    return (
                      <div
                        key={`nueva-formacion-${index}`}
                        className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-4"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <h4 className="text-sm font-semibold text-foreground">
                            Formación {index + 1}
                          </h4>
                          {newFormaciones.length > 1 ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => removeNewFormacionEntry(index)}
                              className="h-8 px-2 text-sm"
                            >
                              <Trash2 className="mr-1.5 h-4 w-4" />
                              Quitar
                            </Button>
                          ) : null}
                        </div>
                        <div className="mt-3 grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={nivelId}>Nivel</Label>
                            <Input
                              id={nivelId}
                              value={formacion.nivel}
                              onChange={(event) =>
                                updateNewFormacionEntry(index, {
                                  nivel: event.target.value,
                                })
                              }
                              placeholder="Terciario, Universitario, Posgrado…"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={tituloId}>Título principal</Label>
                            <Input
                              id={tituloId}
                              value={formacion.tituloObtenido}
                              onChange={(event) =>
                                updateNewFormacionEntry(index, {
                                  tituloObtenido: event.target.value,
                                })
                              }
                              placeholder="Profesor/a en…"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={institucionId}>Institución</Label>
                            <Input
                              id={institucionId}
                              value={formacion.institucion}
                              onChange={(event) =>
                                updateNewFormacionEntry(index, {
                                  institucion: event.target.value,
                                })
                              }
                              placeholder="Nombre de la institución"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={inicioId}>Fecha de inicio</Label>
                            <Input
                              id={inicioId}
                              type="date"
                              value={formacion.fechaInicio}
                              onChange={(event) => {
                                const value = event.target.value;
                                updateNewFormacionEntry(index, {
                                  fechaInicio: value,
                                  fechaFin:
                                    formacion.fechaFin &&
                                    formacion.fechaFin < value
                                      ? value
                                      : formacion.fechaFin,
                                });
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={finId}>Fecha de finalización</Label>
                            <Input
                              id={finId}
                              type="date"
                              value={formacion.fechaFin}
                              onChange={(event) => {
                                const value = event.target.value;
                                if (
                                  value &&
                                  formacion.fechaInicio &&
                                  value < formacion.fechaInicio
                                ) {
                                  updateNewFormacionEntry(index, {
                                    fechaFin: formacion.fechaInicio,
                                  });
                                  return;
                                }
                                updateNewFormacionEntry(index, {
                                  fechaFin: value,
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addNewFormacionEntry}
                      className="w-full sm:w-auto"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Agregar otra formación
                    </Button>
                    <p className="text-xs text-muted-foreground sm:text-right">
                      Podés registrar varias formaciones. Las que dejes vacías
                      no se guardarán.
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-otros-titulos">Otros títulos</Label>
                    <Textarea
                      id="nuevo-otros-titulos"
                      value={formacionNotas.otrosTitulos}
                      onChange={(event) =>
                        setFormacionNotas((prev) => ({
                          ...prev,
                          otrosTitulos: event.target.value,
                        }))
                      }
                      placeholder="Especializaciones o formaciones complementarias"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nuevo-especializaciones">
                      Especializaciones
                    </Label>
                    <Textarea
                      id="nuevo-especializaciones"
                      value={formacionNotas.especializaciones}
                      onChange={(event) =>
                        setFormacionNotas((prev) => ({
                          ...prev,
                          especializaciones: event.target.value,
                        }))
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
                        setFormacionNotas((prev) => ({
                          ...prev,
                          cursos: event.target.value,
                        }))
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
                <Button
                  type="button"
                  variant="outline"
                  disabled={creatingPersonal}
                >
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
                Registra las fechas y el motivo de la licencia para mantener
                actualizado el legajo.
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
                <Label htmlFor="licencia-justificada">
                  ¿La licencia está justificada?
                </Label>
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
                      setNewLicense((prev) => ({
                        ...prev,
                        motivo: event.target.value,
                      }))
                    }
                    placeholder="Describe el motivo de la licencia"
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licencia-horas">
                    Horas de ausencia (opcional)
                  </Label>
                  <Input
                    id="licencia-horas"
                    type="number"
                    min="0"
                    value={newLicense.horasAusencia}
                    onChange={(event) =>
                      setNewLicense((prev) => ({
                        ...prev,
                        horasAusencia: event.target.value,
                      }))
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
                    setNewLicense((prev) => ({
                      ...prev,
                      observaciones: event.target.value,
                    }))
                  }
                  placeholder="Detalles adicionales o documentación presentada"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={creatingLicense}
                >
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
