package edu.ecep.base_app.identidad.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlumnoDTO {
    Long id;
    @NotNull
    Long personaId;

    LocalDate fechaInscripcion;
    String observacionesGenerales;
    String motivoRechazoBaja;
    String conectividadInternet;
    String dispositivosDisponibles;
    String idiomasHabladosHogar;
    String enfermedadesAlergias;
    String medicacionHabitual;
    String limitacionesFisicas;
    String tratamientosTerapeuticos;
    Boolean usoAyudasMovilidad;
    String coberturaMedica;
    String observacionesSalud;

    // Datos visibles para listados
    String nombre;
    String apellido;
    String dni;

    Long seccionActualId;
    String seccionActualNombre;
    String seccionActualTurno;
}
