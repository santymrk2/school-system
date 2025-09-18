"use client";

import { useState } from "react";
import { DashboardLayout } from "@/app/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Plus,
  Search,
  Calendar,
  User,
  Briefcase,
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/api-generated";

export default function PersonalPage() {
  const { loading, user, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    if (!(hasRole(UserRole.DIRECTOR) || hasRole(UserRole.SECRETARY))) {
      router.replace("/dashboard");
    }
  }, [loading, user, hasRole, router]);

  const [selectedTab, setSelectedTab] = useState("listado");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("todos");

  const [personal] = useState([
    {
      id: 1,
      nombre: "Ana",
      apellido: "López",
      dni: "12345678",
      cuil: "20-12345678-9",
      email: "ana.lopez@ecep.edu.ar",
      telefono: "11-1234-5678",
      cargo: "Docente",
      nivel: "Primario",
      asignaturas: ["Matemática", "Ciencias"],
      grado: "4° A",
      situacion: "Activo",
      fechaIngreso: "2020-03-01",
      titulo: "Profesora en Matemática",
      institucion: "Universidad Nacional de Pilar",
    },
    {
      id: 2,
      nombre: "Clara",
      apellido: "Martínez",
      dni: "87654321",
      cuil: "27-87654321-4",
      email: "clara.martinez@ecep.edu.ar",
      telefono: "11-8765-4321",
      cargo: "Maestra",
      nivel: "Inicial",
      asignaturas: [],
      grado: "Sala 5",
      situacion: "Activo",
      fechaIngreso: "2019-03-01",
      titulo: "Maestra Jardinera",
      institucion: "Instituto Superior de Formación Docente",
    },
    {
      id: 3,
      nombre: "Carlos",
      apellido: "Rodríguez",
      dni: "11223344",
      cuil: "20-11223344-5",
      email: "carlos.rodriguez@ecep.edu.ar",
      telefono: "11-2233-4455",
      cargo: "Maestranza",
      nivel: "General",
      asignaturas: [],
      grado: "",
      situacion: "Licencia",
      fechaIngreso: "2021-08-15",
      titulo: "Secundario Completo",
      institucion: "Escuela Secundaria N° 1",
    },
  ]);

  const [licencias] = useState([
    {
      id: 1,
      personalId: 1,
      fechaInicio: "2025-01-15",
      fechaFin: "2025-01-17",
      tipo: "Enfermedad",
      justificada: true,
      horas: 24,
      motivo: "Gripe estacional",
    },
    {
      id: 2,
      personalId: 2,
      fechaInicio: "2025-01-10",
      fechaFin: "2025-01-10",
      tipo: "Personal",
      justificada: false,
      horas: 8,
      motivo: "Trámite personal",
    },
  ]);

  const filteredPersonal = personal.filter((persona) => {
    const matchesSearch = `${persona.nombre} ${persona.apellido}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      selectedFilter === "todos" ||
      (selectedFilter === "inicial" && persona.nivel === "Inicial") ||
      (selectedFilter === "primario" && persona.nivel === "Primario") ||
      (selectedFilter === "activo" && persona.situacion === "Activo") ||
      (selectedFilter === "licencia" && persona.situacion === "Licencia");
    return matchesSearch && matchesFilter;
  });

  const getSituacionBadge = (situacion: string) => {
    switch (situacion) {
      case "Activo":
        return (
          <Badge variant="default">
            <CheckCircle className="h-3 w-3 mr-1" />
            Activo
          </Badge>
        );
      case "Licencia":
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            En Licencia
          </Badge>
        );
      case "Baja":
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Baja
          </Badge>
        );
      default:
        return <Badge variant="outline">{situacion}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Gestión de Personal
            </h2>
            <p className="text-muted-foreground">
              Administración del personal docente y no docente
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Profesor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Añadir Nuevo Personal</DialogTitle>
                <DialogDescription>
                  Complete la información del nuevo miembro del personal
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Datos Personales */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Datos Personales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nombres</Label>
                      <Input placeholder="Nombres" />
                    </div>
                    <div>
                      <Label>Apellidos</Label>
                      <Input placeholder="Apellidos" />
                    </div>
                    <div>
                      <Label>DNI</Label>
                      <Input placeholder="12345678" />
                    </div>
                    <div>
                      <Label>CUIL</Label>
                      <Input placeholder="20-12345678-9" />
                    </div>
                    <div>
                      <Label>Fecha de Nacimiento</Label>
                      <Input type="date" />
                    </div>
                    <div>
                      <Label>Género</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione género" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="femenino">Femenino</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Estado Civil</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione estado civil" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="soltero">Soltero/a</SelectItem>
                          <SelectItem value="casado">Casado/a</SelectItem>
                          <SelectItem value="divorciado">
                            Divorciado/a
                          </SelectItem>
                          <SelectItem value="viudo">Viudo/a</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Nacionalidad</Label>
                      <Input placeholder="Argentina" />
                    </div>
                  </div>
                </div>

                {/* Información de Contacto */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Información de Contacto
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label>Domicilio Completo</Label>
                      <Input placeholder="Dirección completa" />
                    </div>
                    <div>
                      <Label>Teléfono</Label>
                      <Input placeholder="11-1234-5678" />
                    </div>
                    <div>
                      <Label>Celular</Label>
                      <Input placeholder="11-9876-5432" />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Correo Electrónico</Label>
                      <Input type="email" placeholder="nombre@ecep.edu.ar" />
                    </div>
                  </div>
                </div>

                {/* Datos Laborales */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Datos Laborales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Legajo</Label>
                      <Input placeholder="Número de legajo" />
                    </div>
                    <div>
                      <Label>Fecha de Ingreso</Label>
                      <Input type="date" />
                    </div>
                    <div>
                      <Label>Condición Laboral</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione condición" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="principal">Principal</SelectItem>
                          <SelectItem value="suplente">Suplente</SelectItem>
                          <SelectItem value="interino">Interino</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Cargo Actual</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione cargo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="maestro">Maestro</SelectItem>
                          <SelectItem value="profesor">Profesor</SelectItem>
                          <SelectItem value="maestranza">Maestranza</SelectItem>
                          <SelectItem value="administrativo">
                            Administrativo
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Asignaturas (si corresponde)</Label>
                      <Input placeholder="Matemática, Ciencias" />
                    </div>
                    <div>
                      <Label>Grado/Sala (si corresponde)</Label>
                      <Input placeholder="4° A, Sala 5" />
                    </div>
                  </div>
                </div>

                {/* Formación Académica */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Formación Académica</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Título Principal</Label>
                      <Input placeholder="Profesor en Matemática" />
                    </div>
                    <div>
                      <Label>Institución</Label>
                      <Input placeholder="Universidad Nacional de Pilar" />
                    </div>
                    <div>
                      <Label>Otros Títulos</Label>
                      <Textarea
                        placeholder="Otros títulos obtenidos..."
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Especializaciones</Label>
                      <Textarea
                        placeholder="Especializaciones y cursos..."
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Otros Campos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Información Adicional</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Antecedentes Laborales</Label>
                      <Textarea
                        placeholder="Experiencia laboral previa..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>Observaciones</Label>
                      <Textarea
                        placeholder="Observaciones adicionales..."
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1">
                    Cancelar
                  </Button>
                  <Button className="flex-1">Guardar Personal</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="listado">Listado de Personal</TabsTrigger>
            <TabsTrigger value="licencias">Licencias</TabsTrigger>
          </TabsList>

          <TabsContent value="listado" className="space-y-4">
            {/* Filtros */}
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="inicial">Nivel Inicial</SelectItem>
                  <SelectItem value="primario">Nivel Primario</SelectItem>
                  <SelectItem value="activo">Activos</SelectItem>
                  <SelectItem value="licencia">En Licencia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Lista de Personal */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPersonal.map((persona) => (
                <Card
                  key={persona.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {persona.nombre} {persona.apellido}
                      </CardTitle>
                      {getSituacionBadge(persona.situacion)}
                    </div>
                    <CardDescription>
                      {persona.cargo} - {persona.nivel}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {persona.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {persona.telefono}
                      </div>
                      {persona.grado && (
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                          {persona.grado}
                        </div>
                      )}
                      {persona.asignaturas.length > 0 && (
                        <div className="flex items-center">
                          <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                          {persona.asignaturas.join(", ")}
                        </div>
                      )}
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <User className="h-4 w-4 mr-2" />
                          Ver Perfil Completo
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>
                            {persona.nombre} {persona.apellido}
                          </DialogTitle>
                          <DialogDescription>
                            Información completa del personal
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium">Datos Personales</h4>
                              <p className="text-sm text-gray-600">
                                DNI: {persona.dni}
                              </p>
                              <p className="text-sm text-gray-600">
                                CUIL: {persona.cuil}
                              </p>
                              <p className="text-sm text-gray-600">
                                Email: {persona.email}
                              </p>
                              <p className="text-sm text-gray-600">
                                Teléfono: {persona.telefono}
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium">Datos Laborales</h4>
                              <p className="text-sm text-gray-600">
                                Cargo: {persona.cargo}
                              </p>
                              <p className="text-sm text-gray-600">
                                Nivel: {persona.nivel}
                              </p>
                              <p className="text-sm text-gray-600">
                                Ingreso: {persona.fechaIngreso}
                              </p>
                              <p className="text-sm text-gray-600">
                                Situación: {persona.situacion}
                              </p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium">Formación</h4>
                            <p className="text-sm text-gray-600">
                              {persona.titulo}
                            </p>
                            <p className="text-sm text-gray-600">
                              {persona.institucion}
                            </p>
                          </div>

                          <div>
                            <h4 className="font-medium">Licencias Recientes</h4>
                            <div className="space-y-2">
                              {licencias
                                .filter((l) => l.personalId === persona.id)
                                .map((licencia) => (
                                  <div
                                    key={licencia.id}
                                    className="flex justify-between text-sm p-2 bg-gray-50 rounded"
                                  >
                                    <span>
                                      {licencia.fechaInicio} - {licencia.tipo}
                                    </span>
                                    <Badge
                                      variant={
                                        licencia.justificada
                                          ? "default"
                                          : "secondary"
                                      }
                                    >
                                      {licencia.justificada
                                        ? "Justificada"
                                        : "No Justificada"}
                                    </Badge>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="licencias" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Gestión de Licencias</h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Licencia
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registrar Nueva Licencia</DialogTitle>
                    <DialogDescription>
                      Complete la información de la licencia
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Seleccionar Profesor</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un profesor" />
                        </SelectTrigger>
                        <SelectContent>
                          {personal.map((persona) => (
                            <SelectItem
                              key={persona.id}
                              value={persona.id.toString()}
                            >
                              {persona.nombre} {persona.apellido}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Fecha de Inicio</Label>
                        <Input type="date" />
                      </div>
                      <div>
                        <Label>Fecha de Fin</Label>
                        <Input type="date" />
                      </div>
                    </div>

                    <div>
                      <Label>Tipo de Licencia</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="enfermedad">Enfermedad</SelectItem>
                          <SelectItem value="personal">Personal</SelectItem>
                          <SelectItem value="familiar">
                            Cuidado Familiar
                          </SelectItem>
                          <SelectItem value="formacion">Formación</SelectItem>
                          <SelectItem value="maternidad">Maternidad</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>¿Está Justificada?</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="si">Sí</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Motivo</Label>
                      <Textarea
                        placeholder="Describa el motivo de la licencia..."
                        rows={3}
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" className="flex-1">
                        Cancelar
                      </Button>
                      <Button className="flex-1">Registrar Licencia</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Licencias Registradas</CardTitle>
                <CardDescription>
                  Historial de licencias del personal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {licencias.map((licencia) => {
                    const persona = personal.find(
                      (p) => p.id === licencia.personalId,
                    );
                    return (
                      <div
                        key={licencia.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {persona?.nombre} {persona?.apellido}
                          </p>
                          <p className="text-sm text-gray-600">
                            {licencia.fechaInicio} - {licencia.fechaFin} (
                            {licencia.horas}hs)
                          </p>
                          <p className="text-sm text-gray-600">
                            {licencia.motivo}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{licencia.tipo}</Badge>
                          <div className="mt-1">
                            <Badge
                              variant={
                                licencia.justificada ? "default" : "secondary"
                              }
                            >
                              {licencia.justificada
                                ? "Justificada"
                                : "No Justificada"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
