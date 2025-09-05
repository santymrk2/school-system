package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.Materia;
import edu.ecep.base_app.dtos.MateriaCreateDTO;
import edu.ecep.base_app.dtos.MateriaDTO;
import edu.ecep.base_app.mappers.MateriaMapper;
import edu.ecep.base_app.repos.*;
import edu.ecep.base_app.util.NotFoundException;

import java.util.List;

import edu.ecep.base_app.util.ReferencedException;
import edu.ecep.base_app.util.ReferencedWarning;
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
}

