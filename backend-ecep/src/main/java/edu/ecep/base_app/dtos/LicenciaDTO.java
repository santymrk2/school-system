package edu.ecep.base_app.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LicenciaDTO {
    private Long id;
    @NotNull
    private Long personalId;
    @NotNull private LocalDate desde;  // <- renombrado
    private LocalDate hasta;           // <- renombrado
    @NotBlank
    private String motivo;
    // Si tu entidad realmente tiene tipoLicencia, agregalo acá.
}
