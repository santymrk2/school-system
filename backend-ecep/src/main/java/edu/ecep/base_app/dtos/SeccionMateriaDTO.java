package edu.ecep.base_app.dtos;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeccionMateriaDTO {
    Long id;
    @NotNull
    Long seccionId;
    @NotNull
    Long materiaId;
}
