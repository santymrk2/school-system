"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";

const ROLES_STAFF = new Set(["ADMIN", "DIRECTOR", "SECRETARY"]);

export function useViewerScope() {
  const { user } = useAuth();
  const roles = (user?.roles ?? []).map((r: any) => String(r).toUpperCase());

  return useMemo(() => {
    const isStaff = roles.some((r) => ROLES_STAFF.has(r));
    const isTeacher = roles.includes("TEACHER");
    const isFamily = roles.includes("FAMILY");

    // prioridad: si es staff, lo tratamos como staff (aunque también sea teacher)
    const type: "staff" | "teacher" | "family" | "guest" = isStaff
      ? "staff"
      : isTeacher
        ? "teacher"
        : isFamily
          ? "family"
          : "guest";

    return {
      type,
      roles,
      // personaId = Personal.id para teacher, Familiar.id para family (según tu backend)
      personaId: user?.personaId ?? null,
      user,
    };
  }, [roles, user]);
}
