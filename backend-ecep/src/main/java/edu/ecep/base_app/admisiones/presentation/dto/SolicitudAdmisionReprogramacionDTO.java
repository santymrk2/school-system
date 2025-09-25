package edu.ecep.base_app.admisiones.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudAdmisionReprogramacionDTO {
    @NotBlank
    private String comentario;
}
