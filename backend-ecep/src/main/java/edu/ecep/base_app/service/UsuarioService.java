package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.*;
import edu.ecep.base_app.mappers.UsuarioBusquedaMapper;
import edu.ecep.base_app.dtos.UsuarioBusquedaDTO;
import edu.ecep.base_app.dtos.UsuarioDTO;
import edu.ecep.base_app.repos.*;
import edu.ecep.base_app.util.NotFoundException;
import edu.ecep.base_app.util.ReferencedException;
import edu.ecep.base_app.util.ReferencedWarning;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final AlumnoRepository alumnoRepository;
    private final EmpleadoRepository empleadoRepository;
    private final FamiliarRepository familiarRepository;
    private final AspiranteRepository aspiranteRepository;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            AlumnoRepository alumnoRepository,
            EmpleadoRepository empleadoRepository,
            FamiliarRepository familiarRepository,
            AspiranteRepository aspiranteRepository
    ) {
        this.usuarioRepository = usuarioRepository;
        this.alumnoRepository = alumnoRepository;
        this.empleadoRepository = empleadoRepository;
        this.familiarRepository = familiarRepository;
        this.aspiranteRepository = aspiranteRepository;
    }

    public List<UsuarioDTO> findAll() {
        return usuarioRepository.findAll(Sort.by("id")).stream()
                .map(u -> mapToDTO(u, new UsuarioDTO()))
                .toList();
    }

    public UsuarioDTO get(final Long id) {
        return usuarioRepository.findById(id)
                .map(u -> mapToDTO(u, new UsuarioDTO()))
                .orElseThrow(NotFoundException::new);
    }

    public Long create(final UsuarioDTO dto) {
        Usuario u = new Usuario();
        mapToEntity(dto, u);
        return usuarioRepository.save(u).getId();
    }

    public void update(final Long id, final UsuarioDTO dto) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(NotFoundException::new);
        mapToEntity(dto, u);
        usuarioRepository.save(u);
    }

    @Transactional
    public void delete(Long id) {
        var usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario no encontrado: " + id));

        var warn = getReferencedWarning(usuario);
        if (warn != null) throw new ReferencedException(warn);

        usuarioRepository.deleteById(id);
    }

    public ReferencedWarning getReferencedWarning(Usuario usuario) {
        Persona persona = usuario.getPersona();
        if (persona == null || persona.getId() == null) return null;

        Long personaId = persona.getId();

        if (alumnoRepository.existsByPersonaId(personaId)) {
            ReferencedWarning w = new ReferencedWarning("usuario.referenciado.alumno");
            w.addParam(usuario.getId());
            return w;
        }
        if (empleadoRepository.existsByPersonaId(personaId)) {
            ReferencedWarning w = new ReferencedWarning("usuario.referenciado.empleado");
            w.addParam(usuario.getId());
            return w;
        }
        if (familiarRepository.existsByPersonaId(personaId)) {
            ReferencedWarning w = new ReferencedWarning("usuario.referenciado.familiar");
            w.addParam(usuario.getId());
            return w;
        }
        if (aspiranteRepository.existsByPersonaId(personaId)) {
            ReferencedWarning w = new ReferencedWarning("usuario.referenciado.aspirante");
            w.addParam(usuario.getId());
            return w;
        }
        return null;
    }



    public Usuario findById(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
    }

    public Usuario getCurrent() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        return (Usuario) auth.getDetails();
    }

    public UsuarioBusquedaDTO buscarUsuarioBusquedaPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        return UsuarioBusquedaMapper.toDto(usuario);
    }



    public List<UsuarioBusquedaDTO> buscarUsuariosConTipo(String q, Long currentId) {
        String query = (q == null) ? "" : q.toLowerCase();

        return usuarioRepository.findAll().stream()
                .filter(u -> !u.getId().equals(currentId)) // excluye el usuario actual
                .filter(u -> {
                    if (query.isEmpty()) return true;
                    boolean matchEmail = u.getEmail() != null && u.getEmail().toLowerCase().contains(query);
                    boolean matchPersona = u.getPersona() != null && (
                            (u.getPersona().getNombre() != null && u.getPersona().getNombre().toLowerCase().contains(query)) ||
                                    (u.getPersona().getApellido() != null && u.getPersona().getApellido().toLowerCase().contains(query)) ||
                                    (u.getPersona().getDni() != null && u.getPersona().getDni().toLowerCase().contains(query))
                    );
                    return matchEmail || matchPersona;
                })
                .map(UsuarioBusquedaMapper::toDto)
                .toList();
    }


    /* ---------- mappers ---------- */
    private UsuarioDTO mapToDTO(Usuario u, UsuarioDTO dto) {
        dto.setId(u.getId());
        dto.setEmail(u.getEmail());
        dto.setPassword(u.getPassword());
        dto.setUserRoles(u.getUserRoles());
        return dto;
    }

    private void mapToEntity(UsuarioDTO dto, Usuario u) {
        u.setEmail(dto.getEmail());
        u.setPassword(dto.getPassword());
        u.setUserRoles(dto.getUserRoles());
    }

}