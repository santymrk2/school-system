package edu.ecep.base_app.vidaescolar.infrastructure.persistence;

import edu.ecep.base_app.vidaescolar.domain.SolicitudBajaAlumno;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SolicitudBajaAlumnoRepository extends JpaRepository<SolicitudBajaAlumno, Long> {}

