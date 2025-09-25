export type BoletinSubjectGrade = {
  trimestreId: number;
  trimestreLabel: string;
  notaNumerica?: number | null;
  notaConceptual?: string | null;
  observaciones?: string | null;
};

export type BoletinSubject = {
  id: string;
  name: string;
  teacher?: string | null;
  grades: BoletinSubjectGrade[];
};

export type BoletinInforme = {
  trimestreId: number;
  trimestreLabel: string;
  descripcion: string;
};

export type BoletinAttendance = {
  workingDays: number;
  attended: number;
  justified: number;
  unjustified: number;
};

export type BoletinStudent = {
  id: string;
  matriculaId: number | null;
  alumnoId: number | null;
  name: string;
  section: string;
  sectionId: number;
  level: "Inicial" | "Primario";
  average?: number | null;
  attendancePercentage?: number | null;
  absencePercentage?: number | null;
  attendanceDetail?: BoletinAttendance | null;
  status?: string;
  subjects: BoletinSubject[];
  informes?: BoletinInforme[];
};

export type BoletinSection = {
  id: number;
  label: string;
  level: "Inicial" | "Primario";
  students: BoletinStudent[];
};

export type ApprovalSummary = {
  totalSubjects: number;
  approved: number;
  failed: number;
  subjectWithMoreFails: string;
  studentsWithPending: number;
};

export type ApprovalRecord = {
  studentId: string;
  studentName: string;
  subject: string;
  grade: number;
  status: "APROBADO" | "DESAPROBADO";
  average: number;
  failedCount: number;
};

export type ApprovalSection = {
  id: string;
  label: string;
  stats: {
    approved: number;
    failed: number;
    averageApprovedPerStudent: number;
  };
  records: ApprovalRecord[];
};

export type AttendanceSummaryStudent = {
  id: string;
  name: string;
  total: number;
  presentes: number;
  ausentes: number;
  tarde: number;
  retiroAnticipado: number;
  attendance: number;
};

export type AttendanceSummarySection = {
  sectionId: string;
  label: string;
  level: "Inicial" | "Primario";
  students: AttendanceSummaryStudent[];
  totalDays: number;
  attended: number;
};

export type LicenseReportRow = {
  id: string;
  teacherId: number | null;
  teacherName: string;
  cargo?: string;
  situacion?: string;
  tipo: string;
  tipoLabel: string;
  start: string;
  end: string | null;
  startLabel: string;
  endLabel: string | null;
  rangeLabel: string;
  durationDays: number | null;
  horas: number | null;
  justificada: boolean;
  motivo: string;
  isActive: boolean;
  expiresSoon: boolean;
};

export type ActaRegistro = {
  id: string;
  student: string;
  studentDni?: string | null;
  section: string;
  level: "Inicial" | "Primario";
  teacher: string;
  date: string;
  time: string;
  location: string;
  description: string;
  actions: string;
  signer?: string;
  signerDni?: string | null;
  signed: boolean;
  familyName?: string | null;
  familyDni?: string | null;
};

export type CachedAlumnoInfo = {
  name: string;
  section: string;
  level: "Inicial" | "Primario";
  dni?: string | null;
  familyName?: string | null;
  familyDni?: string | null;
};
