package edu.ecep.base_app.mappers;

import edu.ecep.base_app.domain.Usuario;
import edu.ecep.base_app.dtos.UsuarioBusquedaDTO;

public class UsuarioBusquedaMapper {

    public static UsuarioBusquedaDTO toDto(Usuario usuario) {
        return new UsuarioBusquedaDTO(
                usuario.getId(),
                usuario.getEmail(),
                usuario.getUserRoles(),
                usuario.getPersona() != null ? usuario.getPersona().getId() : null,
                usuario.getPersona() != null
                        ? usuario.getPersona().getNombre() + " " + usuario.getPersona().getApellido()
                        : null,
                usuario.getPersona() != null ? usuario.getPersona().getDni() : null,
                usuario.getPersona() != null ? usuario.getPersona().getClass().getSimpleName() : null
        );
    }
}

