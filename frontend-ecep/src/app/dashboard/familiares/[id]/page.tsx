"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/app/dashboard/dashboard-layout";
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
import { api } from "@/services/api";
import type {
  AlumnoFamiliarDTO,
  AlumnoLiteDTO,
  FamiliarDTO,
  PersonaDTO,
  UsuarioDTO,
} from "@/types/api-generated";
import { RolVinculo, UserRole } from "@/types/api-generated";

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

  const [usuarioActual, setUsuarioActual] = useState<UsuarioDTO | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [usuarioForm, setUsuarioForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [savingUser, setSavingUser] = useState(false);

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

        const familiarRes = await api.familiares.byId(familiarId);
        const familiarData = familiarRes.data ?? null;
        if (!alive) return;
        setFamiliar(familiarData);

        let personaData: PersonaDTO | null = null;
        if (familiarData?.personaId) {
          try {
            personaData = (
              await api.personasCore.getById(familiarData.personaId)
            ).data ?? null;
          } catch (error) {
            console.error(error);
            personaData = null;
          }
        }
        if (!alive) return;
        setPersona(personaData);
        setOcupacion((familiarData as any)?.ocupacion ?? "");

        const linksData = ((await api.alumnoFamiliares.list()).data ?? []).filter(
          (link: any) => link.familiarId === familiarId,
        );
        if (!alive) return;
        setLinks(linksData as AlumnoFamiliarDTO[]);

        const alumnosData = (
          await api.familiaresAlumnos.byFamiliarId(familiarId)
        ).data ?? [];
        if (!alive) return;
        setAlumnos(alumnosData as AlumnoLiteDTO[]);

        const personaUsuarioId =
          (personaData as any)?.usuarioId != null
            ? Number((personaData as any).usuarioId)
            : null;
        if (personaUsuarioId) {
          try {
            const { data: userData } = await api.user.getById(personaUsuarioId);
            if (!alive) return;
            setUsuarioActual(userData ?? null);
          } catch (error) {
            console.error(error);
            if (!alive) return;
            setUsuarioActual(null);
          }
        } else {
          setUsuarioActual(null);
        }
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
    if (!linkDialogOpen) return;
    setUsuarioForm({
      email: usuarioActual?.email ?? persona?.email ?? "",
      password: "",
      confirmPassword: "",
    });
  }, [linkDialogOpen, usuarioActual, persona]);

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
      await api.personasCore.update(persona.id, {
        nombre: personaDraft.nombre.trim(),
        apellido: personaDraft.apellido.trim(),
        dni: dniValue,
        email: personaDraft.email.trim() || undefined,
        telefono: personaDraft.telefono.trim() || undefined,
        celular: personaDraft.celular.trim() || undefined,
        observacionesGenerales: personaDraft.observaciones?.trim() || undefined,
      });

      await api.familiares.update(familiar.id, {
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

  const handleSaveUserAccess = async () => {
    if (!persona?.id) {
      toast.error("No encontramos la persona vinculada");
      return;
    }

    if (!usuarioForm.email.trim()) {
      toast.error("Ingresá un email válido");
      return;
    }

    if (!usuarioActual && !usuarioForm.password.trim()) {
      toast.error("Definí una contraseña inicial");
      return;
    }

    if (usuarioForm.password !== usuarioForm.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setSavingUser(true);
    try {
      const email = usuarioForm.email.trim();
      const password = usuarioForm.password.trim();
      let userId = usuarioActual?.id ?? null;

      if (usuarioActual) {
        if (!password) {
          toast.error("Ingresá una nueva contraseña para actualizar el acceso");
          setSavingUser(false);
          return;
        }

        await api.user.update(usuarioActual.id, {
          id: usuarioActual.id,
          email,
          password,
          userRoles:
            usuarioActual.userRoles && usuarioActual.userRoles.length > 0
              ? usuarioActual.userRoles
              : [UserRole.FAMILY],
        } as UsuarioDTO);
        userId = usuarioActual.id;
      } else {
        const { data: createdId } = await api.user.create({
          email,
          password,
          userRoles: [UserRole.FAMILY],
        } as UsuarioDTO);
        userId = Number(createdId);
        await api.personasCore.linkUsuario(persona.id, userId);
      }

      if (userId != null) {
        const { data: refreshed } = await api.user.getById(userId);
        setUsuarioActual(refreshed ?? null);
      }

      toast.success("Acceso del familiar actualizado");
      setLinkDialogOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "No pudimos actualizar el acceso del familiar",
      );
    } finally {
      setSavingUser(false);
    }
  };

  const handleUnlinkUser = async () => {
    if (!persona?.id || !usuarioActual?.id) return;
    setSavingUser(true);
    try {
      await api.personasCore.unlinkUsuario(persona.id);
      setUsuarioActual(null);
      toast.success("Acceso desvinculado correctamente");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "No pudimos desvincular al usuario",
      );
    } finally {
      setSavingUser(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
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
            <Button variant="outline" onClick={() => router.back()}>
              Volver
            </Button>
          </div>
        </div>

        {loading && <div className="text-sm">Cargando…</div>}
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
                            {link?.esTutorLegal && (
                              <Badge variant="default">Tutor legal</Badge>
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
                    {usuarioActual ? (
                      <>
                        <div className="font-medium">{usuarioActual.email}</div>
                        <div className="text-muted-foreground">
                          Roles: {usuarioActual.userRoles?.join(", ") ?? "Sin roles"}
                        </div>
                      </>
                    ) : (
                      <div className="text-muted-foreground">
                        El familiar todavía no tiene credenciales asignadas.
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          {usuarioActual ? "Actualizar acceso" : "Crear acceso"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>
                            {usuarioActual ? "Actualizar acceso" : "Crear acceso"}
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
                              value={usuarioForm.email}
                              onChange={(e) =>
                                setUsuarioForm((prev) => ({
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
                              value={usuarioForm.password}
                              placeholder={
                                usuarioActual
                                  ? "Ingresá una nueva contraseña"
                                  : "Contraseña inicial"
                              }
                              onChange={(e) =>
                                setUsuarioForm((prev) => ({
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
                              value={usuarioForm.confirmPassword}
                              onChange={(e) =>
                                setUsuarioForm((prev) => ({
                                  ...prev,
                                  confirmPassword: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setLinkDialogOpen(false)}
                            disabled={savingUser}
                          >
                            Cancelar
                          </Button>
                          <Button onClick={handleSaveUserAccess} disabled={savingUser}>
                            {savingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Guardar acceso
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    {usuarioActual && (
                      <Button
                        variant="destructive"
                        onClick={handleUnlinkUser}
                        disabled={savingUser}
                      >
                        {savingUser ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Desvincular
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
