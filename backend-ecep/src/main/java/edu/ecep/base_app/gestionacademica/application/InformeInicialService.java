package edu.ecep.base_app.gestionacademica.application;

import edu.ecep.base_app.gestionacademica.domain.InformeInicial;
import edu.ecep.base_app.gestionacademica.domain.TrimestreEstado;
import edu.ecep.base_app.gestionacademica.presentation.dto.InformeInicialCreateDTO;
import edu.ecep.base_app.gestionacademica.presentation.dto.InformeInicialDTO;
import edu.ecep.base_app.gestionacademica.presentation.dto.InformeInicialUpdateDTO;
import edu.ecep.base_app.gestionacademica.infrastructure.mapper.InformeInicialMapper;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.InformeInicialRepository;
import edu.ecep.base_app.identidad.application.PersonaAccountService;
import edu.ecep.base_app.identidad.domain.enums.UserRole;
import edu.ecep.base_app.shared.exception.NotFoundException;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;


@Service @RequiredArgsConstructor
public class InformeInicialService {
    private final InformeInicialRepository repo; private final InformeInicialMapper mapper; private final PersonaAccountService personaAccountService;
    public List<InformeInicialDTO> findAll(){
        var informes = shouldRestrictToClosedTrimestres()
                ? repo.findByTrimestreEstado(TrimestreEstado.CERRADO)
                : repo.findAll();
        return informes.stream().map(mapper::toDto).toList();
    }
    public InformeInicialDTO get(Long id){
        var informe = shouldRestrictToClosedTrimestres()
                ? repo.findByIdAndTrimestreEstado(id, TrimestreEstado.CERRADO)
                : repo.findById(id);
        return informe.map(mapper::toDto).orElseThrow(NotFoundException::new);
    }
    public Long create(InformeInicialCreateDTO dto) {
        return repo.save(mapper.toEntity(dto)).getId();
    }
    public void update(Long id, InformeInicialUpdateDTO dto) {
        InformeInicial e = repo.findById(id).orElseThrow(NotFoundException::new);
        String descripcion = dto.getDescripcion() == null ? null : dto.getDescripcion().trim();
        e.setDescripcion(descripcion);
        if(dto.getPublicado() != null) {
            e.setPublicado(dto.getPublicado());
        }
        repo.save(e);
    }
    public void delete(Long id){
        if(!repo.existsById(id)) throw new NotFoundException();
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
