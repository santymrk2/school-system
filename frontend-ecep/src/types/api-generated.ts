// types/api-generated.ts — AUTO-GENERATED from backend DTOs and Enums (2025-02-09)
// Conventions:
//  - ISODate = 'YYYY-MM-DD' (LocalDate)
//  - ISODateTime = ISO 8601 string (OffsetDateTime/LocalDateTime)
//  - IDs are numbers (Long/Integer). Adjust to string if needed for BigInt safety.

export type ISODate = string;
export type ISODateTime = string;
export type ISOTime = string;
export enum RolMateria {
  TITULAR = "TITULAR",
  SUPLENTE = "SUPLENTE",
}

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  STUDENT = "STUDENT",
  FAMILY = "FAMILY",
  TEACHER = "TEACHER",
  DIRECTOR = "DIRECTOR",
  SECRETARY = "SECRETARY",
  COORDINATOR = "COORDINATOR",
  ALTERNATE = "ALTERNATE",
}

export enum EstadoMatricula {
  REGULAR = "REGULAR",
  REPITE = "REPITE",
  EGRESO = "EGRESO",
  BAJA = "BAJA",
  EN_CURSO = "EN_CURSO",
}

export enum MedioPago {
  EFECTIVO = "EFECTIVO",
  TRANSFERENCIA = "TRANSFERENCIA",
  TARJETA = "TARJETA",
  MERCADO_PAGO = "MERCADO_PAGO",
  OTRO = "OTRO",
}

export enum ConceptoCuota {
  MENSUALIDAD = "MENSUALIDAD",
  MATRICULA = "MATRICULA",
  MATERIALES = "MATERIALES",
  OTROS = "OTROS",
}

export enum Turno {
  MANANA = "MANANA",
  TARDE = "TARDE",
}

export enum EstadoCuota {
  PENDIENTE = "PENDIENTE",
  VENCIDA = "VENCIDA",
  PAGADA = "PAGADA",
  PARCIAL = "PARCIAL",
}

export enum NivelAcademico {
  INICIAL = "INICIAL",
  PRIMARIO = "PRIMARIO",
}

export enum CalificacionConceptual {
  EXCELENTE = "EXCELENTE",
  MUY_BUENO = "MUY_BUENO",
  BUENO = "BUENO",
  REGULAR = "REGULAR",
  INSUFICIENTE = "INSUFICIENTE",
}

export enum RolEmpleado {
  DIRECCION = "DIRECCION",
  ADMINISTRACION = "ADMINISTRACION",
  SECRETARIA = "SECRETARIA",
  DOCENTE = "DOCENTE",
}

export enum EstadoPago {
  EN_REVISION = "EN_REVISION",
  ACREDITADO = "ACREDITADO",
  RECHAZADO = "RECHAZADO",
}

export enum EstadoActaAccidente {
  BORRADOR = "BORRADOR",
  CERRADA = "CERRADA",
}

export enum EstadoSolicitudBaja {
  PENDIENTE = "PENDIENTE",
  APROBADA = "APROBADA",
  RECHAZADA = "RECHAZADA",
}

export enum RolSeccion {
  MAESTRO_TITULAR = "MAESTRO_TITULAR",
  SUPLENTE = "SUPLENTE",
  PRECEPTOR = "PRECEPTOR",
  AUXILIAR = "AUXILIAR",
}

export enum RolVinculo {
  PADRE = "PADRE",
  MADRE = "MADRE",
  TUTOR = "TUTOR",
  OTRO = "OTRO",
}

export enum Curso {
  PRIMERO = "PRIMERO",
  SEGUNDO = "SEGUNDO",
  TERCERO = "TERCERO",
  CUARTO = "CUARTO",
  QUINTO = "QUINTO",
  SEXTO = "SEXTO",
  SALA_4 = "SALA_4",
  SALA_5 = "SALA_5",
}

export enum AlcanceComunicado {
  INSTITUCIONAL = "INSTITUCIONAL",
  POR_NIVEL = "POR_NIVEL",
  POR_SECCION = "POR_SECCION",
}

export enum EstadoAsistencia {
  PRESENTE = "PRESENTE",
  AUSENTE = "AUSENTE",
  TARDE = "TARDE",
  RETIRO_ANTICIPADO = "RETIRO_ANTICIPADO",
}
export interface ActaAccidenteCreateDTO {
  id?: number;
  alumnoId?: number;
  fechaSuceso?: ISODate;
  descripcion?: string;
  informanteId?: number;
  horaSuceso?: ISOTime;
  lugar?: string;
  acciones?: string;
  firmanteId?: number;
  creadoPor?: string;
}

export interface ActaAccidenteDTO {
  id: number;
  alumnoId?: number;
  fechaSuceso?: ISODate;
  descripcion?: string;
  horaSuceso?: ISOTime;
  lugar?: string;
  acciones?: string;
  estado?: EstadoActaAccidente;
  creadoPor?: string;
  informanteId?: number;
  firmanteId?: number;
}

export interface ActaAccidenteUpdateDTO {
  fechaSuceso: ISODate;
  horaSuceso: ISOTime;
  lugar: string;
  descripcion: string;
  acciones: string;
  estado: EstadoActaAccidente;
  firmanteId?: number;
  creadoPor?: string;
}

export interface AlumnoDTO {
  id?: number;
  personaId?: number;
  fechaInscripcion?: ISODate;
  observacionesGenerales?: string;
  motivoRechazoBaja?: string;
  nombre?: string;
  apellido?: string;
  dni?: string;
  seccionActualId?: number;
  seccionActualNombre?: string;
}

export interface AlumnoFamiliarCreateDTO {
  id?: number;
  alumnoId?: number;
  familiarId?: number;
  parentesco?: string;
  convive?: boolean;
}

export interface AlumnoFamiliarDTO {
  id: number;
  alumnoId?: number;
  familiarId?: number;
  parentesco?: string;
  convive?: boolean;
}

export interface AsignacionDocenteMateriaCreateDTO {
  id?: number;
  empleadoId?: number;
  seccionMateriaId?: number;
  rol?: RolMateria;
  vigenciaDesde?: ISODate;
  vigenciaHasta?: ISODate;
}

export interface AsignacionDocenteMateriaDTO {
  id: number;
  empleadoId?: number;
  seccionMateriaId?: number;
  rol?: RolMateria;
  vigenciaDesde?: ISODate;
  vigenciaHasta?: ISODate;
}

export interface AsignacionDocenteSeccionCreateDTO {
  id?: number;
  seccionId?: number;
  empleadoId?: number;
  rol?: RolSeccion;
  vigenciaDesde?: ISODate;
  vigenciaHasta?: ISODate;
}

export interface AsignacionDocenteSeccionDTO {
  id: number;
  seccionId?: number;
  empleadoId?: number;
  rol?: RolSeccion;
  vigenciaDesde?: ISODate;
  vigenciaHasta?: ISODate;
}

export interface AsistenciaAcumuladoDTO {
  id: number;
  totalClases?: number;
  presentes?: number;
  ausentes?: number;
  tarde?: number;
  retiroAnticipado?: number;
  porcentaje?: number;
}

export interface AsistenciaAlumnoResumenDTO {
  id: number;
  alumnoId?: number;
  nombreCompleto?: string;
  dni?: string;
  totalClases?: number;
  presentes?: number;
  ausentes?: number;
  tarde?: number;
  retiroAnticipado?: number;
  porcentaje?: number;
}

export interface AsistenciaDiaDTO {
  id: number;
  fecha?: ISODate;
  presentes?: number;
  ausentes?: number;
  tarde?: number;
  retiroAnticipado?: number;
  total?: number;
  porcentaje?: number;
}

export interface AsistenciaEmpleadoCreateDTO {
  id?: number;
  empleadoId?: number;
  fecha?: ISODate;
  estado?: string;
  observaciones?: string;
}

export interface AsistenciaEmpleadoDTO {
  id: number;
  empleadoId?: number;
  fecha?: ISODate;
  estado?: string;
  observaciones?: string;
}

export interface AspiranteDTO {
  id: number;
  personaId?: number;
  turnoPreferido?: Turno;
  escuelaActual?: string;
  conectividadInternet?: string;
  dispositivosDisponibles?: string;
  idiomasHabladosHogar?: string;
  enfermedadesAlergias?: string;
  medicacionHabitual?: string;
  limitacionesFisicas?: string;
  tratamientosTerapeuticos?: string;
  usoAyudasMovilidad?: boolean;
  coberturaMedica?: string;
  observacionesSalud?: string;
  cursoSolicitado?: Curso;
}

export interface AspiranteFamiliarDTO {
  id: number;
  aspiranteId?: number;
  familiarId?: number;
  parentesco?: string;
  convive?: boolean;
}

export interface ChatMessageDTO {
  id: number;
  emisorId?: number;
  receptorId?: number;
  contenido?: string;
  fechaEnvio?: ISODateTime;
  leido?: boolean;
}

export interface ComunicadoCreateDTO {
  id?: number;
  alcance?: AlcanceComunicado;
  seccionId?: number;
  nivel?: NivelAcademico;
  titulo?: string;
  cuerpo?: string;
  fechaProgPublicacion?: ISODateTime;
}

export interface ComunicadoDTO {
  id: number;
  alcance?: AlcanceComunicado;
  seccionId?: number;
  nivel?: NivelAcademico;
  titulo?: string;
  cuerpo?: string;
  fechaProgPublicacion?: ISODateTime;
  publicado?: boolean;
  fechaPublicacion?: ISODateTime;
  fechaCreacion?: ISODateTime;
}

export interface CuotaCreateDTO {
  id?: number;
  matriculaId?: number;
  emisionId?: number;
  concepto?: ConceptoCuota;
  subconcepto?: string;
  anio?: number;
  mes?: number;
  importe?: number;
  fechaVencimiento?: ISODate;
  porcentajeRecargo?: number;
  codigoPago?: string;
  observaciones?: string;
}

export interface CuotaBulkCreateDTO {
  seccionIds: number[];
  concepto?: ConceptoCuota;
  subconcepto?: string;
  anio?: number;
  mes?: number;
  importe: number;
  fechaVencimiento: ISODate;
  porcentajeRecargo?: number;
  observaciones?: string;
  matricula?: boolean;
}

export interface CuotaDTO {
  id: number;
  matriculaId?: number;
  emisionId?: number;
  concepto?: ConceptoCuota;
  subconcepto?: string;
  anio?: number;
  mes?: number;
  importe?: number;
  fechaVencimiento?: ISODate;
  porcentajeRecargo?: number;
  estado?: EstadoCuota;
  codigoPago?: string;
  observaciones?: string;
}

export interface DetalleAsistenciaCreateDTO {
  id?: number;
  jornadaId?: number;
  matriculaId?: number;
  estado?: EstadoAsistencia;
  observacion?: string;
}

export interface DetalleAsistenciaDTO {
  id: number;
  jornadaId?: number;
  matriculaId?: number;
  estado?: EstadoAsistencia;
  observacion?: string;
}

export interface DetalleAsistenciaUpdateDTO {
  estado: EstadoAsistencia;
  observacion?: string;
}

export interface EmisionCuotaCreateDTO {
  id?: number;
  fechaEmision?: ISODateTime;
  anio?: number;
  mes?: number;
  concepto?: ConceptoCuota;
  subconcepto?: string;
  porcentajeRecargoDefault?: number;
  creadoPor?: string;
  criterios?: string;
}

export interface EmisionCuotaDTO {
  id: number;
  fechaEmision?: ISODateTime;
  anio?: number;
  mes?: number;
  concepto?: ConceptoCuota;
  subconcepto?: string;
  porcentajeRecargoDefault?: number;
  creadoPor?: string;
  criterios?: string;
}

export interface EmpleadoCreateDTO {
  id?: number;
  personaId?: number;
  rolEmpleado?: RolEmpleado;
  cuil?: string;
  legajo?: string;
  condicionLaboral?: string;
  cargo?: string;
  situacionActual?: string;
  fechaIngreso?: ISODate;
  antecedentesLaborales?: string;
  observacionesGenerales?: string;
}

export interface EmpleadoDTO {
  id: number;
  personaId?: number;
  rolEmpleado?: RolEmpleado;
  cuil?: string;
  legajo?: string;
  fechaIngreso?: ISODate;
  condicionLaboral?: string;
  cargo?: string;
  situacionActual?: string;
  antecedentesLaborales?: string;
  observacionesGenerales?: string;
}

export interface EmpleadoUpdateDTO {
  id?: number;
  personaId?: number;
  rolEmpleado?: RolEmpleado;
  cuil?: string;
  legajo?: string;
  condicionLaboral?: string;
  cargo?: string;
  situacionActual?: string;
  fechaIngreso?: ISODate;
  antecedentesLaborales?: string;
  observacionesGenerales?: string;
}

export interface InformeInicialCreateDTO {
  id?: number;
  trimestreId?: number;
  matriculaId?: number;
  descripcion?: string;
}

export interface InformeInicialDTO {
  id: number;
  trimestreId?: number;
  matriculaId?: number;
  descripcion?: string;
}

export interface JornadaAsistenciaCreateDTO {
  id?: number;
  seccionId?: number;
  trimestreId?: number;
  fecha?: ISODate;
}

export interface JornadaAsistenciaDTO {
  id: number;
  seccionId?: number;
  trimestreId?: number;
  fecha?: ISODate;
}

export interface LicenciaCreateDTO {
  id?: number;
  empleadoId?: number;
  tipoLicencia?: string;
  fechaInicio?: ISODate;
  fechaFin?: ISODate;
  motivo?: string;
  justificada?: boolean;
  horasAusencia?: number;
  observaciones?: string;
}

export interface LicenciaDTO {
  id: number;
  empleadoId?: number;
  tipoLicencia?: string;
  fechaInicio?: ISODate;
  fechaFin?: ISODate;
  motivo?: string;
  justificada?: boolean;
  horasAusencia?: number;
  observaciones?: string;
}

export interface MateriaCreateDTO {
  id?: number;
  codigo?: string;
  nombre?: string;
}

export interface MateriaDTO {
  id: number;
  codigo?: string;
  nombre?: string;
}

export interface MatriculaCreateDTO {
  id?: number;
  alumnoId?: number;
  periodoEscolarId?: number;
}

export interface MatriculaDTO {
  id: number;
  alumnoId?: number;
  periodoEscolarId?: number;
}

export interface MatriculaSeccionHistorialCreateDTO {
  id?: number;
  matriculaId?: number;
  seccionId?: number;
  desde?: ISODate;
  hasta?: ISODate;
}

export interface MatriculaSeccionHistorialDTO {
  id: number;
  matriculaId?: number;
  seccionId?: number;
  desde?: ISODate;
  hasta?: ISODate;
}

export interface MensajeDTO {
  id: number;
  fechaEnvio?: ISODateTime;
  asunto?: string;
  contenido?: string;
  leido?: boolean;
  emisor?: number;
  receptor?: number;
}

export interface PagoCuotaDTO {
  id: number;
  cuotaId?: number;
  medioPago?: MedioPago;
  estadoPago?: EstadoPago;
  montoPagado?: number;
  fechaPago?: ISODateTime;
  fechaAcreditacion?: ISODateTime;
  referenciaExterna?: string;
  comprobanteArchivoId?: string;
}

export interface PagoCuotaEstadoUpdateDTO {
  id?: number;
  estadoPago?: EstadoPago;
  fechaAcreditacion?: ISODateTime;
}

export interface PeriodoEscolarCreateDTO {
  id?: number;
  anio?: number;
  fechaInicio?: ISODate;
  fechaFin?: ISODate;
  activo?: boolean;
}

export interface PeriodoEscolarDTO {
  id: number;
  anio?: number;
  fechaInicio?: ISODate;
  fechaFin?: ISODate;
  activo?: boolean;
}

export interface PersonaDTO {
  id: number;
  nombre?: string;
  apellido?: string;
  dni?: string;
  cuil?: string;
  fechaNacimiento?: ISODate;
  genero?: string;
  estadoCivil?: string;
  nacionalidad?: string;
  domicilio?: string;
  telefono?: string;
  celular?: string;
  email?: string;
  fotoPerfilUrl?: string;
  observacionesGenerales?: string;
  roles?: UserRole[];
  credencialesActivas?: boolean;
}

export interface PersonaCreateDTO {
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento?: ISODate;
  genero?: string;
  estadoCivil?: string;
  nacionalidad?: string;
  domicilio?: string;
  telefono?: string;
  celular?: string;
  email?: string;
  fotoPerfilUrl?: string;
  password?: string;
  roles?: UserRole[];
}

export interface PersonaUpdateDTO {
  id?: number;
  nombre?: string;
  apellido?: string;
  dni?: string;
  cuil?: string;
  fechaNacimiento?: ISODate;
  genero?: string;
  estadoCivil?: string;
  nacionalidad?: string;
  domicilio?: string;
  telefono?: string;
  celular?: string;
  email?: string;
  fotoPerfilUrl?: string;
  observacionesGenerales?: string;
  password?: string;
  roles?: UserRole[];
}

export interface PersonaFotoUploadResponse {
  url: string;
  fileName: string;
  size: number;
}

export interface ReciboSueldoCreateDTO {
  id?: number;
  empleadoId?: number;
  anio?: number;
  mes?: number;
  bruto?: number;
  neto?: number;
  recibiConforme?: boolean;
  fechaConfirmacion?: ISODateTime;
  obsConfirmacion?: string;
  comprobanteArchivoId?: string;
}

export interface ReciboSueldoDTO {
  id: number;
  empleadoId?: number;
  anio?: number;
  mes?: number;
  bruto?: number;
  neto?: number;
  recibiConforme?: boolean;
  fechaConfirmacion?: ISODateTime;
  obsConfirmacion?: string;
  comprobanteArchivoId?: string;
}

export interface EvaluacionCreateDTO {
  id?: number;
  seccionMateriaId?: number;
  trimestreId?: number;
  fecha?: ISODate;
  tema?: string;
  peso?: number;
}

export interface EvaluacionDTO {
  id: number;
  seccionMateriaId?: number;
  trimestreId?: number;
  fecha?: ISODate;
  tema?: string;
  peso?: number;
}

export interface ResultadoEvaluacionCreateDTO {
  id?: number;
  evaluacionId?: number;
  matriculaId?: number;
  notaNumerica?: number | null;
  notaConceptual?: string | null;
  observaciones?: string | null;
}

export interface ResultadoEvaluacionDTO {
  id: number;
  evaluacionId?: number;
  matriculaId?: number;
  notaNumerica?: number | null;
  notaConceptual?: string | null;
  observaciones?: string | null;
}

export interface ResultadoEvaluacionUpdateDTO {
  notaNumerica?: number | null;
  notaConceptual?: string | null;
  observaciones?: string | null;
}

export interface SeccionCreateDTO {
  id?: number;
  periodoEscolarId?: number;
  nivel?: NivelAcademico;
  gradoSala?: string;
  division?: string;
  turno?: Turno;
}

export interface SeccionDTO {
  id: number;
  periodoEscolarId?: number;
  nivel?: NivelAcademico;
  gradoSala?: string;
  division?: string;
  turno?: Turno;
}

export interface SeccionMateriaCreateDTO {
  id?: number;
  seccionId?: number;
  materiaId?: number;
}

export interface SeccionMateriaDTO {
  id: number;
  seccionId?: number;
  materiaId?: number;
}

export interface SolicitudAdmisionDTO {
  id: number;
  aspiranteId?: number;
  aspirante?: AspiranteDTO;
  fechaSolicitud?: ISODate;
  estado?: string;
  observaciones?: string;
  disponibilidadCurso?: string;
  cupoDisponible?: boolean;
  fechasPropuestas?: ISODate[];
  rangosHorariosPropuestos?: string[];
  aclaracionesPropuesta?: string;
  fechaLimiteRespuesta?: ISODate;
  fechaRespuestaFamilia?: ISODate;
  fechaEntrevistaConfirmada?: ISODate;
  entrevistaRealizada?: boolean;
  emailConfirmacionEnviado?: boolean;
  documentosRequeridos?: string;
  adjuntosInformativos?: string[];
  notasDireccion?: string;
  comentariosEntrevista?: string;
  motivoRechazo?: string;
  puedeSolicitarReprogramacion?: boolean;
  reprogramacionSolicitada?: boolean;
  comentarioReprogramacion?: string;
  cantidadPropuestasEnviadas?: number;
}

export interface SolicitudAdmisionProgramarDTO {
  fechasPropuestas: ISODate[];
  documentosRequeridos?: string;
  adjuntosInformativos?: string[];
  cupoDisponible?: boolean;
  disponibilidadCurso?: string;
  rangosHorarios: string[];
  aclaracionesDireccion?: string;
}

export interface SolicitudAdmisionRechazoDTO {
  motivo: string;
}

export interface SolicitudAdmisionSeleccionDTO {
  fechaSeleccionada: ISODate;
}

export interface SolicitudAdmisionEntrevistaDTO {
  realizada?: boolean;
  comentarios?: string;
}

export interface SolicitudAdmisionReprogramacionDTO {
  comentario: string;
}

export interface SolicitudAdmisionDecisionDTO {
  aceptar: boolean;
  mensaje?: string;
}

export interface SolicitudBajaAlumnoCreateDTO {
  id?: number;
  matriculaId?: number;
  motivo?: string;
}

export interface SolicitudBajaAlumnoDTO {
  id: number;
  matriculaId?: number;
  estado?: EstadoSolicitudBaja;
  motivo?: string;
  motivoRechazo?: string;
  fechaDecision?: ISODateTime;
  decididoPor?: number;
}

export interface TrimestreCreateDTO {
  id?: number;
  periodoEscolarId?: number;
  orden?: number;
  inicio?: ISODate;
  fin?: ISODate;
}

export type TrimestreEstadoApi = "activo" | "inactivo" | "cerrado";

export interface TrimestreDTO {
  id: number;
  periodoEscolarId?: number;
  orden?: number;
  inicio?: ISODate;
  fin?: ISODate;
  estado?: TrimestreEstadoApi | null;
  cerrado?: boolean;
}

export interface PersonaResumenDTO {
  id: number;
  personaId?: number | null;
  email?: string;
  roles?: UserRole[];
  nombre?: string;
  apellido?: string;
  nombreCompleto?: string | null;
  dni?: string;
  tipoPersona?: string;
}

export interface AuthResponse {
  token: string;
  personaId: number;
  email?: string;
  roles?: UserRole[];
  nombre?: string;
  apellido?: string;
  nombreCompleto?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AlumnoLiteDTO {
  matriculaId: number;
  alumnoId: number;
  nombreCompleto: string; // "Apellido, Nombre"
  seccionId?: number | null;
  seccionNombre?: string | null;
  nivel?: NivelAcademico | null;
}
export interface FormacionAcademicaDTO {
  id: number;
  empleadoId: number; // FK -> Empleado
  nivel: string; // libre en back
  institucion: string;
  tituloObtenido: string;
  fechaInicio: string; // ISO (yyyy-MM-dd)
  fechaFin?: string | null; // ISO o null
}

export type FormacionAcademicaCreateDTO = Omit<FormacionAcademicaDTO, "id">;

export interface FamiliarDTO {
  id: number; // == personaId
  personaId: number;
  // campos propios de Familiar (si existen):
  // ocupacion?: string | null;
  // observaciones?: string | null;
}
export interface FamiliarCreateDTO extends Omit<FamiliarDTO, "id"> {}
export interface FamiliarUpdateDTO extends Partial<FamiliarCreateDTO> {}
