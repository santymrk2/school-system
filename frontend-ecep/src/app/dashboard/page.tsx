"use client";

import { useState, useMemo, useEffect } from "react";
import LoadingState from "@/components/common/LoadingState";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  UserCheck,
  FileText,
  Ambulance,
  Bell,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { DashboardLayout } from "@/app/dashboard/dashboard-layout";
import { useAuth } from "@/hooks/useAuth";
import { normalizeRole } from "@/lib/auth-roles";
import { MENU, type MenuItem } from "@/lib/menu";
import { useActivePeriod } from "@/hooks/scope/useActivePeriod"; // ← período activo + hoy
import { useVisibleMenu } from "@/hooks/useVisibleMenu";
import { useRecentMessages } from "@/hooks/useRecentMessages";

import { useQuickStats } from "@/hooks/useQuickStats";

// y usás: stats?.alumnosActivos, stats?.docentesActivos, etc.
// con fallback 0 mientras carga
export default function DashboardPage() {
  const { user, selectedRole } = useAuth();

  // --------- MENSAJES RECIENTES ----------
  const { items: recentMsgs, loading: loadingMsgs } = useRecentMessages(5);

  const role = selectedRole ? normalizeRole(selectedRole) : null;

  const menuByRole = useVisibleMenu(role);

  // --------- STATS ----------
  const { data: stats, loading: loadingStats } = useQuickStats();

  // --------- QUICK ACTIONS (filtrado correcto) ----------
  const visibleQuickActions = useMemo(
    () =>
      menuByRole.filter(
        (a) => a.href !== "/dashboard" && a.href !== "/dashboard/",
      ),
    [menuByRole],
  );

  return (
    <DashboardLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Bienvenido al sistema de gestión escolar ECEP
            </p>
          </div>
        </div>

        {/* Estadísticas principales (5 cards) */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Alumnos Activos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.alumnosActivos}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 inline-flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {loadingStats ? "actualizando…" : "en período vigente"}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Docentes Activos
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.docentesActivos}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-blue-600 inline-flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  con asignación vigente
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Postulaciones
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.postulacionesPendientes}
              </div>
              <p className="text-xs text-muted-foreground">pendientes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Licencias Activas
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.licenciasActivas}
              </div>
              <p className="text-xs text-muted-foreground">vigentes hoy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Actas sin firmar
              </CardTitle>
              <Ambulance className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.actasSinFirmar}</div>
              <p className="text-xs text-muted-foreground">en borrador</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          {/* Acciones rápidas */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>
                Accede rápidamente a las funciones principales del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {visibleQuickActions.map((action, index) => (
                  <Link
                    key={index}
                    href={action.href}
                    className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors"
                  >
                    <div
                      className={`p-2 rounded-full ${"bg-primary"} text-white mb-2`}
                    >
                      <action.icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-center">
                      {action.label}
                    </span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mensajes recientes */}
          <Card className="col-span-4 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                Mensajes Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingMsgs ? (
                <LoadingState label="Cargando mensajes…" />
              ) : recentMsgs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay mensajes recientes
                </p>
              ) : (
                <div className="space-y-3">
                  {recentMsgs.map((it) => (
                    <div
                      key={it.userId}
                      className="flex items-start gap-3 p-2 rounded hover:bg-gray-50"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                        {it.nombre
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {it.nombre}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {it.lastMessage}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {/* opcional: formatear “hace X” */}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
