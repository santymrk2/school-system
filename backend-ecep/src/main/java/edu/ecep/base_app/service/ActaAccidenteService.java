package edu.ecep.base_app.service;

import edu.ecep.base_app.domain.ActaAccidente;
import edu.ecep.base_app.dtos.ActaAccidenteCreateDTO;
import edu.ecep.base_app.dtos.ActaAccidenteDTO;
import edu.ecep.base_app.dtos.ActaAccidenteUpdateDTO;
import edu.ecep.base_app.mappers.ActaAccidenteMapper;
import edu.ecep.base_app.repos.ActaAccidenteRepository;
import edu.ecep.base_app.util.NotFoundException;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

// src/main/java/.../ActaAccidenteService.java
@Service @RequiredArgsConstructor
public class ActaAccidenteService {
    private final ActaAccidenteRepository repo;
    private final ActaAccidenteMapper mapper;

    public List<ActaAccidenteDTO> findAll(){
        return repo.findAll(Sort.by("fechaSuceso").descending())
                .stream().map(mapper::toDto).toList();
    }

    public Long create(ActaAccidenteCreateDTO dto){
        if (ChronoUnit.DAYS.between(dto.getFechaSuceso(), LocalDate.now()) > 2)
            throw new IllegalArgumentException("Fuera de ventana de edición");
        return repo.save(mapper.toEntity(dto)).getId();
    }

    public void update(Long id, ActaAccidenteUpdateDTO dto){
        ActaAccidente acta = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Acta no encontrada: " + id));

        long diffOriginal = ChronoUnit.DAYS.between(acta.getFechaSuceso(), LocalDate.now());
        long diffNueva    = ChronoUnit.DAYS.between(dto.fechaSuceso(), LocalDate.now());
        if (diffOriginal > 2 || diffNueva > 2) {
            throw new IllegalArgumentException("Fuera de ventana de edición");
        }

        mapper.applyUpdate(acta, dto);
        repo.save(acta);
    }


    public void delete(Long id){
        ActaAccidente acta = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Acta no encontrada: " + id));

        // (Con seguridad: sólo Dirección. @SQLDelete hará soft delete.)
        repo.delete(acta);
    }
}
