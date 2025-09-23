package edu.ecep.base_app.gestionacademica.presentation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeccionMateriaCreateDTO {
    @NotNull
    Long seccionId;
    @NotNull
    Long materiaId;
}
