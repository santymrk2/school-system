"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/api-generated";
import { normalizeRoles, displayRole } from "@/lib/auth-roles";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SelectRolPage() {
  const { user, loading, selectedRole, setSelectedRole } = useAuth();
  const router = useRouter();

  // Roles normalizados y únicos
  const userRoles = user?.roles;
  const roles = useMemo(() => normalizeRoles(userRoles), [userRoles]);

  useEffect(() => {
    if (loading) return;

    // 1) no logueado → al login
    if (!user) {
      router.replace("/");
      return;
    }

    // 2) un solo rol → elegir y salir directo
    if (roles.length === 1) {
      if (!selectedRole || selectedRole !== roles[0]) {
        setSelectedRole(roles[0]);
      }
      router.replace("/dashboard");
      return;
    }

    // 3) múltiples roles → esperar interacción del usuario
  }, [loading, user, roles, selectedRole, setSelectedRole, router]);

  // mientras carga o redirige
  if (loading || !user) return null;
  if (roles.length <= 1) return null; // ya redirige en el effect

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Elegí con qué rol entrar</CardTitle>
          <CardDescription>
            Tu usuario tiene varios roles asignados. Podés cambiarlo luego desde
            el encabezado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm mb-2 text-muted-foreground">Rol</label>

            <div className="flex flex-wrap gap-2 items-start content-start max-w-full">
              {roles.map((r) => (
                <Button
                  key={r}
                  type="button"
                  onClick={() => {
                    setSelectedRole(r as UserRole);
                    router.replace("/dashboard");
                  }}
                  className={cn(
                    "rounded-full px-4 h-9 text-sm whitespace-nowrap shrink-0 transition-all",
                    "border border-border bg-muted text-foreground/80 hover:bg-muted/80",
                  )}
                >
                  {displayRole(r)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
