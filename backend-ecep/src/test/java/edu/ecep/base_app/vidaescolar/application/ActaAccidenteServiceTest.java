package edu.ecep.base_app.vidaescolar.application;

import edu.ecep.base_app.identidad.domain.Alumno;
import edu.ecep.base_app.identidad.domain.Empleado;
import edu.ecep.base_app.identidad.domain.enums.RolEmpleado;
import edu.ecep.base_app.vidaescolar.domain.ActaAccidente;
import edu.ecep.base_app.vidaescolar.domain.enums.EstadoActaAccidente;
import edu.ecep.base_app.vidaescolar.infrastructure.mapper.ActaAccidenteMapper;
import edu.ecep.base_app.vidaescolar.infrastructure.persistence.ActaAccidenteRepository;
import edu.ecep.base_app.vidaescolar.presentation.dto.ActaAccidenteUpdateDTO;
import edu.ecep.base_app.identidad.infrastructure.persistence.EmpleadoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ActaAccidenteServiceTest {

    @Mock
    private ActaAccidenteRepository repo;

    @Mock
    private ActaAccidenteMapper mapper;

    @Mock
    private EmpleadoRepository empleadoRepository;

    @InjectMocks
    private ActaAccidenteService service;

    private LocalDate fechaSuceso;
    private LocalTime horaSuceso;

    @BeforeEach
    void setUp() {
        fechaSuceso = LocalDate.now();
        horaSuceso = LocalTime.NOON;

        doAnswer(invocation -> {
            ActaAccidente target = invocation.getArgument(0);
            ActaAccidenteUpdateDTO dto = invocation.getArgument(1);

            target.setAlumno(alumno(dto.alumnoId()));
            target.setInformante(empleado(dto.informanteId(), RolEmpleado.DOCENTE));
            target.setFechaSuceso(dto.fechaSuceso());
            target.setHoraSuceso(dto.horaSuceso());
            target.setLugar(dto.lugar());
            target.setDescripcion(dto.descripcion());
            target.setAcciones(dto.acciones());
            target.setEstado(dto.estado());
            target.setCreadoPor(dto.creadoPor());

            if (dto.firmanteId() != null) {
                target.setFirmante(empleado(dto.firmanteId(), RolEmpleado.DIRECCION));
            } else {
                target.setFirmante(null);
            }

            return null;
        }).when(mapper).applyUpdate(any(ActaAccidente.class), any(ActaAccidenteUpdateDTO.class));

        when(repo.save(any(ActaAccidente.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void update_shouldRemoveFirmante_whenNullAndNotFirmada() {
        ActaAccidente acta = actaConFirmante(42L, EstadoActaAccidente.CERRADA);
        ActaAccidenteUpdateDTO dto = updateDto(EstadoActaAccidente.CERRADA, null);

        when(repo.findById(eq(1L))).thenReturn(Optional.of(acta));

        service.update(1L, dto);

        assertNull(acta.getFirmante(), "El firmante debería eliminarse cuando se envía null");
        verify(repo).save(acta);
    }

    @Test
    void update_shouldKeepExistingFirmante_whenFirmadaAndIdOmitted() {
        ActaAccidente acta = actaConFirmante(99L, EstadoActaAccidente.CERRADA);
        ActaAccidenteUpdateDTO dto = updateDto(EstadoActaAccidente.FIRMADA, null);

        when(repo.findById(eq(2L))).thenReturn(Optional.of(acta));

        service.update(2L, dto);

        assertNotNull(acta.getFirmante(), "Debe conservarse el firmante existente al firmar el acta");
        assertEquals(99L, acta.getFirmante().getId());
        verify(repo).save(acta);
    }

    @Test
    void update_shouldRejectFirmada_withoutFirmante() {
        ActaAccidente acta = actaConFirmante(null, EstadoActaAccidente.CERRADA);
        ActaAccidenteUpdateDTO dto = updateDto(EstadoActaAccidente.FIRMADA, null);

        when(repo.findById(eq(3L))).thenReturn(Optional.of(acta));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> service.update(3L, dto));
        assertEquals("El acta firmada debe tener una dirección asignada como firmante", ex.getMessage());
        verify(repo, never()).save(any(ActaAccidente.class));
        verify(mapper, never()).applyUpdate(any(), any());
    }

    private ActaAccidente actaConFirmante(Long firmanteId, EstadoActaAccidente estado) {
        ActaAccidente acta = new ActaAccidente();
        acta.setAlumno(alumno(1L));
        acta.setInformante(empleado(2L, RolEmpleado.DOCENTE));
        acta.setFechaSuceso(fechaSuceso);
        acta.setHoraSuceso(horaSuceso);
        acta.setLugar("Patio");
        acta.setDescripcion("Descripción");
        acta.setAcciones("Acciones");
        acta.setEstado(estado);
        acta.setCreadoPor("tester");

        if (firmanteId != null) {
            acta.setFirmante(empleado(firmanteId, RolEmpleado.DIRECCION));
        }

        return acta;
    }

    private ActaAccidenteUpdateDTO updateDto(EstadoActaAccidente estado, Long firmanteId) {
        return new ActaAccidenteUpdateDTO(
                1L,
                2L,
                fechaSuceso,
                horaSuceso,
                "Patio",
                "Descripción",
                "Acciones",
                estado,
                firmanteId,
                "tester"
        );
    }

    private Alumno alumno(Long id) {
        Alumno alumno = new Alumno();
        alumno.setId(id);
        return alumno;
    }

    private Empleado empleado(Long id, RolEmpleado rol) {
        Empleado empleado = new Empleado();
        empleado.setId(id);
        empleado.setRolEmpleado(rol);
        return empleado;
    }
}

