import type { ApprovalSection } from "./types";

export const PIE_COLORS = ["#0ea5e9", "#fb7185", "#6366f1", "#22c55e"] as const;

export const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const APPROVAL_DATA = {
  summary: {
    totalSubjects: 0,
    approved: 0,
    failed: 0,
    subjectWithMoreFails: "Sin datos",
    studentsWithPending: 0,
  },
  sections: [] as ApprovalSection[],
} as const;
