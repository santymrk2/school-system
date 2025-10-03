"use client";

import type React from "react";
import { useEffect, useState, useMemo } from "react";
import { UserRole } from "@/types/api-generated";
import { useRouter, usePathname } from "next/navigation";
import {
  ChevronsUpDown,
  LogOut,
  School,
  X,
  Menu,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { normalizeRole, normalizeRoles, displayRole } from "@/lib/auth-roles";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { MENU, type MenuItem } from "@/lib/menu";

import { ConfiguracionDialog } from "./_components/ConfiguracionDialog";

import { isItemActive } from "@/lib/nav";

import { useVisibleMenu } from "@/hooks/useVisibleMenu";
import { cn } from "@/lib/utils";
interface DashboardLayoutProps {
  children: React.ReactNode;
}

const getInitials = (name: string | undefined | null) => {
  const matches = name?.match(/\b\w/g);
  return matches ? matches.join("") : "??";
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const { logout, user, selectedRole, setSelectedRole, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const userRoles = user?.roles;
  const rolesNormalized = useMemo(() => normalizeRoles(userRoles), [userRoles]);

  const currentRole = selectedRole
    ? normalizeRole(selectedRole)
    : (rolesNormalized[0] ?? null);

  const role = currentRole;
  const visibleMenu = useVisibleMenu(role);

  useEffect(() => {
    if (!role) return;
    const item = MENU.find((i) => isItemActive(pathname, i.href));
    if (item?.roles && !item.roles.includes(role)) {
      router.replace("/dashboard");
    }
  }, [role, pathname, router]);

  useEffect(() => {
    if (loading || !user) return;
    if (rolesNormalized.length > 1 && !selectedRole) {
      router.replace("/select-rol");
      return;
    }
    if (rolesNormalized.length === 1 && !selectedRole) {
      setSelectedRole(rolesNormalized[0]);
      router.refresh();
    }
  }, [loading, user, rolesNormalized, selectedRole, setSelectedRole, router]);

  // ⭐ Agrupación dinámica por `group` preservando orden
  const groupedMenu = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const item of visibleMenu) {
      const key = item.group ?? "__default__";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return Array.from(map.entries()); // [groupKey, items][]
  }, [visibleMenu]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted dark:bg-background">
        <span className="text-sm text-muted-foreground">Cargando panel...</span>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (rolesNormalized.length > 1 && !selectedRole) return null;

  const displayName = user.nombreCompleto || user.email || "Usuario";

  const handleChangeRole = (r: UserRole) => {
    if (currentRole === r) return;

    setSelectedRole(r);

    // Siempre mandamos al usuario al inicio del dashboard para evitar rutas
    // incompatibles con el nuevo rol seleccionado.
    router.replace("/dashboard");
  };

  const handleLogout = async (e?: React.FormEvent) => {
    e?.preventDefault();
    logout();
  };

  const handleNavigationToggle = () => {
    if (isDesktop) {
      setIsCollapsed((prev) => !prev);
      return;
    }

    setSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const updateIsDesktop = (matches: boolean) => {
      setIsDesktop(matches);
      if (!matches) {
        setIsCollapsed(false);
      }
    };

    updateIsDesktop(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      updateIsDesktop(event.matches);
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", listener);
      return () => {
        mediaQuery.removeEventListener("change", listener);
      };
    }

    mediaQuery.addListener(listener);
    return () => {
      mediaQuery.removeListener(listener);
    };
  }, []);

  const isNavCollapsed = isDesktop && isCollapsed;
  const isNavigationOpen = isDesktop ? !isNavCollapsed : sidebarOpen;
  const NavigationToggleIcon = isNavigationOpen ? X : Menu;
  const navigationToggleLabel = isDesktop
    ? isNavCollapsed
      ? "Expandir menú"
      : "Colapsar menú"
    : sidebarOpen
      ? "Cerrar menú"
      : "Abrir menú";

  return (
    <div className="flex h-screen bg-muted dark:bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-background transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          isNavCollapsed ? "lg:w-20" : "lg:w-64",
        )}
      >
        <div className="flex flex-col h-full">
          {/* LOGO ARRIBA */}
          <div
            className={cn(
              "flex items-center h-16 m-2 px-2",
              isDesktop ? "justify-between" : "justify-between px-4",
              isDesktop && isNavCollapsed ? "justify-center" : "",
            )}
          >
            {isDesktop && isNavCollapsed ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNavigationToggle}
                aria-label={navigationToggleLabel}
              >
                <NavigationToggleIcon className="h-5 w-5" />
              </Button>
            ) : (
              <>
                <div className="flex items-center">
                  <div
                    className={cn(
                      "bg-primary text-primary-foreground rounded-full p-2",
                      !isDesktop ? "mr-3" : "",
                    )}
                  >
                    <School className="h-6 w-6" />
                  </div>
                  {!isDesktop && !isNavCollapsed && (
                    <div>
                      <h1 className="text-lg font-bold">ECEP</h1>
                      <p className="text-xs text-muted-foreground">
                        Sistema Escolar
                      </p>
                    </div>
                  )}
                </div>
                {isDesktop && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNavigationToggle}
                    aria-label={navigationToggleLabel}
                  >
                    <NavigationToggleIcon className="h-5 w-5" />
                  </Button>
                )}
              </>
            )}
          </div>

          {/* MENÚ por grupos + separador entre grupos */}
          <div
            className={cn(
              "flex-1 py-4",
              isNavCollapsed ? "px-2 lg:px-2" : "px-4 lg:px-4",
            )}
          >
            <div className="flex h-full flex-col justify-center overflow-y-auto">
              <nav className="space-y-1 py-2 pl-1">
                {groupedMenu.map(([groupKey, items], groupIndex) => (
                  <div key={groupKey} className="space-y-1">
                    {items.map((item, index) => {
                      const active = isItemActive(pathname, item.href);
                      return (
                        <Link key={`${groupKey}-${index}`} href={item.href}>
                          <Button
                            aria-current={active ? "page" : undefined}
                            variant="ghost"
                            className={cn(
                              "w-full rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 my-0.5",
                              isNavCollapsed
                                ? "justify-center px-3"
                                : "justify-start",
                              active
                                ? "bg-muted text-foreground hover:bg-muted font-medium"
                                : "hover:bg-muted hover:text-foreground",
                            )}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <item.icon
                              className={cn(
                                "h-5 w-5",
                                !isNavCollapsed && "mr-3",
                              )}
                            />
                            {isNavCollapsed ? (
                              <span className="sr-only">{item.label}</span>
                            ) : (
                              item.label
                            )}
                          </Button>
                        </Link>
                      );
                    })}
                    {groupIndex < groupedMenu.length - 1 && (
                      <div className="m-2 border-t border-border/60 dark:border-border/40" />
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* PERFIL ABAJO + dropdown hacia arriba */}
          <div className={cn("mt-auto", isNavCollapsed ? "p-2" : "p-4")}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  id="dashboard-user-menu-trigger"
                  className={cn(
                    "w-full inline-flex items-center gap-3 rounded-md p-2 hover:bg-muted transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                    isNavCollapsed ? "justify-center" : "justify-between",
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center gap-3",
                      isNavCollapsed && "justify-center",
                    )}
                  >
                    <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {getInitials(displayName)}
                    </div>
                    {!isNavCollapsed && (
                      <div className="text-left text-sm leading-tight">
                        <p className="font-medium truncate max-w-[9rem]">
                          {displayName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {currentRole ? displayRole(currentRole) : "Sin rol"}
                        </p>
                      </div>
                    )}
                  </div>
                  {!isNavCollapsed && (
                    <ChevronsUpDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                side="top"
                align="end"
                className="w-60 p-3"
                aria-labelledby="dashboard-user-menu-trigger"
              >
                <DropdownMenuLabel className="truncate">
                  {displayName}
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="mx-1 bg-border" />

                {rolesNormalized.length === 0 && (
                  <DropdownMenuItem disabled>
                    Sin roles asignados
                  </DropdownMenuItem>
                )}

                {rolesNormalized.map((r) => {
                  const isActive = currentRole === r;
                  return (
                    <DropdownMenuItem
                      key={r}
                      onClick={() => !isActive && handleChangeRole(r)}
                      className={
                        isActive
                          ? "bg-muted text-foreground hover:bg-muted font-medium"
                          : ""
                      }
                    >
                      {displayRole(r)}
                    </DropdownMenuItem>
                  );
                })}

                <DropdownMenuSeparator className="mx-1 bg-border" />

                <DropdownMenuItem onClick={() => setConfigOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                </DropdownMenuItem>

                <DropdownMenuSeparator className="mx-1 bg-border" />

                <DropdownMenuItem
                  onClick={() => handleLogout()}
                  className="text-destructive focus:text-destructive dark:text-destructive dark:focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white dark:bg-background overflow-y-hidden">
        {/* Botón de navegación principal */}
        <div className="sticky top-0 z-40 p-4 pb-0 pl-0 lg:hidden">
          <div className="h-12 flex items-center px-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNavigationToggle}
              aria-label={navigationToggleLabel}
            >
              <NavigationToggleIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="flex-1 p-4 pl-1">
          <div className="rounded-xl bg-card text-card-foreground ring-1 ring-border overflow-hidden">
            <main className="scrollarea  h-[calc(100vh-6rem)] lg:h-[calc(107vh-6rem)] overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </div>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={handleNavigationToggle}
        />
      )}

      <ConfiguracionDialog
        open={configOpen}
        onOpenChange={setConfigOpen}
        currentRole={role}
        roles={rolesNormalized}
      />
    </div>
  );
}
