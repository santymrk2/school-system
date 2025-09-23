package edu.ecep.base_app.gestionacademica.infrastructure.persistence;

import edu.ecep.base_app.gestionacademica.domain.CalificacionTrimestral;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CalificacionTrimestralRepository extends JpaRepository<CalificacionTrimestral, Long> {
    boolean existsByTrimestreIdAndSeccionMateriaIdAndMatriculaId(Long trimestreId, Long seccionMateriaId, Long matriculaId);
}
