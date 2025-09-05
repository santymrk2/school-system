package edu.ecep.base_app.dtos;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class AspiranteDTO {
    Long id;
    String nombre;
    String apellido;
    String email;
    String dni;
}
