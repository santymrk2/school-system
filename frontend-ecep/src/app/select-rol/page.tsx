"use client";

import { useEffect, useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SelectRolPage() {
  const { user, loading, selectedRole, setSelectedRole } = useAuth();
  const router = useRouter();

  // Roles normalizados y únicos
  const userRoles = user?.roles;
  const roles = useMemo(() => normalizeRoles(userRoles), [userRoles]);

  // Estado del dropdown (pre-selecciona el rol ya elegido o el primero)
  const [localRole, setLocalRole] = useState<UserRole | null>(null);

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

    // 3) inicializar dropdown
    if (!localRole) {
      setLocalRole(selectedRole ?? roles[0] ?? null);
    }
  }, [loading, user, roles, selectedRole, localRole, setSelectedRole, router]);

  // mientras carga o redirige
  if (loading || !user) return null;
  if (roles.length <= 1) return null; // ya redirige en el effect

  const handleConfirm = () => {
    if (!localRole) return;
    setSelectedRole(localRole);
    router.replace("/dashboard");
  };

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
            <label className="block text-sm mb-2">Rol</label>

            <div className="flex flex-wrap gap-2 items-start content-start max-w-full">
              {roles.map((r) => (
                <Button
                  key={r}
                  type="button"
                  onClick={() => setLocalRole(r as UserRole)}
                  className={`rounded-full px-4 h-9 text-sm whitespace-nowrap shrink-0 transition-all ${
                    localRole === r
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {displayRole(r)}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={!selectedRole}
              onClick={() => {
                // Si no hab&iacute;a un rol previamente elegido,
                // evitar loop de redirecci&oacute;n al dashboard → select-rol
                if (!selectedRole) return;
                router.replace("/dashboard");
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={!localRole}>
              Entrar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
