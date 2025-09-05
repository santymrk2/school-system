package edu.ecep.base_app.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InformeInicialDTO {
    Long id;
    @NotNull
    Long trimestreId;
    @NotNull
    Long matriculaId;
    @NotBlank
    String descripcion;
    boolean publicado;
}
