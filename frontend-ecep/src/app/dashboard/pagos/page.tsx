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
import { Checkbox } from "@/components/ui/checkbox";
import {
  CreditCard,
  Plus,
  FileText,
  Calendar,
  DollarSign,
  Users,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function PagosPage() {
  const [selectedTab, setSelectedTab] = useState("cuotas");
  const [userProfile] = useState("administracion"); // Simulando perfil de usuario

  const [alumnos] = useState([
    {
      id: 1,
      nombre: "Juan Pérez",
      seccion: "4° A",
      cuotas: [
        {
          id: 1,
          mes: "Marzo 2025",
          monto: 45000,
          vencida: false,
          codigo: "ECEP-2025-03-001",
        },
        {
          id: 2,
          mes: "Abril 2025",
          monto: 45000,
          vencida: true,
          codigo: "ECEP-2025-04-001",
        },
        {
          id: 3,
          mes: "Mayo 2025",
          monto: 47000,
          vencida: false,
          codigo: "ECEP-2025-05-001",
        },
      ],
      matricula: { monto: 25000, pagada: true, codigo: "ECEP-MAT-2025-001" },
    },
    {
      id: 2,
      nombre: "María González",
      seccion: "Sala 5",
      cuotas: [
        {
          id: 1,
          mes: "Marzo 2025",
          monto: 42000,
          vencida: false,
          codigo: "ECEP-2025-03-002",
        },
        {
          id: 2,
          mes: "Abril 2025",
          monto: 42000,
          vencida: false,
          codigo: "ECEP-2025-04-002",
        },
      ],
      matricula: { monto: 22000, pagada: true, codigo: "ECEP-MAT-2025-002" },
    },
  ]);

  const [personal] = useState([
    {
      id: 1,
      nombre: "Prof. Ana López",
      cargo: "Docente",
      sueldo: 180000,
      recibido: true,
      fecha: "2025-01-30",
      archivo: "recibo_enero_2025.pdf",
    },
    {
      id: 2,
      nombre: "Maestra Clara",
      cargo: "Maestra",
      sueldo: 165000,
      recibido: false,
      fecha: "2025-01-30",
      archivo: "recibo_enero_2025.pdf",
    },
  ]);

  const [secciones] = useState([
    "3° A",
    "3° B",
    "4° A",
    "4° B",
    "5° A",
    "5° B",
    "6° A",
    "6° B",
    "Sala 3",
    "Sala 4",
    "Sala 5",
  ]);

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(monto);
  };

  const renderFamiliaView = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {alumnos.map((alumno) => (
          <Card key={alumno.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {alumno.nombre}
                <Badge variant="outline">{alumno.seccion}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Matrícula */}
              <div className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Matrícula 2025</h4>
                  <Badge
                    variant={
                      alumno.matricula.pagada ? "default" : "destructive"
                    }
                  >
                    {alumno.matricula.pagada ? "Pagada" : "Pendiente"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Monto: {formatMonto(alumno.matricula.monto)}
                </p>
                <p className="text-xs text-gray-500">
                  Código: {alumno.matricula.codigo}
                </p>
              </div>

              {/* Cuotas */}
              <div>
                <h4 className="font-medium mb-3">Cuotas</h4>
                <div className="space-y-2">
                  {alumno.cuotas.map((cuota) => (
                    <div
                      key={cuota.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div>
                        <p className="font-medium">{cuota.mes}</p>
                        <p className="text-sm text-gray-600">
                          {formatMonto(cuota.monto)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={cuota.vencida ? "destructive" : "secondary"}
                        >
                          {cuota.vencida ? "Vencida" : "Vigente"}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {cuota.codigo}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAdministracionView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Gestión de Cuotas y Pagos</h3>
        <div className="flex space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Cuota
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nueva Cuota</DialogTitle>
                <DialogDescription>
                  Complete la información para crear una nueva cuota
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Secciones</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione secciones" />
                    </SelectTrigger>
                    <SelectContent>
                      {secciones.map((seccion) => (
                        <SelectItem key={seccion} value={seccion}>
                          {seccion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Título de la Cuota</Label>
                  <Input placeholder="Ej: Cuota Abril 2025" />
                </div>

                <div>
                  <Label>Monto</Label>
                  <Input type="number" placeholder="45000" />
                </div>

                <div>
                  <Label>Fecha de Vencimiento</Label>
                  <Input type="date" />
                </div>

                <div>
                  <Label>Recargo por Vencimiento (%)</Label>
                  <Input type="number" placeholder="10" defaultValue="10" />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="matricula" />
                  <Label htmlFor="matricula">Es matrícula</Label>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1">
                    Cancelar
                  </Button>
                  <Button className="flex-1">Crear Cuota</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <DollarSign className="h-4 w-4 mr-2" />
                Nuevo Pago
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Pago</DialogTitle>
                <DialogDescription>
                  Registre un pago realizado por personal o familia
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Tipo de Pago</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sueldo">Sueldo Personal</SelectItem>
                      <SelectItem value="cuota">Cuota Alumno</SelectItem>
                      <SelectItem value="matricula">Matrícula</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Persona/Alumno</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione persona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ana">Prof. Ana López</SelectItem>
                      <SelectItem value="clara">Maestra Clara</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Fecha del Pago</Label>
                  <Input type="date" />
                </div>

                <div>
                  <Label>Archivo del Recibo</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Haga clic para subir archivo
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1">
                    Cancelar
                  </Button>
                  <Button className="flex-1">Registrar Pago</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de cuotas creadas */}
      <Card>
        <CardHeader>
          <CardTitle>Cuotas Activas</CardTitle>
          <CardDescription>
            Gestión de cuotas por sección y período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Cuota Marzo 2025</p>
                <p className="text-sm text-gray-600">
                  Todas las secciones - Vence: 10/03/2025
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatMonto(45000)}</p>
                <Badge variant="default">Activa</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Matrícula 2025</p>
                <p className="text-sm text-gray-600">
                  Todas las secciones - Vence: 15/02/2025
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatMonto(25000)}</p>
                <Badge variant="secondary">Vencida</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPersonalView = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Mi Recibo de Sueldo
          </CardTitle>
          <CardDescription>Enero 2025</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Sueldo Bruto</p>
              <p className="text-2xl font-bold">{formatMonto(180000)}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Fecha de Pago</p>
              <p className="text-lg">30/01/2025</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="recibido" defaultChecked />
                <Label htmlFor="recibido">Recibí conforme</Label>
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Descargar PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Pagos</h2>
            <p className="text-muted-foreground">
              Gestión de cuotas, matrículas y pagos del personal
            </p>
          </div>
        </div>

        {/* Contenido según perfil */}
        {userProfile === "familia" && renderFamiliaView()}
        {userProfile === "administracion" && (
          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="cuotas">Cuotas y Matrículas</TabsTrigger>
              <TabsTrigger value="personal">Pagos Personal</TabsTrigger>
            </TabsList>

            <TabsContent value="cuotas">
              {renderAdministracionView()}
            </TabsContent>

            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Pagos del Personal</CardTitle>
                  <CardDescription>
                    Gestión de sueldos y pagos al personal docente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {personal.map((persona) => (
                      <div
                        key={persona.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{persona.nombre}</p>
                          <p className="text-sm text-gray-600">
                            {persona.cargo}
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-medium">
                              {formatMonto(persona.sueldo)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {persona.fecha}
                            </p>
                          </div>
                          <Badge
                            variant={persona.recibido ? "default" : "secondary"}
                          >
                            {persona.recibido ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <AlertCircle className="h-3 w-3 mr-1" />
                            )}
                            {persona.recibido ? "Recibido" : "Pendiente"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
        {userProfile === "personal" && renderPersonalView()}
      </div>
    </DashboardLayout>
  );
}
