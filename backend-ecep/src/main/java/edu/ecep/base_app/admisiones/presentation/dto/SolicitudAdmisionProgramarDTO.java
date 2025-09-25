package edu.ecep.base_app.admisiones.presentation.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudAdmisionProgramarDTO {
    @NotEmpty
    private List<LocalDate> fechasPropuestas;
    private String documentosRequeridos;
    private List<String> adjuntosInformativos;
    private Boolean cupoDisponible;
    private String disponibilidadCurso;
    @NotEmpty
    private List<String> rangosHorarios;
    private String aclaracionesDireccion;
}
