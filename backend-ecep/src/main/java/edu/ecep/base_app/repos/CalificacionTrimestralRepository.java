package edu.ecep.base_app.repos;

import edu.ecep.base_app.domain.CalificacionTrimestral;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CalificacionTrimestralRepository extends JpaRepository<CalificacionTrimestral, Long> {
    boolean existsByTrimestreIdAndSeccionMateriaIdAndMatriculaId(Long trimestreId, Long seccionMateriaId, Long matriculaId);
}
