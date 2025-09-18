"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

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

import {
  School,
  Mail,
  Lock,
  Users,
  GraduationCap,
  BookOpen,
  Eye,
  EyeOff,
} from "lucide-react";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { normalizeRole } from "@/lib/auth-roles";
import { UserRole } from "@/types/api-generated";

export default function LoginPage() {
  const { user, login, logout, loading, selectedRole, setSelectedRole } =
    useAuth();
  const router = useRouter();

  // ---- estado local del formulario ----
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [loginError, setLoginError] = useState("");

  // ---- roles normalizados del usuario (si ya está logueado) ----
  const roles = useMemo<UserRole[]>(
    () =>
      Array.from(
        new Set((user?.roles ?? []).map(normalizeRole).filter(Boolean)),
      ) as UserRole[],
    [user],
  );

  // ---- redirecciones según estado de sesión/roles ----
  useEffect(() => {
    if (loading) return;
    if (!user) return;

    // Si ya eligió rol, al dashboard
    if (selectedRole) {
      router.replace("/dashboard");
      return;
    }

    // Resolver según cantidad de roles (usuario que llega logueado a "/")
    if (roles.length === 1) {
      setSelectedRole(roles[0]);
      router.replace("/dashboard");
    } else if (roles.length > 1) {
      router.replace("/select-rol");
    } else {
      // 0 roles: mostrar tarjeta de error (más abajo) en vez de spinner eterno
    }
  }, [loading, user, roles, selectedRole, setSelectedRole, router]);

  // ---- handlers ----
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidEmail(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;

    setIsLoggingIn(true);
    setLoginError("");

    try {
      const success = await login(email, password);
      if (!success) {
        toast.error("Email o contraseña incorrectos");
        setLoginError("Email o contraseña incorrectos");
      }
      // Redirecciones las maneja AuthContext + useEffect superior
    } catch {
      toast.error("Error al iniciar sesión");
      setLoginError("Error al iniciar sesión");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ---- UI de carga / estados especiales ----
  if (loading) return <LoadingSpinner />;

  // Usuario logueado pero sin roles normalizados → mostrar aviso útil (no spinner infinito)
  if (user && roles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Sin roles asignados</CardTitle>
            <CardDescription>
              Tu usuario no tiene roles disponibles en el sistema. Contactá a la
              administración.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Button variant="outline" onClick={logout}>
              Cerrar sesión
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si está logueado y no cayó en el caso de 0 roles, probablemente esté redirigiendo
  if (user) return <LoadingSpinner />;

  // ---- UI de login ----
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo y título */}
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-primary text-primary-foreground rounded-full p-3">
              <School className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">ECEP</h1>
          <p className="text-gray-600 mt-2">
            Escuela Complejo Evangelico Pilar
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Sistema de Gestión Escolar
          </p>
        </div>

        {/* Formulario de login */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-center">
              Ingrese sus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={!isValidEmail ? handleEmailSubmit : handleLogin}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nombre@ecep.edu.ar"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {isValidEmail && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Ingrese su contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Mínimo 8 caracteres, 2 números y 1 símbolo especial
                    </p>
                  </div>

                  {loginError && (
                    <p className="text-sm text-red-500">{loginError}</p>
                  )}
                </>
              )}

              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {!isValidEmail
                  ? "Continuar"
                  : isLoggingIn
                    ? "Ingresando..."
                    : "Ingresar"}
              </Button>
            </form>

            {!isValidEmail && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-2 text-gray-500">o</span>
                  </div>
                </div>

                <Link href="/postulacion">
                  <Button variant="outline" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    ¿Querés postularte como alumno? Ingresá acá
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        {/* Información adicional */}
        <div className="text-center text-sm text-gray-600 space-y-2">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <GraduationCap className="h-4 w-4 mr-1" />
              <span>Nivel Inicial</span>
            </div>
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              <span>Nivel Primario</span>
            </div>
          </div>
          <p>
            © 2025 Escuela Complejo Evangelico Pilar. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
