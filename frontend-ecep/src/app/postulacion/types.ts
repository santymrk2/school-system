export type FamiliarPersonaForm = {
  personaId?: number | null;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  genero: string;
  estadoCivil: string;
  nacionalidad: string;
  domicilio: string;
  telefono: string;
  celular: string;
  email: string;
  emailContacto: string;
  lugarTrabajo: string;
  ocupacion: string;
};

export type FamiliarForm = {
  id?: number;
  tipoRelacion: string;
  viveConAlumno: boolean;
  familiar: FamiliarPersonaForm;
  dniLocked?: boolean;
};

export type PostulacionFormData = {
  personaId?: number | null;
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  cursoSolicitado?: string;
  turnoPreferido?: string;
  escuelaActual?: string;
  domicilio?: string;
  nacionalidad?: string;
  conectividadInternet?: string;
  dispositivosDisponibles?: string;
  idiomasHabladosHogar?: string;
  enfermedadesAlergias?: string;
  medicacionHabitual?: string;
  limitacionesFisicasNeurologicas?: string;
  tratamientosTerapeuticos?: string;
  usoAyudasMovilidad?: boolean;
  coberturaMedica?: string;
  observacionesAdicionalesSalud?: string;
  familiares: FamiliarForm[];
};
