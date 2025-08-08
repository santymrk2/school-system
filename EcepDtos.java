package edu.ecep.base_app.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

public final class EcepDtos {

    /* ========== MÓDULO 1 – GESTIÓN DE ALUMNOS ========== */

    /* POST /api/aspirantes */
    @Data @Builder
    public static class AspiranteCreateRequest {
        private String nombre;
        private String apellido;
        private String dni;
        private LocalDate fechaNacimiento;
        private String cursoSolicitado;  // INICIAL o PRIMARIO
        private String turnoPreferido;    // MANANA, TARDE, NOCHE
        private String escuelaActual;
        private String domicilio;
        private String nacionalidad;
        private String conectividadInternet;
        private String dispositivosDisponibles;
        private String idiomasHabladosHogar;
        private String enfermedadesAlergias;
        private String medicacionHabitual;
        private String limitacionesFisicas;
        private String tratamientosTerapeuticos;
        private Boolean usoAyudasMovilidad;
        private String coberturaMedica;
        private String observacionesSalud;
        private Set<FamiliarCreateRequest> familiares;
    }

    @Data @Builder
    public static class FamiliarCreateRequest {
        private String tipoRelacion;
        private Boolean viveConAlumno;
        private String nombre;
        private String apellido;
        private String dni;
        private String email;
        private String telefono;
        private String domicilio;
        private String profesion;
        private String lugarTrabajo;
    }

    /* GET /api/aspirantes/{id} */
    @Data
    public static class AspiranteResponse {
        private Long id;
        private String nombreCompleto;
        private String dni;
        private LocalDate fechaNacimiento;
        private String cursoSolicitado;
        private String turnoPreferido;
        private String estado;
        private List<FamiliarResponse> familiares;
    }

    @Data
    public static class FamiliarResponse {
        private Long id;
        private String tipoRelacion;
        private Boolean viveConAlumno;
        private String nombreCompleto;
        private String email;
        private String telefono;
    }

    /* PUT /api/aspirantes/{id}/entrevista */
    @Data
    public static class EntrevistaUpdateRequest {
        private LocalDate fechaEntrevista;
        private Boolean entrevistaRealizada;
        private String observaciones;
        private Boolean aceptado;
        private String motivoRechazo;
    }

    /* ========== MÓDULO 3 – EVALUACIONES ========== */

    /* POST /api/evaluaciones */
    @Data
    public static class EvaluacionCreateRequest {
        private Long seccionId;
        private Long materiaId;
        private LocalDate fecha;
        private String tipo;
        private String descripcion;
    }

    /* PUT /api/calificaciones */
    @Data
    public static class CalificacionUpdateRequest {
        private Long matriculaId;
        private Long evaluacionId;
        private String valor;
        private String observaciones;
    }

    /* GET /api/secciones/{id}/notas */
    @Data
    public static class NotaAlumnoResponse {
        private Long alumnoId;
        private String nombreCompleto;
        private String nota;
        private String observaciones;
    }

    /* Informes Inicial */
    @Data
    public static class InformeInicialRequest {
        private Long matriculaId;
        private String trimestre;
        private String contenido;
    }

    @Data
    public static class InformeInicialResponse {
        private Long id;
        private String trimestre;
        private String contenido;
        private LocalDate fecha;
        private String reportadoPor;
    }

    /* ========== MÓDULO 4 – ASISTENCIA ========== */

    /* POST /api/asistencias/dia */
    @Data
    public static class AsistenciaDiaCreateRequest {
        private Long seccionId;
        private LocalDate fecha;
    }

    /* PUT /api/asistencias/registro */
    @Data
    public static class RegistroAsistenciaRequest {
        private Long asistenciaDiaId;
        private Long matriculaId;
        private Boolean presente;
        private String justificacion;
    }

    /* GET /api/secciones/{id}/asistencia/porcentaje */
    @Data
    public static class AsistenciaAlumnoResponse {
        private String nombreCompleto;
        private BigDecimal porcentajeAsistencia;
        private Long diasAsistidos;
        private Long diasAusentes;
    }

    /* ========== MÓDULO 5 – GESTIÓN DE PERSONAL ========== */

    /* POST /api/personal */
    @Data
    public static class PersonalCreateRequest {
        private String nombre;
        private String apellido;
        private String dni;
        private String cuil;
        private LocalDate fechaNacimiento;
        private String genero;
        private String estadoCivil;
        private String nacionalidad;
        private String domicilio;
        private String telefono;
        private String celular;
        private String email;
        private String legajo;
        private LocalDate fechaIngreso;
        private String condicionLaboral;
        private String cargo;
        private String situacionActual;
        private List<FormacionAcademicaRequest> formaciones;
        private String antecedentesLaborales;
        private String observaciones;
    }

    @Data
    public static class FormacionAcademicaRequest {
        private String nivel;
        private String institucion;
        private String titulo;
        private LocalDate fechaInicio;
        private LocalDate fechaFin;
    }

    /* POST /api/licencias */
    @Data
    public static class LicenciaCreateRequest {
        private Long personalId;
        private LocalDate fechaInicio;
        private LocalDate fechaFin;
        private String tipoLicencia;
        private String motivo;
        private Boolean justificada;
    }

    public static class AsistenciaPersonalRequest {
        private Long personalId;
        private LocalDate fecha;
        private LocalTime horaEntrada;
        private LocalTime horaSalida;
        private Boolean falta;
        private Boolean justificada;
        private String motivo;
    }

    public static class AsistenciaPersonalResponse {
        private String nombreDocente;
        private LocalDate fecha;
        private String estado;      // PRESENTE, AUSENTE-JUSTIFICADA, AUSENTE-INJUSTIFICADA
        private Integer horasTrabajadas;
        private String motivo;
    }
    /* ========== MÓDULO 6 – ACTAS DE ACCIDENTES ========== */

    /* POST /api/actas-accidente */
    @Data
    public static class ActaAccidenteCreateRequest {
        private Long alumnoId;
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
        private LocalDateTime fechaAccidente;
        private String lugar;
        private String descripcion;
        private String accionesTomadas;
    }

    /* GET /api/actas-accidente */
    @Data
    public static class ActaAccidenteResponse {
        private Long id;
        private String alumno;
        private String docente;
        private LocalDateTime fechaAccidente;
        private String lugar;
        private String descripcion;
        private String accionesTomadas;
        private Boolean editable; // <2 days
    }

    /* ========== MÓDULO 7 – MATRÍCULA, CUOTAS Y PAGOS ========== */

    /* POST /api/cuotas */
    @Data
    public static class CuotaCreateRequest {
        private String nombre;
        private BigDecimal monto;
        private LocalDate fechaVencimiento;
        private BigDecimal recargoPorVencimiento;
        private Set<Long> seccionesIds;
        private Boolean esMatricula;
    }

    /* POST /api/pagos */
    @Data
    public static class PagoCreateRequest {
        private Long cuotaId;
        private Long matriculaId;
        private BigDecimal montoPagado;
        private LocalDate fechaPago;
        private String medioPago;
    }

    /* GET /api/familias/{id}/cuotas */
    @Data
    public static class CuotaFamiliaResponse {
        private Long id;
        private String concepto;
        private String mesAnio;
        private BigDecimal monto;
        private String estado;
        private LocalDate fechaVencimiento;
        private String codigoPago;
    }


    /* ========== MÓDULO 9 – REPORTES ========== */

    /* GET /api/reportes/boletines?seccionId= */
    @Data
    public static class BoletinAlumnoResponse {
        private String nombreCompleto;
        private String seccion;
        private BigDecimal promedioGeneral;
        private BigDecimal porcentajeAsistencia;
        private List<NotaMateria> materias;
    }

    @Data
    public static class NotaMateria {
        private String materia;
        private String docente;
        private String nota;
        private String observaciones;
    }

    /* GET /api/reportes/aprobados-desaprobados?nivel=PRIMARIO */
    @Data
    public static class ResumenAprobacionResponse {
        private long totalAlumnos;
        private long alumnosConMateriasAdeudadas;
        private BigDecimal porcentajeAprobado;
        private BigDecimal porcentajeDesaprobado;
        private String materiaMasDesaprobada;
    }

    /* GET /api/reportes/asistencias */
    @Data
    public static class ReporteAsistenciaResponse {
        private long diasHabiles;
        private BigDecimal promedioNivelPrimario;
        private BigDecimal promedioNivelInicial;
        private List<AsistenciaAlumnoResponse> detalles;
    }

    /* GET /api/reportes/inasistencias-docentes */
    @Data
    public static class InasistenciaDocenteResponse {
        private String nombreDocente;
        private LocalDate fecha;
        private Integer horas;
        private String estado;
        private String motivo;
        private Boolean cubierto;
    }

    /* GET /api/reportes/actas */
    @Data
    public static class ReporteActaResponse {
        private Long id;
        private String alumno;
        private String docente;
        private LocalDateTime fecha;
        private String descripcion;
        private Boolean firmada;
    }

    /* ========== UTILS ========== */

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class IdWrapper {
        private Long id;
    }

    private EcepDtos() {
        // static holder
    }
}