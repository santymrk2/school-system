package edu.ecep.base_app.dtos;

import edu.ecep.base_app.domain.enums.UserRole;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;


@Getter
@Setter
@NoArgsConstructor
public class UsuarioBusquedaDTO {
    private Long id;
    private String email;
    private Set<UserRole> userRoles;
    private Long personaId;
    private String nombreCompleto;
    private String dni;
    private String tipoPersona;

    public UsuarioBusquedaDTO(Long id, String email, Set<UserRole> userRoles,
                              Long personaId, String nombreCompleto,
                              String dni, String tipoPersona) {
        this.id = id;
        this.email = email;
        this.userRoles = userRoles;
        this.personaId = personaId;
        this.nombreCompleto = nombreCompleto;
        this.dni = dni;
        this.tipoPersona = tipoPersona;
    }

}


