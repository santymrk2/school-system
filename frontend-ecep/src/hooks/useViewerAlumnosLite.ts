"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { normalizeRole } from "@/lib/auth-roles";
import { api } from "@/services/api";
import type {
  AlumnoDTO,
  AlumnoLiteDTO,
  MatriculaDTO,
  NivelAcademico,
  SeccionDTO,
  UserRole,
} from "@/types/api-generated";
import { NivelAcademico as NivelAcademicoEnum, UserRole as UserRoleEnum } from "@/types/api-generated";

interface ViewerAlumnosState {
  alumnos: AlumnoLiteDTO[];
  loading: boolean;
  error: string | null;
}

function inferNivel(
  seccion: Partial<SeccionDTO> | null | undefined,
  nombre?: string | null,
): NivelAcademico | null {
  if (seccion?.nivel) return seccion.nivel;
  const base = (nombre ?? "").toLowerCase();
  if (!base) return null;
  if (base.includes("sala")) return NivelAcademicoEnum.INICIAL;
  return NivelAcademicoEnum.PRIMARIO;
}

async function fetchStudentAlumnosLite(personaId: number) {
  const [alumnosRes, matriculasRes, seccionesRes] = await Promise.all([
    api.alumnos
      .list()
      .catch(() => ({ data: [] as AlumnoDTO[] })),
    api.matriculas
      .list()
      .catch(() => ({ data: [] as MatriculaDTO[] })),
    api.secciones
      .list()
      .catch(() => ({ data: [] as SeccionDTO[] })),
  ]);

  const alumnos = alumnosRes.data ?? [];
  const alumno = alumnos.find((a) => a.personaId === personaId);
  if (!alumno || !alumno.id) {
    throw new Error("No se encontró la información del alumno actual.");
  }

  const matriculas = (matriculasRes.data ?? []).filter(
    (m) => m.alumnoId === alumno.id,
  );
  if (!matriculas.length) {
    throw new Error("No se encontró una matrícula activa para el alumno.");
  }

  const matricula = [...matriculas]
    .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
    .find((m) => !!m.id);
  if (!matricula?.id) {
    throw new Error("La matrícula del alumno no es válida.");
  }

  const secciones = seccionesRes.data ?? [];
  const seccion = secciones.find((s) => s.id === alumno.seccionActualId) ?? null;

  const nombreCompleto = [alumno.apellido, alumno.nombre]
    .filter(Boolean)
    .join(", ")
    .trim();

  const lite: AlumnoLiteDTO = {
    matriculaId: matricula.id,
    alumnoId: alumno.id,
    nombreCompleto: nombreCompleto || `Alumno #${alumno.id}`,
    seccionId: alumno.seccionActualId ?? seccion?.id ?? null,
    seccionNombre:
      alumno.seccionActualNombre ??
      (seccion
        ? `${seccion.gradoSala ?? ""} ${seccion.division ?? ""}`.trim() ||
          seccion.nombre ??
          null
        : null),
    nivel: inferNivel(seccion, alumno.seccionActualNombre),
  };

  return [lite];
}

export function useViewerAlumnosLite(): {
  role: UserRole | null;
  alumnos: AlumnoLiteDTO[];
  loading: boolean;
  error: string | null;
} {
  const { user, selectedRole } = useAuth();
  const personaId = user?.personaId ?? null;

  const normalizedRole = useMemo(() => {
    if (selectedRole) return selectedRole;
    const raw = user?.roles?.[0];
    return raw ? normalizeRole(raw) : null;
  }, [selectedRole, user]);

  const [state, setState] = useState<ViewerAlumnosState>({
    alumnos: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    let alive = true;

    async function resolve() {
      if (
        !personaId ||
        normalizedRole == null ||
        (normalizedRole !== UserRoleEnum.FAMILY &&
          normalizedRole !== UserRoleEnum.STUDENT)
      ) {
        if (alive) {
          setState({ alumnos: [], loading: false, error: null });
        }
        return;
      }

      setState({ alumnos: [], loading: true, error: null });

      try {
        if (normalizedRole === UserRoleEnum.FAMILY) {
          const res = await api.familiaresAlumnos.byFamiliarId(personaId);
          if (!alive) return;
          setState({ alumnos: res.data ?? [], loading: false, error: null });
          return;
        }

        const alumnosLite = await fetchStudentAlumnosLite(personaId);
        if (!alive) return;
        setState({ alumnos: alumnosLite, loading: false, error: null });
      } catch (error: any) {
        if (!alive) return;
        setState({
          alumnos: [],
          loading: false,
          error:
            error?.response?.data?.message ??
            error?.message ??
            "No se pudo obtener la información académica.",
        });
      }
    }

    resolve();

    return () => {
      alive = false;
    };
  }, [normalizedRole, personaId]);

  return { role: normalizedRole, ...state };
}
