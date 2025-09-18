"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/services/api";
import type { UsuarioBusquedaDTO, AuthResponse } from "@/types/api-generated";
import { UserRole } from "@/types/api-generated";
import { normalizeRole } from "@/lib/auth-roles"; // asegúrate de tener este helper

const SELECTED_ROLE_KEY = "selectedRole";

// Extrae los roles sin importar si vienen como roles[], userRoles[] o authorities[]
function extractRawRoles(userLike: any): string[] {
  if (!userLike) return [];

  // 1) roles: string[] (ideal)
  if (Array.isArray(userLike.roles)) {
    return userLike.roles.filter(Boolean);
  }

  // 2) userRoles: string[] (tu caso actual)
  if (Array.isArray(userLike.userRoles)) {
    return userLike.userRoles.filter(Boolean);
  }

  // 3) authorities: [{authority: "ROLE_ADMIN"}], típico Spring
  if (Array.isArray(userLike.authorities)) {
    return userLike.authorities
      .map((a: any) => a?.authority ?? a?.name ?? a?.role ?? null)
      .filter(Boolean);
  }

  return [];
}

/**
 * Parchea el objeto de usuario para **siempre** exponer `roles: string[]`.
 * (Deja todo lo demás tal cual.)
 */
function patchUserRoles<T extends Record<string, any>>(
  u: T,
): T & { roles: string[] } {
  const roles = extractRawRoles(u);
  return { ...u, roles };
}
interface AuthContextProps {
  user: UsuarioBusquedaDTO | null;
  loading: boolean;

  // sesión
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;

  // autorización
  roles: UserRole[]; // roles del usuario normalizados
  selectedRole: UserRole | null;
  setSelectedRole: (role: UserRole | null) => void;
  hasRole: (role: UserRole) => boolean;
}

const AuthCtx = createContext<AuthContextProps>({
  user: null,
  loading: true,
  login: async () => false,
  logout: () => {},
  roles: [],
  selectedRole: null,
  setSelectedRole: () => {},
  hasRole: () => false,
});

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [user, setUser] = useState<UsuarioBusquedaDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRoleState] = useState<UserRole | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const hasCheckedAuth = useRef(false);

  // ----- helpers de persistencia -----
  const persistSelectedRole = (role: UserRole | null) => {
    if (typeof window === "undefined") return;
    if (role) localStorage.setItem(SELECTED_ROLE_KEY, role);
    else localStorage.removeItem(SELECTED_ROLE_KEY);
  };

  const loadSelectedRole = (): UserRole | null => {
    if (typeof window === "undefined") return null;
    const val = localStorage.getItem(SELECTED_ROLE_KEY);
    const norm = val ? normalizeRole(val) : null;
    return norm;
  };

  const setSelectedRole = (role: UserRole | null) => {
    const norm = role ? normalizeRole(role) : null;
    setSelectedRoleState(norm);
    persistSelectedRole(norm);
    router.refresh(); // refresca la UI para que cambien permisos/menús
  };

  // ----- roles normalizados desde el usuario -----
  const roles = useMemo<UserRole[]>(
    () =>
      Array.from(
        new Set(
          (user?.roles ?? [])
            .map(normalizeRole)
            .filter((r): r is UserRole => r !== null),
        ),
      ),
    [user],
  );

  // ----- carga de sesión al iniciar -----
  const checkAuth = useCallback(async () => {
    try {
      const { data } = await api.me();
      const patched = patchUserRoles(data);
      if (process.env.NODE_ENV === "development") {
        console.log("[ME] payload crudo:", data);
        console.log("[ME] roles (patched):", patched.roles);
      }
      setUser(patched);

      // rehidratar rol elegido si aplica
      const stored = loadSelectedRole();
      if (stored) setSelectedRoleState(stored);
    } catch {
      setUser(null);

      // proteger rutas privadas: dashboard y select-rol
      const isProtected =
        pathname.startsWith("/dashboard") || pathname === "/select-rol";
      if (isProtected) router.replace("/");
    } finally {
      setLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    if (!hasCheckedAuth.current) {
      checkAuth();
      hasCheckedAuth.current = true;
    }
  }, [checkAuth]);

  // ----- login con bifurcación por cantidad de roles -----
  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.login(email, password); // AuthResponse
      // Guarda token para axios (tu interceptor lo usa)
      const auth = data as AuthResponse;
      if (typeof window !== "undefined" && auth?.token) {
        localStorage.setItem("token", auth.token);
        // Si tu backend NO setea cookie httpOnly, dejamos una cookie legible
        // para que el middleware te vea (dev/rápido). En prod, preferí Set-Cookie httpOnly desde el server.
        document.cookie = `token=${auth.token}; Path=/; Max-Age=${60 * 60 * 8}; SameSite=Lax`;
      }

      // Ahora traemos el usuario y roles reales
      const me = await api.me();
      const patched = patchUserRoles(me.data);
      if (process.env.NODE_ENV === "development") {
        console.log("[LOGIN→ME] roles (patched):", patched.roles);
      }
      setUser(patched);

      const normalized = Array.from(
        new Set(
          (me.data.roles ?? [])
            .map(normalizeRole)
            .filter((r): r is UserRole => r !== null),
        ),
      );

      if (normalized.length === 0) {
        // Sin roles: quedate en login; podés mostrar un toast desde la página
        return true;
      }

      if (normalized.length === 1) {
        setSelectedRole(normalized[0]); // guarda + refresh
        router.replace("/dashboard");
      } else {
        setSelectedRole(null); // forzamos selección
        router.replace("/select-rol"); // ya logueado
      }

      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    api
      .logout()
      .catch(() => {})
      .finally(() => {
        setUser(null);
        setSelectedRole(null);
        // limpiar token de localStorage y cookie para el middleware
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          document.cookie = "token=; Max-Age=0; Path=/; SameSite=Lax";
        }
        router.replace("/");
      });
  };

  // ----- autorización -----
  const hasRole = (role: UserRole): boolean => {
    if (selectedRole) {
      // Si querés que ADMIN no sea superrol, quitá la comparación con ADMIN
      return selectedRole === role || selectedRole === UserRole.ADMIN;
    }
    return roles.includes(role);
  };

  return (
    <AuthCtx.Provider
      value={{
        user,
        loading,
        login,
        logout,
        roles,
        selectedRole,
        setSelectedRole,
        hasRole,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => useContext(AuthCtx);
