package edu.ecep.base_app.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FamiliarDTO {
    Long id;
    @NotBlank
    String nombre;
    @NotBlank
    String apellido;
    String documento;
}
