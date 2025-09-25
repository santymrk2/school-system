package edu.ecep.base_app.vidaescolar.application;

import edu.ecep.base_app.identidad.domain.Empleado;
import edu.ecep.base_app.identidad.domain.enums.RolEmpleado;
import edu.ecep.base_app.identidad.infrastructure.persistence.EmpleadoRepository;
import edu.ecep.base_app.vidaescolar.domain.ActaAccidente;
import edu.ecep.base_app.vidaescolar.presentation.dto.ActaAccidenteCreateDTO;
import edu.ecep.base_app.vidaescolar.presentation.dto.ActaAccidenteDTO;
import edu.ecep.base_app.vidaescolar.presentation.dto.ActaAccidenteUpdateDTO;
import edu.ecep.base_app.vidaescolar.domain.enums.EstadoActaAccidente;
import edu.ecep.base_app.vidaescolar.infrastructure.mapper.ActaAccidenteMapper;
import edu.ecep.base_app.vidaescolar.infrastructure.persistence.ActaAccidenteRepository;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

// src/main/java/.../ActaAccidenteService.java
@Service @RequiredArgsConstructor
public class ActaAccidenteService {
    private final ActaAccidenteRepository repo;
    private final ActaAccidenteMapper mapper;
    private final EmpleadoRepository empleadoRepository;

    public List<ActaAccidenteDTO> findAll(){
        return repo.findAll(Sort.by("fechaSuceso").descending())
                .stream().map(mapper::toDto).toList();
    }

    public ActaAccidenteDTO get(Long id){
        return repo.findById(id)
                .map(mapper::toDto)
                .orElseThrow(() -> new EntityNotFoundException("Acta no encontrada: " + id));
    }

    public Long create(ActaAccidenteCreateDTO dto){
        if (ChronoUnit.DAYS.between(dto.getFechaSuceso(), LocalDate.now()) > 2)
            throw new IllegalArgumentException("Fuera de ventana de edición");
        validateFirmante(dto.getFirmanteId());
        return repo.save(mapper.toEntity(dto)).getId();
    }

    public void update(Long id, ActaAccidenteUpdateDTO dto){
        ActaAccidente acta = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Acta no encontrada: " + id));

        Long currentInformanteId = acta.getInformante() != null ? acta.getInformante().getId() : null;

        boolean coreDataChanged =
                !Objects.equals(acta.getAlumno().getId(), dto.alumnoId()) ||
                !Objects.equals(currentInformanteId, dto.informanteId()) ||
                !Objects.equals(acta.getFechaSuceso(), dto.fechaSuceso()) ||
                !Objects.equals(acta.getHoraSuceso(), dto.horaSuceso()) ||
                !Objects.equals(acta.getLugar(), dto.lugar()) ||
                !Objects.equals(acta.getAcciones(), dto.acciones()) ||
                !Objects.equals(acta.getDescripcion(), dto.descripcion());

        if (coreDataChanged) {
            long diffOriginal = ChronoUnit.DAYS.between(acta.getFechaSuceso(), LocalDate.now());
            long diffNueva = ChronoUnit.DAYS.between(dto.fechaSuceso(), LocalDate.now());
            if (diffOriginal > 2 || diffNueva > 2) {
                throw new IllegalArgumentException("Fuera de ventana de edición");
            }
        }

        Empleado previousFirmante = acta.getFirmante();

        validateFirmante(dto.firmanteId());

        Long firmanteForEstadoFirmada = dto.firmanteId() != null
                ? dto.firmanteId()
                : previousFirmante != null ? previousFirmante.getId() : null;

        if (dto.estado() == EstadoActaAccidente.FIRMADA && firmanteForEstadoFirmada == null) {
            throw new IllegalArgumentException("El acta firmada debe tener una dirección asignada como firmante");
        }

        mapper.applyUpdate(acta, dto);

        if (dto.firmanteId() == null && dto.estado() == EstadoActaAccidente.FIRMADA && previousFirmante != null) {
            acta.setFirmante(previousFirmante);
        }
        repo.save(acta);
    }


    public void delete(Long id){
        ActaAccidente acta = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Acta no encontrada: " + id));

        // (Con seguridad: sólo Dirección. @SQLDelete hará soft delete.)
        repo.delete(acta);
    }

    private void validateFirmante(Long firmanteId) {
        if (firmanteId == null) {
            return;
        }

        Empleado empleado = empleadoRepository
                .findById(firmanteId)
                .orElseThrow(() -> new EntityNotFoundException("Firmante no encontrado: " + firmanteId));

        if (empleado.getRolEmpleado() != RolEmpleado.DIRECCION) {
            throw new IllegalArgumentException("El firmante debe pertenecer a Dirección");
        }
    }
}
