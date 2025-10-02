package edu.ecep.base_app.vidaescolar.infrastructure.persistence;

import edu.ecep.base_app.vidaescolar.domain.SolicitudBajaAlumno;
import edu.ecep.base_app.vidaescolar.domain.enums.EstadoSolicitudBaja;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SolicitudBajaAlumnoRepository extends JpaRepository<SolicitudBajaAlumno, Long> {
    List<SolicitudBajaAlumno> findAllByEstadoOrderByFechaDecisionDesc(EstadoSolicitudBaja estado);
}

