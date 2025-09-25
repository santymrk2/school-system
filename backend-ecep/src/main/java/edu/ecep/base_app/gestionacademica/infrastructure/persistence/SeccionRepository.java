package edu.ecep.base_app.gestionacademica.infrastructure.persistence;

import edu.ecep.base_app.gestionacademica.domain.Seccion;
import java.util.List;

import edu.ecep.base_app.shared.domain.enums.NivelAcademico;
import edu.ecep.base_app.shared.domain.enums.Turno;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;


public interface SeccionRepository extends JpaRepository<Seccion, Long> {
    boolean existsByPeriodoEscolarIdAndNivelAndGradoSalaAndDivisionAndTurno(Long periodoId, NivelAcademico nivel, String gradoSala, String division, Turno turno);

    List<Seccion> findAllByPeriodoEscolarActivoTrue(Sort sort);
}
