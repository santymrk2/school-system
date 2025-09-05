package edu.ecep.base_app.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// =============================================================
// 3) Personas, vínculos y matrícula
// =============================================================
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlumnoDTO {
    Long id;
    @NotBlank
    String nombre;
    @NotBlank
    String apellido;
    String documento;
}
