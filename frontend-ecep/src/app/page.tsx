"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import axios from "axios";

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
import { normalizeRoles } from "@/lib/auth-roles";
import { UserRole } from "@/types/api-generated";
import { identidad } from "@/services/api/modules";

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
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
      const message =
        (typeof error.response?.data?.message === "string" &&
          error.response?.data?.message) ||
        (typeof error.response?.data?.error === "string" &&
          error.response?.data?.error) ||
        error.message;
      return message || fallback;
    }
    if (error instanceof Error) {
      return error.message || fallback;
    }
    return fallback;
  };

  // ---- roles normalizados del usuario (si ya está logueado) ----
  const userRoles = user?.roles;
  const roles = useMemo<UserRole[]>(() => normalizeRoles(userRoles), [userRoles]);

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
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCheckingEmail) return;

    setIsCheckingEmail(true);

    try {
      await identidad.checkEmail(email);
      setIsValidEmail(true);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "No pudimos verificar el correo electrónico",
      );
      toast.error(message);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;

    setIsLoggingIn(true);

    try {
      await login(email, password);
      // Redirecciones las maneja AuthContext + useEffect superior
    } catch (error) {
      const message = getErrorMessage(error, "Error al iniciar sesión");
      toast.error(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoBackToEmail = () => {
    setIsValidEmail(false);
    setPassword("");
    setShowPassword(false);
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
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 flex items-center justify-center p-4 transition-colors"
    >
      <div className="w-full max-w-md space-y-8">
        {/* Logo y título */}
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <div className="bg-primary text-primary-foreground rounded-full p-3">
              <School className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">ECEP</h1>
          <p className="text-muted-foreground mt-2">
            Escuela Complejo Evangelico Pilar
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Sistema de Gestión Escolar
          </p>
        </div>

        {/* Formulario de login */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-4">
            {isValidEmail && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleGoBackToEmail}
                disabled={isLoggingIn}
                className="self-start"
              >
                Volver
              </Button>
            )}
            <div className="space-y-2 text-center">
              <CardTitle className="text-2xl text-center text-foreground">
                Iniciar Sesión
              </CardTitle>
              <CardDescription className="text-center">
                Ingrese sus credenciales para acceder al sistema
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={!isValidEmail ? handleEmailSubmit : handleLogin}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="nombre@ecep.edu.ar"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isValidEmail}
                    required
                  />
                </div>
              </div>

              {isValidEmail && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Mínimo 8 caracteres, 2 números y 1 símbolo especial
                    </p>
                  </div>

                </>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={
                  (!isValidEmail && isCheckingEmail) ||
                  (isValidEmail && isLoggingIn)
                }
              >
                {!isValidEmail
                  ? isCheckingEmail
                    ? "Verificando..."
                    : "Continuar"
                  : isLoggingIn
                    ? "Ingresando..."
                    : "Ingresar"}
              </Button>
            </form>

            {!isValidEmail && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-background px-2 text-muted-foreground">o</span>
                  </div>
                </div>

                <Link href="/solicitud">
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
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-4">
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
