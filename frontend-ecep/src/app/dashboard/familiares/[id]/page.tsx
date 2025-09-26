"use client";

import { useEffect, useMemo, useState } from "react";
import LoadingState from "@/components/common/LoadingState";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { formatDni } from "@/lib/form-utils";
import { useAuth } from "@/hooks/useAuth";
import { displayRole, normalizeRoles } from "@/lib/auth-roles";
import { identidad } from "@/services/api/modules";
import type {
  AlumnoFamiliarDTO,
  AlumnoLiteDTO,
  FamiliarDTO,
  PersonaDTO,
  PersonaUpdateDTO,
} from "@/types/api-generated";
import { RolVinculo, UserRole } from "@/types/api-generated";

type CredentialsFormState = {
  email: string;
  password: string;
  confirmPassword: string;
  roles: UserRole[];
};

export default function FamiliarPerfilPage() {
  const { id } = useParams<{ id: string }>();
  const familiarId = Number(id);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [familiar, setFamiliar] = useState<FamiliarDTO | null>(null);
  const [persona, setPersona] = useState<PersonaDTO | null>(null);
  const [alumnos, setAlumnos] = useState<AlumnoLiteDTO[]>([]);
  const [links, setLinks] = useState<AlumnoFamiliarDTO[]>([]);

  const { hasRole } = useAuth();
  const canEditRoles = hasRole(UserRole.ADMIN) || hasRole(UserRole.DIRECTOR);

  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false);
  const [credentialsForm, setCredentialsForm] = useState<CredentialsFormState>({
    email: "",
    password: "",
    confirmPassword: "",
    roles: [],
  });
  const [savingCredentials, setSavingCredentials] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [personaDraft, setPersonaDraft] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    telefono: "",
    celular: "",
    observaciones: "",
  });
  const [ocupacion, setOcupacion] = useState<string>("");

  const [reloadKey, setReloadKey] = useState(0);

  const linkByAlumnoId = useMemo(() => {
    const map = new Map<number, AlumnoFamiliarDTO>();
    links.forEach((link) => map.set(link.alumnoId ?? 0, link));
    return map;
  }, [links]);

  const familyRoleOptions = useMemo(() => {
    const base = [UserRole.FAMILY, UserRole.STUDENT];
    const current = persona?.roles ?? [];
    return normalizeRoles([...base, ...current]);
  }, [persona?.roles]);

  const formatRol = (value?: string | null) => {
    if (!value) return "Sin vínculo";
    const formatted = value.replace(/_/g, " ").toLowerCase();
    return formatted.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  useEffect(() => {
    if (!familiarId || Number.isNaN(familiarId)) return;
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const familiarRes = await identidad.familiares.byId(familiarId);
        const familiarData = familiarRes.data ?? null;
        if (!alive) return;
        setFamiliar(familiarData);

        let personaData: PersonaDTO | null = null;
        if (familiarData?.personaId) {
          try {
            personaData = (
              await identidad.personasCore.getById(familiarData.personaId)
            ).data ?? null;
          } catch (error) {
            console.error("No se pudo obtener la persona del familiar", error);
          }
          if (!personaData) {
            const fallbackPersona: PersonaDTO = { id: familiarData.personaId };
            personaData = fallbackPersona;
          }
        }
        if (!alive) return;
        setPersona(personaData);
        setOcupacion((familiarData as any)?.ocupacion ?? "");

        let linksData: AlumnoFamiliarDTO[] = [];
        try {
          const { data } = await identidad.alumnoFamiliares.list();
          linksData = ((data ?? []) as any[]).filter(
            (link: any) => link.familiarId === familiarId,
          ) as AlumnoFamiliarDTO[];
        } catch (linksError) {
          console.error(
            "No se pudieron obtener los vínculos del familiar",
            linksError,
          );
        }
        if (!alive) return;
        setLinks(linksData);

        let alumnosData: AlumnoLiteDTO[] = [];
        try {
          const { data } = await identidad.familiaresAlumnos.byFamiliarId(familiarId);
          alumnosData = (data ?? []) as AlumnoLiteDTO[];
        } catch (alumnosError) {
          console.error(
            "No se pudieron obtener los alumnos vinculados",
            alumnosError,
          );
        }
        if (!alive) return;
        setAlumnos(alumnosData);

      } catch (fetchError: any) {
        if (!alive) return;
        console.error(fetchError);
        setError(fetchError?.message ?? "No pudimos cargar la información del familiar");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [familiarId, reloadKey]);

  useEffect(() => {
    if (!credentialsDialogOpen) return;
    const fallbackRoles =
      persona?.roles && persona.roles.length > 0
        ? normalizeRoles(persona.roles)
        : [UserRole.FAMILY];
    setCredentialsForm({
      email: persona?.email ?? "",
      password: "",
      confirmPassword: "",
      roles: normalizeRoles(fallbackRoles),
    });
  }, [credentialsDialogOpen, persona]);

  useEffect(() => {
    if (!editOpen) return;
    setPersonaDraft({
      nombre: persona?.nombre ?? "",
      apellido: persona?.apellido ?? "",
      dni: formatDni(persona?.dni ?? ""),
      email: persona?.email ?? "",
      telefono: persona?.telefono ?? "",
      celular: persona?.celular ?? "",
      observaciones: (persona as any)?.observacionesGenerales ?? "",
    });
    setOcupacion((familiar as any)?.ocupacion ?? "");
  }, [editOpen, persona, familiar]);

  const handleSaveProfile = async () => {
    if (!persona?.id || !familiar?.id) {
      toast.error("No encontramos los datos del familiar para editar");
      return;
    }

    if (!personaDraft.nombre.trim() || !personaDraft.apellido.trim()) {
      toast.error("Completá nombre y apellido");
      return;
    }

    const dniValue = formatDni(personaDraft.dni);
    if (!dniValue || dniValue.length < 7 || dniValue.length > 10) {
      toast.error("Ingresá un DNI válido (7 a 10 dígitos).");
      return;
    }

    setSavingProfile(true);
    try {
      await identidad.personasCore.update(persona.id, {
        nombre: personaDraft.nombre.trim(),
        apellido: personaDraft.apellido.trim(),
        dni: dniValue,
        email: personaDraft.email.trim() || undefined,
        telefono: personaDraft.telefono.trim() || undefined,
        celular: personaDraft.celular.trim() || undefined,
        observacionesGenerales: personaDraft.observaciones?.trim() || undefined,
      });

      await identidad.familiares.update(familiar.id, {
        id: familiar.id,
        personaId: persona.id,
        ocupacion: ocupacion.trim() || undefined,
      } as any);

      toast.success("Datos del familiar actualizados");
      setEditOpen(false);
      setReloadKey((value) => value + 1);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "No pudimos actualizar los datos del familiar",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveCredentials = async () => {
    if (!persona?.id) {
      toast.error("No encontramos la persona vinculada");
      return;
    }

    const email = credentialsForm.email.trim();
    const password = credentialsForm.password.trim();
    const confirmPassword = credentialsForm.confirmPassword.trim();

    if (!email) {
      toast.error("Ingresá un email válido");
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

    const baseRoles = canEditRoles
      ? credentialsForm.roles
      : persona.roles && persona.roles.length > 0
        ? persona.roles
        : [UserRole.FAMILY];

    const normalizedSelected = normalizeRoles(baseRoles);

    if (!normalizedSelected.length) {
      toast.error("Seleccioná al menos un rol para el acceso");
      return;
    }

    const payload: Partial<PersonaUpdateDTO> = {
      email,
      roles: normalizedSelected,
    };

    if (password) {
      payload.password = password;
    }

    setSavingCredentials(true);
    try {
      await identidad.personasCore.update(persona.id, payload);
      const { data: refreshed } = await identidad.personasCore.getById(persona.id);
      setPersona(refreshed ?? null);
      toast.success("Acceso del familiar actualizado");
      setCredentialsDialogOpen(false);
      setCredentialsForm({
        email,
        password: "",
        confirmPassword: "",
        roles: normalizeRoles(
          refreshed?.roles && refreshed.roles.length > 0
            ? refreshed.roles
            : normalizedSelected,
        ),
      });
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "No pudimos actualizar el acceso del familiar",
      );
    } finally {
      setSavingCredentials(false);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
        <Button variant="outline" onClick={() => router.back()}>
          Volver
        </Button>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Perfil del Familiar</h2>
            <p className="text-muted-foreground">ID: {familiarId}</p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button variant="default">Editar datos</Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Editar datos del familiar</DialogTitle>
                  <DialogDescription>Actualizá la información de contacto y otros detalles relevantes.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input
                      value={personaDraft.nombre}
                      onChange={(e) =>
                        setPersonaDraft((prev) => ({
                          ...prev,
                          nombre: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Apellido</Label>
                    <Input
                      value={personaDraft.apellido}
                      onChange={(e) =>
                        setPersonaDraft((prev) => ({
                          ...prev,
                          apellido: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>DNI</Label>
                    <Input
                      value={personaDraft.dni}
                      onChange={(e) =>
                        setPersonaDraft((prev) => ({
                          ...prev,
                          dni: formatDni(e.target.value),
                        }))
                      }
                      inputMode="numeric"
                      pattern="\d*"
                      minLength={7}
                      maxLength={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={personaDraft.email}
                      onChange={(e) =>
                        setPersonaDraft((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input
                      value={personaDraft.telefono}
                      onChange={(e) =>
                        setPersonaDraft((prev) => ({
                          ...prev,
                          telefono: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Celular</Label>
                    <Input
                      value={personaDraft.celular}
                      onChange={(e) =>
                        setPersonaDraft((prev) => ({
                          ...prev,
                          celular: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Ocupación</Label>
                    <Input value={ocupacion} onChange={(e) => setOcupacion(e.target.value)} />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Observaciones</Label>
                    <Textarea
                      rows={3}
                      value={personaDraft.observaciones}
                      onChange={(e) =>
                        setPersonaDraft((prev) => ({
                          ...prev,
                          observaciones: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setEditOpen(false)}
                    disabled={savingProfile}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveProfile} disabled={savingProfile}>
                    {savingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar cambios
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading && <LoadingState label="Cargando información del familiar…" />}
        {error && <div className="text-sm text-red-600">{error}</div>}

        {!loading && !error && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Datos personales</CardTitle>
                <CardDescription>Información de la persona asociada</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Nombre completo: </span>
                  <span className="font-medium">
                    {persona ? `${persona.apellido ?? ""}, ${persona.nombre ?? ""}`.replace(/^, /, "") : "—"}
                  </span>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground">DNI: </span>
                    <span className="font-medium">{persona?.dni ?? "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email: </span>
                    <span className="font-medium">{persona?.email ?? "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Teléfono: </span>
                    <span className="font-medium">{persona?.telefono ?? "—"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Celular: </span>
                    <span className="font-medium">{persona?.celular ?? "—"}</span>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Observaciones: </span>
                  <span className="font-medium">
                    {(persona as any)?.observacionesGenerales ?? "—"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Información familiar</CardTitle>
                <CardDescription>Datos adicionales del familiar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Ocupación: </span>
                  <span className="font-medium">{ocupacion || "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Alumno(s) vinculados: </span>
                  <span className="font-medium">{alumnos.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle>Alumnos vinculados</CardTitle>
                <CardDescription>Relaciones activas de este familiar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {alumnos.length ? (
                  alumnos.map((alumnoLite) => {
                    const link = linkByAlumnoId.get(alumnoLite.alumnoId);
                    return (
                      <div
                        key={`${alumnoLite.alumnoId}-${alumnoLite.matriculaId}`}
                        className="rounded-md border p-3 text-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="font-medium">{alumnoLite.nombreCompleto}</div>
                            <div className="text-muted-foreground">
                              {alumnoLite.seccionNombre ?? "Sin sección"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {link?.rolVinculo && (
                              <Badge variant="outline">{formatRol(link.rolVinculo)}</Badge>
                            )}
                            <Button
                              variant="secondary"
                              onClick={() => router.push(`/dashboard/alumnos/${alumnoLite.alumnoId}`)}
                            >
                              Ver alumno
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No hay alumnos asociados a este familiar.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle>Acceso al sistema</CardTitle>
                <CardDescription>
                  Gestioná las credenciales para que el familiar pueda iniciar sesión.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-2 text-sm md:flex-row md:items-center md:justify-between">
                  <div>
                    {persona?.credencialesActivas ? (
                      <>
                        <div className="font-medium">{persona.email ?? "Sin email"}</div>
                        <div className="text-muted-foreground">
                          Roles:{" "}
                          {persona?.roles && persona.roles.length > 0
                            ? normalizeRoles(persona.roles)
                                .map((role) => displayRole(role))
                                .join(", ")
                            : "Sin roles"}
                        </div>
                      </>
                    ) : (
                      <div className="text-muted-foreground">
                        El familiar todavía no tiene credenciales asignadas.
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog
                      open={credentialsDialogOpen}
                      onOpenChange={setCredentialsDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button>
                          {persona?.credencialesActivas
                            ? "Actualizar acceso"
                            : "Crear acceso"}
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
                            El email será el usuario de inicio de sesión. Para cambiar la contraseña ingresá y confirmá el nuevo valor.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                              type="email"
                              value={credentialsForm.email}
                              onChange={(e) =>
                                setCredentialsForm((prev) => ({
                                  ...prev,
                                  email: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Contraseña</Label>
                            <Input
                              type="password"
                              value={credentialsForm.password}
                              placeholder={
                                persona?.credencialesActivas
                                  ? "Ingresá una nueva contraseña"
                                  : "Contraseña inicial"
                              }
                              onChange={(e) =>
                                setCredentialsForm((prev) => ({
                                  ...prev,
                                  password: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Confirmar contraseña</Label>
                            <Input
                              type="password"
                              value={credentialsForm.confirmPassword}
                              onChange={(e) =>
                                setCredentialsForm((prev) => ({
                                  ...prev,
                                  confirmPassword: e.target.value,
                                }))
                              }
                            />
                          </div>
                          {canEditRoles ? (
                            <div className="space-y-2">
                              <Label>Roles del sistema</Label>
                              <div className="grid gap-2">
                                {familyRoleOptions.map((role) => {
                                  const checked = credentialsForm.roles.includes(role);
                                  return (
                                    <label
                                      key={role}
                                      className="flex items-center gap-2 text-sm text-muted-foreground"
                                    >
                                      <Checkbox
                                        checked={checked}
                                        onCheckedChange={(value) =>
                                          setCredentialsForm((prev) => {
                                            const isChecked = value === true;
                                            const nextRoles = isChecked
                                              ? [...prev.roles, role]
                                              : prev.roles.filter((r) => r !== role);
                                            return {
                                              ...prev,
                                              roles: normalizeRoles(nextRoles),
                                            };
                                          })
                                        }
                                      />
                                      <span>{displayRole(role)}</span>
                                    </label>
                                  );
                                })}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Definí qué permisos tendrá la familia en el sistema.
                              </p>
                            </div>
                          ) : null}
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setCredentialsDialogOpen(false)}
                            disabled={savingCredentials}
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleSaveCredentials}
                            disabled={savingCredentials}
                          >
                            {savingCredentials && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Guardar acceso
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    
  );
}
