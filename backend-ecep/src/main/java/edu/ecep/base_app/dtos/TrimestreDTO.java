package edu.ecep.base_app.dtos;

import edu.ecep.base_app.domain.TrimestreEstado;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrimestreDTO {
    Long id;
    @NotNull
    Long periodoEscolarId;
    @NotNull
    @Min(1)
    @Max(3)
    Integer orden;
    @NotNull
    LocalDate inicio;
    @NotNull
    LocalDate fin;
    TrimestreEstado estado;
}
