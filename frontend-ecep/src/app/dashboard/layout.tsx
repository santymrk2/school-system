"use client";

import { useEffect, useState, useMemo, useId } from "react";
import { UserRole } from "@/types/api-generated";
import { useRouter, usePathname } from "next/navigation";
import { ChevronsUpDown, LogOut, School, X, Menu, Settings } from "lucide-react";
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
  const { logout, user, selectedRole, setSelectedRole, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const userRoles = user?.roles;
  const rolesNormalized = useMemo(
    () => normalizeRoles(userRoles),
    [userRoles],
  );

  const currentRole = selectedRole
    ? normalizeRole(selectedRole)
    : (rolesNormalized[0] ?? null);

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

  if (user && rolesNormalized.length > 1 && !selectedRole) return null;

  const displayName = user?.nombreCompleto || user?.email || "Usuario";

  const role = currentRole;

  const visibleMenu = useVisibleMenu(role);

  const dropdownTriggerId = useId();

  useEffect(() => {
    if (!role) return;
    const item = MENU.find((i) => isItemActive(pathname, i.href));
    if (item?.roles && !item.roles.includes(role)) {
      router.replace("/dashboard");
    }
  }, [role, pathname, router]);

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

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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

  return (
    <div className="flex h-screen bg-muted dark:bg-background">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 w-64 bg-background transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          {/* LOGO ARRIBA */}
          <div className="flex items-center justify-between h-16 px-4 m-2 ">
            <div className="flex items-center">
              <div className="bg-primary text-primary-foreground rounded-full p-2 mr-3">
                <School className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold">ECEP</h1>
                <p className="text-xs text-muted-foreground">Sistema Escolar</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* MENÚ por grupos + separador entre grupos */}
          <div className="flex-1 px-4 lg:pr-0 lg:pl-4 py-4">
            <div className="flex h-full flex-col justify-center overflow-y-auto">
              <nav className="space-y-1 py-2">
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
                              "w-full justify-start rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 my-0.5",
                              active
                                ? "bg-muted text-foreground hover:bg-muted font-medium"
                                : "hover:bg-muted hover:text-foreground",
                            )}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <item.icon className="h-5 w-5 mr-3" />
                            {item.label}
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
          <div className="p-4 lg:pr-0 mt-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild id={dropdownTriggerId}>
                <button className="w-full inline-flex items-center justify-between gap-3 rounded-md p-2 hover:bg-muted transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {getInitials(displayName)}
                    </div>
                    <div className="text-left text-sm leading-tight">
                      <p className="font-medium truncate max-w-[9rem]">
                        {displayName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {currentRole ? displayRole(currentRole) : "Sin rol"}
                      </p>
                    </div>
                  </div>
                  <ChevronsUpDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent side="top" align="end" className="w-60 p-3">
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar solo en mobile/tablet */}
        <div className="lg:hidden sticky top-0 z-40 p-4 pb-0">
          <div className="h-12 flex items-center px-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="flex-1 p-4">
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
          onClick={toggleSidebar}
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
