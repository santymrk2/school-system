package edu.ecep.base_app.gestionacademica.application;

import edu.ecep.base_app.gestionacademica.domain.Trimestre;
import edu.ecep.base_app.gestionacademica.domain.TrimestreEstado;
import edu.ecep.base_app.gestionacademica.presentation.dto.CalificacionTrimestralCreateDTO;
import edu.ecep.base_app.gestionacademica.presentation.dto.CalificacionTrimestralDTO;
import edu.ecep.base_app.gestionacademica.infrastructure.mapper.CalificacionTrimestralMapper;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.CalificacionTrimestralRepository;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.TrimestreRepository;
import edu.ecep.base_app.identidad.application.PersonaAccountService;
import edu.ecep.base_app.identidad.domain.enums.UserRole;
import edu.ecep.base_app.shared.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service @RequiredArgsConstructor
public class CalificacionTrimestralService {
    private final CalificacionTrimestralRepository repo; private final CalificacionTrimestralMapper mapper; private final TrimestreRepository trimRepo; private final PersonaAccountService personaAccountService;
    public List<CalificacionTrimestralDTO> findAll(){
        if(shouldRestrictToClosedTrimestres()) {
            return repo.findByTrimestreEstado(TrimestreEstado.CERRADO).stream().map(mapper::toDto).toList();
        }
        return repo.findAll().stream().map(mapper::toDto).toList();
    }
    public CalificacionTrimestralDTO get(Long id){
        return repo.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() -> new NotFoundException("No encontrado"));
    }
    public Long create(CalificacionTrimestralCreateDTO dto){
        Trimestre tri = trimRepo.findById(dto.getTrimestreId()).orElseThrow(() -> new NotFoundException("No encontrado"));
        if(tri.getEstado() != TrimestreEstado.ACTIVO) {
            throw new IllegalArgumentException("El trimestre no está activo");
        }
        if(repo.existsByTrimestreIdAndSeccionMateriaIdAndMatriculaId(dto.getTrimestreId(), dto.getSeccionMateriaId(), dto.getMatriculaId()))
            throw new IllegalArgumentException("Calificación trimestral duplicada");
        return repo.save(mapper.toEntity(dto)).getId();
    }

    public void update(Long id, CalificacionTrimestralDTO dto){
        var entity = repo.findById(id).orElseThrow(() -> new NotFoundException("No encontrado"));
        var trimestre = trimRepo.findById(dto.getTrimestreId()).orElseThrow(() -> new NotFoundException("No encontrado"));
        if(trimestre.getEstado() != TrimestreEstado.ACTIVO) {
            throw new IllegalArgumentException("El trimestre no está activo");
        }
        mapper.update(entity, dto);
        repo.save(entity);
    }

    public void delete(Long id){
        if(!repo.existsById(id)) throw new NotFoundException("No encontrado");
        repo.deleteById(id);
    }

    private boolean shouldRestrictToClosedTrimestres() {
        try {
            var persona = personaAccountService.getCurrentPersona();
            if(persona == null || persona.getRoles() == null || persona.getRoles().isEmpty()) {
                return false;
            }
            if(!persona.getRoles().contains(UserRole.FAMILY)) {
                return false;
            }
            for (UserRole role : persona.getRoles()) {
                if(role != UserRole.FAMILY && role != UserRole.USER) {
                    return false;
                }
            }
            return true;
        } catch (ResponseStatusException ex) {
            return false;
        }
    }
}
