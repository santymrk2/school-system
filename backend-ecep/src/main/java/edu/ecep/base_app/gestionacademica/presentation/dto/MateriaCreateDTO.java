package edu.ecep.base_app.gestionacademica.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MateriaCreateDTO {
    String codigo;
    @NotBlank
    String nombre;
}
