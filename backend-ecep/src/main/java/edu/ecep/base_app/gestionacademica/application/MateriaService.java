package edu.ecep.base_app.gestionacademica.application;

import edu.ecep.base_app.gestionacademica.domain.Materia;
import edu.ecep.base_app.gestionacademica.infrastructure.mapper.MateriaMapper;
import edu.ecep.base_app.gestionacademica.infrastructure.persistence.MateriaRepository;
import edu.ecep.base_app.gestionacademica.presentation.dto.MateriaCreateDTO;
import edu.ecep.base_app.gestionacademica.presentation.dto.MateriaDTO;
import edu.ecep.base_app.shared.exception.NotFoundException;

import java.util.List;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


@Service @RequiredArgsConstructor
public class MateriaService {
    private final MateriaRepository repo;
    private final MateriaMapper mapper;

    public List<MateriaDTO> findAll() {
        return repo.findAll(Sort.by("nombre")).stream().map(mapper::toDto).toList();
    }

    public Long create(MateriaCreateDTO dto) {
        if (repo.existsByNombreIgnoreCase(dto.getNombre())) {
            throw new IllegalArgumentException("Ya existe una materia con ese nombre");
        }
        return repo.save(mapper.toEntity(dto)).getId();
    }

    public MateriaDTO get(Long id) {
        return repo.findById(id)
                .map(mapper::toDto)
                .orElseThrow(NotFoundException::new);
    }

    public void update(Long id, MateriaCreateDTO dto) {
        var materia = repo.findById(id).orElseThrow(NotFoundException::new);
        if (dto.getNombre() != null && !dto.getNombre().equalsIgnoreCase(materia.getNombre())
                && repo.existsByNombreIgnoreCase(dto.getNombre())) {
            throw new IllegalArgumentException("Ya existe una materia con ese nombre");
        }
        materia.setNombre(dto.getNombre());
        repo.save(materia);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new NotFoundException();
        }
        repo.deleteById(id);
    }
}
