package edu.ecep.base_app.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AspiranteFamiliarDTO {
    Long id;
    Long aspiranteId;
    Long familiarId;
    String parentesco;
    Boolean convive;
}
