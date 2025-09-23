package edu.ecep.base_app.admisiones.presentation.dto;

import edu.ecep.base_app.admisiones.domain.enums.Curso;
import edu.ecep.base_app.shared.domain.enums.Turno;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class AspiranteDTO {
    Long id;
    @NotNull
    Long personaId;

    @Enumerated(EnumType.STRING)
    Turno turnoPreferido;
    String escuelaActual;
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
    @Enumerated(EnumType.STRING)
    Curso cursoSolicitado;

}
