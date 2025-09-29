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
import axios from "axios";
import { useRouter, usePathname } from "next/navigation";
import { identidad } from "@/services/api/modules";
import type { PersonaResumenDTO, AuthResponse } from "@/types/api-generated";
import { UserRole } from "@/types/api-generated";
import { normalizeRole, normalizeRoles } from "@/lib/auth-roles"; // asegúrate de tener este helper

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

function resolveSharedCookieDomain(hostname: string): string | null {
  const trimmed = hostname.trim().toLowerCase();

  if (!trimmed) return null;
  if (trimmed === "localhost" || trimmed === "127.0.0.1") return null;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(trimmed)) return null;

  const parts = trimmed.split(".").filter(Boolean);
  if (parts.length < 2) return null;

  return `.${parts.slice(-2).join(".")}`;
}

function writeTokenCookie(token: string | null) {
  if (typeof window === "undefined") return;

  const baseParts = [
    `token=${token ?? ""}`,
    "Path=/",
    "SameSite=Lax",
    token ? `Max-Age=${60 * 60 * 8}` : "Max-Age=0",
  ];

  const secure = window.location.protocol === "https:";
  const sharedDomain = resolveSharedCookieDomain(window.location.hostname);

  const applyCookie = (domainAttr?: string) => {
    const parts = [...baseParts];
    if (domainAttr) parts.push(`Domain=${domainAttr}`);
    if (secure) parts.push("Secure");
    document.cookie = parts.join("; ");
  };

  applyCookie();
  if (sharedDomain) {
    applyCookie(sharedDomain);
  }
}
interface AuthContextProps {
  user: PersonaResumenDTO | null;
  loading: boolean;

  // sesión
  login: (email: string, password: string) => Promise<void>;
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
  login: async () => {},
  logout: () => {},
  roles: [],
  selectedRole: null,
  setSelectedRole: () => {},
  hasRole: () => false,
});

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  const [user, setUser] = useState<PersonaResumenDTO | null>(null);
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
    let changed = false;
    setSelectedRoleState((prev) => {
      if (prev === norm) {
        return prev;
      }
      changed = true;
      return norm;
    });
    persistSelectedRole(norm);
    if (changed) {
      router.refresh(); // refresca la UI para que cambien permisos/menús
    }
  };

  // ----- roles normalizados desde el usuario -----
  const userRoles = user?.roles;
  const roles = useMemo<UserRole[]>(
    () => normalizeRoles(userRoles),
    [userRoles],
  );

  // ----- carga de sesión al iniciar -----
  const checkAuth = useCallback(async () => {
    try {
      const { data } = await identidad.me();
      const patched = patchUserRoles(data);
      if (process.env.NODE_ENV === "development") {
        console.log("[ME] payload crudo:", data);
        console.log("[ME] roles (patched):", patched.roles);
      }
      setUser(patched);

      const normalizedRoles = normalizeRoles(patched.roles);
      const stored = loadSelectedRole();

      let nextRole: UserRole | null = null;

      if (stored && normalizedRoles.includes(stored)) {
        nextRole = stored;
      } else if (normalizedRoles.length === 1) {
        nextRole = normalizedRoles[0];
      } else {
        nextRole = null;
      }

      setSelectedRoleState(nextRole);

      if (stored !== nextRole) {
        persistSelectedRole(nextRole);
        if (stored || nextRole) {
          router.refresh();
        }
      }
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
      const { data } = await identidad.login(email, password); // AuthResponse
      // Guarda token para axios (tu interceptor lo usa)
      const auth = data as AuthResponse;
      if (typeof window !== "undefined" && auth?.token) {
        localStorage.setItem("token", auth.token);
        // Si tu backend NO setea cookie httpOnly, dejamos una cookie legible
        // para que el middleware te vea (dev/rápido). En prod, preferí Set-Cookie httpOnly desde el server.
        writeTokenCookie(auth.token);
      }

      // Ahora traemos el usuario y roles reales
      const me = await identidad.me();
      const patched = patchUserRoles(me.data);
      if (process.env.NODE_ENV === "development") {
        console.log("[LOGIN→ME] roles (patched):", patched.roles);
      }
      setUser(patched);

      const normalized = normalizeRoles(patched.roles);

      if (normalized.length === 0) {
        // Sin roles: quedate en login; podés mostrar un toast desde la página
        return;
      }

      if (normalized.length === 1) {
        setSelectedRole(normalized[0]); // guarda + refresh
        router.replace("/dashboard");
      } else {
        setSelectedRole(null); // forzamos selección
        router.replace("/select-rol"); // ya logueado
      }

      return;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          (typeof error.response?.data?.message === "string" &&
            error.response?.data?.message) ||
          error.message ||
          "Error al iniciar sesión";
        throw new Error(message);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Error al iniciar sesión");
    }
  };

  const logout = () => {
    identidad
      .logout()
      .catch(() => {})
      .finally(() => {
        setUser(null);
        setSelectedRole(null);
        // limpiar token de localStorage y cookie para el middleware
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          writeTokenCookie(null);
        }
        router.replace("/");
        router.refresh();
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
